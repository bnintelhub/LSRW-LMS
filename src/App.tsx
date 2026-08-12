import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  Flag,
  Headphones,
  Home,
  LogOut,
  Mic,
  MonitorDot,
  PencilLine,
  Play,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  UserRound,
  Users,
  ClipboardList,
  FileText,
} from "lucide-react";
import {
  flexRender,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  type LegacyColumnDef,
  legacyCreateColumnHelper,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import {
  ListeningLab,
  ReadingLab,
  SpeakingLab,
  WritingLab,
} from "./features/student/labs";
import {
  ListeningGame,
  ReadingGame,
  SpeakingGame,
  WritingGame,
} from "./features/student/games";
import { StudentDailyTasks } from "./features/student/DailyTasks";
import { StudentDailyReport } from "./features/student/DailyReport";
import { DailyTaskDesk } from "./features/teacher/DailyTaskDesk";
import { SchoolCrmReports } from "./features/admin/SchoolCrmReports";
import { useCrm } from "./context/CrmContext";
import { todayISO } from "./lib/aiTaskGenerator";

/** Class 1–4: game labs. Class 5–12: AI Speaking/Listening/Reading/Writing labs. */
function isGameBand(classNumber: number) {
  return classNumber < 5;
}

type Role = "admin" | "teacher" | "student";
type Skill = "Listening" | "Speaking" | "Reading" | "Writing";
type Profile = "Foundational" | "Elementary" | "Exam-Track" | "Advanced";
type Activity = Skill | "Idle";
type View = "home" | "tasks" | "report" | Skill;

type Scores = Record<Skill, number>;


type Student = {
  id: string;
  name: string;
  classNumber: number;
  section: "A" | "B";
  roll: number;
  mobile: string;
  dob: string;
  userId: string;
  password: string;
  scores: Scores;
  xp: number;
  streak: number;
  coins: number;
};

type Teacher = {
  id: string;
  name: string;
  userId: string;
  password: string;
  band: Profile;
  allotted: { classNumber: number; section: "A" | "B" }[];
};

type Account = {
  id: string;
  label: string;
  role: Role;
  userId: string;
  password: string;
  studentId?: string;
  teacherId?: string;
};

type Session =
  | { role: "admin"; account: Account }
  | { role: "teacher"; account: Account; teacherId: string }
  | { role: "student"; account: Account; studentId: string; classNumber: number };

type AppState = {
  session: Session | null;
  students: Student[];
};

type AppAction =
  | { type: "login"; session: Session }
  | { type: "logout" }
  | { type: "addStudents"; students: Student[] }
  | { type: "resetPassword"; studentId: string; password: string };

type SessionStudent = {
  student: Student;
  activity: Activity;
  progress: number;
  flag: "ok" | "idle" | "low-score";
  currentScore: number;
};

const skills: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];
const statuses: Activity[] = ["Listening", "Speaking", "Reading", "Writing", "Idle"];

const classMeta: Record<
  number,
  { level: string; cefr: string; profile: Profile; ui: string; focus: string }
> = {
  1: {
    level: "Foundational / Pre-Reader",
    cefr: "Pre-A1",
    profile: "Foundational",
    ui: "AI teacher voice-first games",
    focus: "phonics, picture matching, tracing",
  },
  2: {
    level: "Early Reader",
    cefr: "Pre-A1 to A1",
    profile: "Foundational",
    ui: "High animation with labelled icons",
    focus: "rhymes, simple sentences, picture stories",
  },
  3: {
    level: "Beginner",
    cefr: "A1",
    profile: "Foundational",
    ui: "Reward animation with readable cards",
    focus: "short stories, routines, guided paragraphs",
  },
  4: {
    level: "Elementary",
    cefr: "A1+",
    profile: "Elementary",
    ui: "Card lessons with star ratings",
    focus: "dialogues, paragraph reading, informal letters",
  },
  5: {
    level: "Elementary+",
    cefr: "A2 entry",
    profile: "Elementary",
    ui: "Structured dashboard with charts",
    focus: "children's news, mini-presentations, tenses",
  },
  6: {
    level: "Pre-Intermediate",
    cefr: "A2",
    profile: "Elementary",
    ui: "Clean low-animation layout",
    focus: "note-taking, group discussion, essays",
  },
  7: {
    level: "Intermediate Entry",
    cefr: "A2+ / B1 entry",
    profile: "Elementary",
    ui: "Practice plus early exam style",
    focus: "summaries, debate, reports",
  },
  8: {
    level: "Intermediate",
    cefr: "B1",
    profile: "Exam-Track",
    ui: "Timed exam-oriented interface",
    focus: "academic listening, literary extracts, notices",
  },
  9: {
    level: "Intermediate+",
    cefr: "B1+",
    profile: "Exam-Track",
    ui: "Board-pattern analytics",
    focus: "note-making, JAM, unseen passages",
  },
  10: {
    level: "Upper-Intermediate",
    cefr: "B1+ / B2 entry",
    profile: "Exam-Track",
    ui: "Full exam simulation",
    focus: "interviews, public speaking, analytical writing",
  },
  11: {
    level: "Advanced Entry",
    cefr: "B2",
    profile: "Advanced",
    ui: "Professional career-ready workspace",
    focus: "GD, editorials, argumentative writing",
  },
  12: {
    level: "Advanced",
    cefr: "B2+",
    profile: "Advanced",
    ui: "Benchmarking and exam simulation",
    focus: "competitive listening, mock interviews, SOP writing",
  },
};

const names = [
  "Aarav Sharma",
  "Diya Patel",
  "Vivaan Singh",
  "Anaya Gupta",
  "Kabir Mehta",
  "Ira Nair",
  "Arjun Reddy",
  "Myra Iyer",
  "Reyansh Khan",
  "Saanvi Rao",
  "Rohan Verma",
  "Kiara Das",
  "Advik Jain",
  "Simran Kaur",
  "Vihaan Joshi",
  "Nisha Menon",
  "Dev Malhotra",
  "Tara Bose",
  "Atharv Kulkarni",
  "Mira Chatterjee",
  "Yash Bansal",
  "Avni Saxena",
];

const teachers: Teacher[] = [
  {
    id: "t-foundation",
    name: "Meera Kapoor",
    userId: "teacher13",
    password: "teach123",
    band: "Foundational",
    allotted: [
      { classNumber: 1, section: "A" },
      { classNumber: 2, section: "A" },
      { classNumber: 3, section: "A" },
    ],
  },
  {
    id: "t-elementary",
    name: "Rahul Menon",
    userId: "teacher47",
    password: "teach123",
    band: "Elementary",
    allotted: [
      { classNumber: 4, section: "A" },
      { classNumber: 5, section: "A" },
      { classNumber: 6, section: "A" },
      { classNumber: 7, section: "A" },
    ],
  },
  {
    id: "t-exam",
    name: "Nandita Rao",
    userId: "teacher810",
    password: "teach123",
    band: "Exam-Track",
    allotted: [
      { classNumber: 8, section: "A" },
      { classNumber: 9, section: "A" },
      { classNumber: 10, section: "A" },
    ],
  },
  {
    id: "t-advanced",
    name: "Arvind Iyer",
    userId: "teacher1112",
    password: "teach123",
    band: "Advanced",
    allotted: [
      { classNumber: 11, section: "A" },
      { classNumber: 12, section: "A" },
    ],
  },
  {
    id: "t-lab-a",
    name: "Fatima Sheikh",
    userId: "teacherlab",
    password: "teach123",
    band: "Elementary",
    allotted: [
      { classNumber: 2, section: "B" },
      { classNumber: 6, section: "B" },
      { classNumber: 9, section: "B" },
    ],
  },
  {
    id: "t-lab-b",
    name: "Joseph Dsouza",
    userId: "teacherpro",
    password: "teach123",
    band: "Advanced",
    allotted: [
      { classNumber: 10, section: "B" },
      { classNumber: 11, section: "B" },
      { classNumber: 12, section: "B" },
    ],
  },
];

const lessonCopy: Record<
  Profile,
  Record<Skill, { title: string; prompt: string; task: string; metric: string }>
> = {
  Foundational: {
    Listening: {
      title: "Listening Studio",
      prompt: "Clear adult AI voice playback with picture comprehension.",
      task: "Junior listening clip",
      metric: "engagement",
    },
    Speaking: {
      title: "AI Speaking Lab",
      prompt: "Listen target sentence, record, and get pronunciation scores.",
      task: "Repeat practice",
      metric: "pronunciation",
    },
    Reading: {
      title: "Reading & WPM",
      prompt: "Tap words for pronunciation and dictionary.",
      task: "Sight-word passage",
      metric: "sight words",
    },
    Writing: {
      title: "Writing AI Checker",
      prompt: "Copy and check with live grammar suggestions.",
      task: "Trace & copy",
      metric: "letter formation",
    },
  },
  Elementary: {
    Listening: {
      title: "Listening Studio",
      prompt: "School announcements with MCQ and dictation quiz.",
      task: "Announcement drill",
      metric: "detail capture",
    },
    Speaking: {
      title: "AI Speaking Lab",
      prompt: "Record classroom sentences for fluency scoring.",
      task: "Guided speaking",
      metric: "fluency",
    },
    Reading: {
      title: "Reading & WPM",
      prompt: "Timed reading with click-to-speak dictionary.",
      task: "Garden paragraph",
      metric: "comprehension",
    },
    Writing: {
      title: "Writing AI Checker",
      prompt: "Friendly letter with AI grammar alerts.",
      task: "Letter writing",
      metric: "grammar",
    },
  },
  "Exam-Track": {
    Listening: {
      title: "Listening Studio",
      prompt: "Board-pattern podcast with speed control and quiz.",
      task: "Climate podcast",
      metric: "accuracy under time",
    },
    Speaking: {
      title: "AI Speaking Lab",
      prompt: "Exam-style sentence drills with phonetic breakdown.",
      task: "JAM / fluency",
      metric: "confidence",
    },
    Reading: {
      title: "Reading & WPM",
      prompt: "Unseen passage, timer, and CEFR speed benchmark.",
      task: "Unseen drill",
      metric: "speed and accuracy",
    },
    Writing: {
      title: "Writing AI Checker",
      prompt: "Analytical paragraph with accept-fix suggestions.",
      task: "Analytical writing",
      metric: "structure",
    },
  },
  Advanced: {
    Listening: {
      title: "Listening Studio",
      prompt: "Professional lecture excerpt with comprehension quiz.",
      task: "Ethical AI talk",
      metric: "summarization",
    },
    Speaking: {
      title: "AI Speaking Lab",
      prompt: "Interview/GD sentences with live mic analysis.",
      task: "GD / interview",
      metric: "executive presence",
    },
    Reading: {
      title: "Reading & WPM",
      prompt: "Advanced passage, WPM timer, instant word pronunciation.",
      task: "Editorial reading",
      metric: "critical reasoning",
    },
    Writing: {
      title: "Writing AI Checker",
      prompt: "Persuasive essay with real-time grammar panel.",
      task: "Formal essay",
      metric: "professional writing",
    },
  },
};

function scoreFor(classNumber: number, roll: number, skill: Skill) {
  const index = skills.indexOf(skill) + 1;
  return Math.min(96, 54 + classNumber * 2 + ((roll * index * 7) % 28));
}

function generateStudents(): Student[] {
  return Array.from({ length: 12 }, (_, classIndex) => {
    const classNumber = classIndex + 1;
    return names.map((name, idx) => {
      const roll = idx + 1;
      const section: "A" | "B" = roll <= 11 ? "A" : "B";
      const scores = skills.reduce(
        (acc, skill) => ({ ...acc, [skill]: scoreFor(classNumber, roll, skill) }),
        {} as Scores,
      );
      return {
        id: `stu-${classNumber}-${roll}`,
        name,
        classNumber,
        section,
        roll,
        mobile: `98XXXX${String(classNumber).padStart(2, "0")}${String(roll).padStart(2, "0")}`,
        dob: `${String((roll % 27) + 1).padStart(2, "0")}-04-${2018 - classNumber}`,
        userId: credentialUserId(classNumber, section, roll),
        password: `Lab${classNumber}@${String(roll).padStart(2, "0")}`,
        scores,
        xp: 700 + classNumber * 90 + roll * 13,
        streak: (roll % 8) + 1,
        coins: 40 + classNumber * 5 + roll,
      };
    });
  }).flat();
}

function credentialUserId(classNumber: number, section: string, roll: number) {
  return `DPS${String(classNumber).padStart(2, "0")}${section}${String(roll).padStart(2, "0")}`;
}

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const initialStudents = generateStudents();

function createAccounts(students: Student[]): Account[] {
  const admin: Account = {
    id: "admin",
    label: "Super Admin - Full School Access",
    role: "admin",
    userId: "admin",
    password: "admin123",
  };
  const teacherAccounts = teachers.map<Account>((teacher) => ({
    id: teacher.id,
    label: `${teacher.name} - ${teacher.band} Teacher`,
    role: "teacher",
    userId: teacher.userId,
    password: teacher.password,
    teacherId: teacher.id,
  }));
  const studentAccounts = Array.from({ length: 12 }, (_, index) => {
    const classNumber = index + 1;
    const student = students.find((item) => item.classNumber === classNumber && item.roll === 1)!;
    return {
      id: `student-${classNumber}`,
      label: `${student.name} - Class ${classNumber}`,
      role: "student" as const,
      userId: student.userId,
      password: student.password,
      studentId: student.id,
    };
  });
  return [admin, ...teacherAccounts, ...studentAccounts];
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "login":
      return { ...state, session: action.session };
    case "logout":
      return { ...state, session: null };
    case "addStudents":
      return { ...state, students: [...state.students, ...action.students] };
    case "resetPassword":
      return {
        ...state,
        students: state.students.map((student) =>
          student.id === action.studentId ? { ...student, password: action.password } : student,
        ),
      };
    default:
      return state;
  }
}

function average(scores: Scores) {
  return Math.round(skills.reduce((sum, skill) => sum + scores[skill], 0) / skills.length);
}

function classAverage(students: Student[], classNumber: number) {
  const classStudents = students.filter((student) => student.classNumber === classNumber);
  return Math.round(
    classStudents.reduce((sum, student) => sum + average(student.scores), 0) / classStudents.length,
  );
}

function radarData(scores: Scores) {
  return skills.map((skill) => ({ skill, score: scores[skill] }));
}

function bandClasses(profile: Profile) {
  return Object.entries(classMeta)
    .filter(([, meta]) => meta.profile === profile)
    .map(([classNumber]) => Number(classNumber));
}

function App() {
  const [state, dispatch] = useReducer(appReducer, {
    session: null,
    students: initialStudents,
  });
  const accounts = useMemo(() => createAccounts(state.students), [state.students]);

  useEffect(() => {
    // Preload browser voices so Listen Target Sentence works on first click
    if (!("speechSynthesis" in window)) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warm);
  }, []);

  if (!state.session) {
    return <LoginPage accounts={accounts} students={state.students} dispatch={dispatch} />;
  }

  const session = state.session;

  return (
    <div className="min-h-screen bg-orange-50/30 text-slate-900">
      <Header session={session} dispatch={dispatch} />
      {session.role === "admin" && (
        <AdminDashboard students={state.students} dispatch={dispatch} />
      )}
      {session.role === "teacher" && (
        <TeacherDashboard
          teacher={teachers.find((teacher) => teacher.id === session.teacherId)!}
          students={state.students}
        />
      )}
      {session.role === "student" && (
        <StudentExperience
          student={state.students.find((student) => student.id === session.studentId)!}
          students={state.students}
        />
      )}
    </div>
  );
}

function LoginPage({
  accounts,
  students,
  dispatch,
}: {
  accounts: Account[];
  students: Student[];
  dispatch: (action: AppAction) => void;
}) {
  const [role, setRole] = useState<Role>("admin");
  const filtered = accounts.filter((account) => account.role === role);
  const [selected, setSelected] = useState<Account>(filtered[0]);

  useEffect(() => {
    setSelected(accounts.find((account) => account.role === role)!);
  }, [accounts, role]);

  const submit = (account = selected) => {
    if (account.role === "admin") {
      dispatch({ type: "login", session: { role: "admin", account } });
    }
    if (account.role === "teacher" && account.teacherId) {
      dispatch({ type: "login", session: { role: "teacher", account, teacherId: account.teacherId } });
    }
    if (account.role === "student" && account.studentId) {
      const student = students.find((item) => item.id === account.studentId)!;
      dispatch({
        type: "login",
        session: {
          role: "student",
          account,
          studentId: account.studentId,
          classNumber: student.classNumber,
        },
      });
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fed7aa,transparent_34%),linear-gradient(135deg,#fff,rgba(255,247,237,.95))] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[2rem] border border-orange-100 bg-white/90 p-8 shadow-xl shadow-orange-100">
          <Badge icon={<School size={18} />} text="School English Language Lab" />
          <h1 className="mt-6 text-4xl font-black leading-tight text-slate-950 md:text-6xl">
            LSRW lab demo for every class, every role, every period.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Frontend-only client demo with hardcoded multi-role login, class-adaptive
            student practice, Excel onboarding, credential export and live teacher monitoring.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["12", "student class logins"],
              ["264", "mock students"],
              ["16", "profile LSRW screens"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl bg-orange-50 p-5">
                <div className="text-3xl font-black text-orange-600">{value}</div>
                <div className="text-sm font-semibold text-slate-600">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Feature icon={<Sparkles />} title="Junior games" text="Clear AI teacher voice, bubbles, matching cards and reward bursts for Classes 1-3." />
            <Feature icon={<MonitorDot />} title="Live lab period" text="Teacher tiles update status and progress every few seconds." />
            <Feature icon={<FileSpreadsheet />} title="Real Excel flow" text="Download sample, upload rows, validate, confirm and export credentials." />
            <Feature icon={<BarChart3 />} title="Consistent analytics" text="Scores agree across student dashboard, teacher drawer and reports." />
          </div>
        </section>

        <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100">
          <div className="flex gap-2 rounded-2xl bg-orange-50 p-2">
            {(["admin", "teacher", "student"] as Role[]).map((item) => (
              <button
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold capitalize transition ${
                  role === item ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "text-slate-600"
                }`}
                key={item}
                onClick={() => setRole(item)}
              >
                {item === "admin" ? "Super Admin" : item}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Login form</p>
            <label className="mt-4 block text-sm font-semibold text-slate-600">User ID</label>
            <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-orange-400" value={selected?.userId ?? ""} readOnly />
            <label className="mt-4 block text-sm font-semibold text-slate-600">Password</label>
            <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-orange-400" value={selected?.password ?? ""} readOnly />
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-black text-white shadow-lg shadow-orange-200" onClick={() => submit()}>
              Login to Demo <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Quick Demo Login</p>
            <div className="max-h-[420px] space-y-2 overflow-auto pr-2">
              {filtered.map((account) => (
                <button
                  key={account.id}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    selected?.id === account.id
                      ? "border-orange-300 bg-orange-50"
                      : "border-slate-100 hover:border-orange-200"
                  }`}
                  onClick={() => {
                    setSelected(account);
                    submit(account);
                  }}
                >
                  <span>
                    <span className="block font-bold">{account.label}</span>
                    <span className="text-xs text-slate-500">
                      {account.userId} / {account.password}
                    </span>
                  </span>
                  <Play size={16} className="text-orange-500" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Header({ session, dispatch }: { session: Session; dispatch: (action: AppAction) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500 text-white">
            <School />
          </div>
          <div>
            <p className="font-black">LSRW Language Lab</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
              {session.role} demo session
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-orange-200 px-4 py-2 font-bold text-orange-600" onClick={() => dispatch({ type: "logout" })}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}

function StudentExperience({ student, students }: { student: Student; students: Student[] }) {
  const [view, setView] = useState<View>("home");
  const meta = classMeta[student.classNumber];
  const profile = meta.profile;
  const avg = average(student.scores);
  const gameMode = isGameBand(student.classNumber);

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
          <div className={gameMode ? "ai-teacher-card" : "rounded-3xl bg-orange-50 p-5"}>
            <div className="text-4xl">{gameMode ? "🎮" : profile === "Advanced" ? "🎯" : "📚"}</div>
            <h2 className="mt-3 text-xl font-black">{student.name}</h2>
            <p className="text-sm font-semibold text-slate-500">
              Class {student.classNumber}-{student.section} · {meta.level}
            </p>
            <p className="mt-2 text-xs font-black uppercase text-orange-600">
              {gameMode ? "Game-based LSRW" : "AI Lab Mode"}
            </p>
          </div>
          <nav className="mt-5 space-y-2">
            <SideButton active={view === "home"} icon={<Home size={17} />} label="Dashboard" onClick={() => setView("home")} />
            <SideButton active={view === "tasks"} icon={<ClipboardList size={17} />} label="Today's Tasks" onClick={() => setView("tasks")} />
            <SideButton active={view === "report"} icon={<FileText size={17} />} label="Daily Report" onClick={() => setView("report")} />
            {gameMode ? (
              <>
                <SideButton active={view === "Listening"} icon={<Headphones size={17} />} label="Listening Game" onClick={() => setView("Listening")} />
                <SideButton active={view === "Speaking"} icon={<Mic size={17} />} label="Speaking Game" onClick={() => setView("Speaking")} />
                <SideButton active={view === "Reading"} icon={<BookOpen size={17} />} label="Reading Game" onClick={() => setView("Reading")} />
                <SideButton active={view === "Writing"} icon={<PencilLine size={17} />} label="Writing Game" onClick={() => setView("Writing")} />
              </>
            ) : (
              <>
                <SideButton active={view === "Speaking"} icon={<Mic size={17} />} label="AI Speaking Lab" onClick={() => setView("Speaking")} />
                <SideButton active={view === "Listening"} icon={<Headphones size={17} />} label="Listening Studio" onClick={() => setView("Listening")} />
                <SideButton active={view === "Reading"} icon={<BookOpen size={17} />} label="Reading & WPM" onClick={() => setView("Reading")} />
                <SideButton active={view === "Writing"} icon={<PencilLine size={17} />} label="Writing AI Checker" onClick={() => setView("Writing")} />
              </>
            )}
          </nav>
        </aside>

        <section>
          {view === "home" && (
            <StudentHome student={student} profile={profile} meta={meta} students={students} setView={setView} avg={avg} />
          )}
          {view === "tasks" && (
            <StudentDailyTasks
              studentId={student.id}
              classNumber={student.classNumber}
              section={student.section}
              scores={student.scores}
              onStartSkill={(skill) => setView(skill)}
            />
          )}
          {view === "report" && (
            <StudentDailyReport
              studentId={student.id}
              classNumber={student.classNumber}
              section={student.section}
              name={student.name}
              scores={student.scores}
            />
          )}
          {view !== "home" && view !== "tasks" && view !== "report" && (
            <PracticeScreen student={student} profile={profile} skill={view} setView={setView} />
          )}
        </section>
      </div>
    </main>
  );
}

function StudentHome({
  student,
  profile,
  meta,
  students,
  setView,
  avg,
}: {
  student: Student;
  profile: Profile;
  meta: (typeof classMeta)[number];
  students: Student[];
  setView: (view: View) => void;
  avg: number;
}) {
  const chartData = skills.map((skill) => ({
    skill,
    score: student.scores[skill],
    classAvg: classAverage(students, student.classNumber),
  }));
  const gameMode = isGameBand(student.classNumber);
  return (
    <div className="space-y-6">
      <HeroCard profile={profile}>
        <div>
          <Badge icon={<Award size={17} />} text={`Class ${student.classNumber} · ${meta.cefr} · ${gameMode ? "Game Mode" : "AI Lab Mode"}`} />
          <h1 className="mt-4 text-3xl font-black md:text-5xl">
            {gameMode
              ? "Play, listen, speak and win stars!"
              : profile === "Exam-Track"
                ? "Exam practice dashboard"
                : profile === "Advanced"
                  ? "Communication readiness dashboard"
                  : "Today's LSRW AI learning path"}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            {gameMode
              ? "Classes 1–4 use game-based Listening, Speaking, Reading and Writing with clear AI voice."
              : "Classes 5–12 use AI Speaking Lab, Listening Studio, Reading & WPM, and Writing AI Checker."}
          </p>
        </div>
        {gameMode && <AiTeacher mood="wave" />}
      </HeroCard>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Average" value={`${avg}%`} icon={<BarChart3 />} />
        <Metric title="Streak" value={`${student.streak} days`} icon={<Sparkles />} />
        <Metric title={profile === "Advanced" ? "Benchmark" : "Coins"} value={profile === "Advanced" ? "Top 28%" : String(student.coins)} icon={<Star />} />
        <Metric title="XP" value={String(student.xp)} icon={<Award />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center justify-between text-xl font-black">
              <span>{gameMode ? "Today's Games" : "Today's AI Labs"}</span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                {gameMode ? "Class 1–4 Games" : "Class 5+ AI Labs"}
              </span>
            </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => (
              <motion.button
                whileHover={{ y: -4 }}
                key={skill}
                onClick={() => setView(skill)}
                className={`lesson-card ${profile.toLowerCase().replace("-", "")}`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  {skillIcon(skill)}
                </span>
                <span className="text-left">
                  <span className="block text-lg font-black">
                    {gameMode
                      ? ({
                          Listening: "Pop the Sound Bubble",
                          Speaking: "Echo Speak Game",
                          Reading: "Picture Word Match",
                          Writing: "Word Builder Game",
                        }[skill])
                      : lessonCopy[profile][skill].title}
                  </span>
                  <span className="text-sm text-slate-600">
                    {gameMode
                      ? ({
                          Listening: "Listen and tap the matching picture bubble.",
                          Speaking: "Hear clear AI voice, then speak into the mic.",
                          Reading: "Match sight words with pictures.",
                          Writing: "Build words with letter tiles.",
                        }[skill])
                      : lessonCopy[profile][skill].prompt}
                  </span>
                </span>
                {gameMode && <span className="gif-orbit" />}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-black">
            {gameMode ? "Star Badges" : "Skill Radar"}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData(student.scores)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <Radar dataKey="score" fill="#f97316" fillOpacity={0.35} stroke="#f97316" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {(profile === "Exam-Track" || profile === "Advanced") && (
        <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Score vs Class Average</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#f97316" radius={[10, 10, 0, 0]} />
                <Bar dataKey="classAvg" fill="#fed7aa" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeScreen({
  student,
  profile,
  skill,
  setView,
}: {
  student: Student;
  profile: Profile;
  skill: Skill;
  setView: (view: View) => void;
}) {
  const gameMode = isGameBand(student.classNumber);
  const labTitle: Record<Skill, string> = gameMode
    ? {
        Listening: "Listening Game",
        Speaking: "Speaking Game",
        Reading: "Reading Game",
        Writing: "Writing Game",
      }
    : {
        Speaking: "AI Speaking Lab",
        Listening: "Listening Studio",
        Reading: "Reading & WPM Lab",
        Writing: "Writing AI Checker",
      };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700" onClick={() => setView("home")}>
          Back to dashboard
        </button>
        <Badge
          icon={skillIcon(skill)}
          text={`${labTitle[skill]} · Class ${student.classNumber} · ${gameMode ? "Game Mode" : "AI Lab"}`}
        />
      </div>

      {gameMode ? (
        <>
          {skill === "Listening" && <ListeningGame classNumber={student.classNumber} />}
          {skill === "Speaking" && <SpeakingGame classNumber={student.classNumber} />}
          {skill === "Reading" && <ReadingGame classNumber={student.classNumber} />}
          {skill === "Writing" && <WritingGame classNumber={student.classNumber} />}
        </>
      ) : (
        <>
          {skill === "Speaking" && <SpeakingLab profile={profile} classNumber={student.classNumber} />}
          {skill === "Listening" && <ListeningLab profile={profile} classNumber={student.classNumber} />}
          {skill === "Reading" && <ReadingLab profile={profile} classNumber={student.classNumber} />}
          {skill === "Writing" && <WritingLab profile={profile} classNumber={student.classNumber} />}
        </>
      )}
    </div>
  );
}

function AdminDashboard({ students, dispatch }: { students: Student[]; dispatch: (action: AppAction) => void }) {
  const [tab, setTab] = useState<"overview" | "onboard" | "students" | "reports" | "crm">("overview");
  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <DashboardTabs
        active={tab}
        setActive={(value) => setTab(value as typeof tab)}
        tabs={[
          ["overview", "Overview"],
          ["onboard", "Bulk Onboarding"],
          ["students", "Student Management"],
          ["reports", "Reports"],
          ["crm", "School CRM"],
        ]}
      />
      {tab === "overview" && <AdminOverview students={students} />}
      {tab === "onboard" && <BulkOnboarding dispatch={dispatch} />}
      {tab === "students" && <StudentManagement students={students} dispatch={dispatch} />}
      {tab === "reports" && <AdminReports students={students} />}
      {tab === "crm" && <SchoolCrmReports students={students} />}
    </main>
  );
}

function AdminOverview({ students }: { students: Student[] }) {
  const classRows = Array.from({ length: 12 }, (_, index) => {
    const classNumber = index + 1;
    const classStudents = students.filter((student) => student.classNumber === classNumber);
    return {
      className: `Class ${classNumber}`,
      students: classStudents.length,
      avg: classAverage(students, classNumber),
    };
  });
  return (
    <div className="space-y-6">
      <HeroCard profile="Advanced">
        <div>
          <Badge icon={<ShieldCheck size={17} />} text="Super Admin Dashboard" />
          <h1 className="mt-4 text-4xl font-black">School-wide LSRW control center</h1>
          <p className="mt-3 text-slate-600">Manage onboarding, credentials, teacher allotments, curriculum coverage and school analytics.</p>
        </div>
      </HeroCard>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Students" value={String(students.length)} icon={<Users />} />
        <Metric title="Classes" value="12" icon={<School />} />
        <Metric title="Teachers" value={String(teachers.length)} icon={<UserRound />} />
        <Metric title="Avg Score" value={`${Math.round(students.reduce((sum, s) => sum + average(s.scores), 0) / students.length)}%`} icon={<BarChart3 />} />
      </div>
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-black">Class-wise Progress</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classRows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg" fill="#f97316" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BulkOnboarding({ dispatch }: { dispatch: (action: AppAction) => void }) {
  const [rows, setRows] = useState<(Partial<Student> & { reason?: string; valid: boolean })[]>([]);

  const downloadTemplate = () => {
    const sample = [
      {
        "Student Name": "Aarav Sharma",
        Class: 6,
        Section: "B",
        "Mobile Number": "9876543210",
        "Date of Birth": "12-04-2015",
        "Roll Number": 23,
      },
    ];
    downloadSheet(sample, "LSRW-Bulk-Onboarding-Template.xlsx");
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);
    const seen = new Set<string>();
    const parsed = raw.map((row, index) => {
      const name = String(row["Student Name"] ?? row.Name ?? "").trim();
      const classNumber = Number(row.Class);
      const section = String(row.Section ?? "").toUpperCase() as "A" | "B";
      const mobile = String(row["Mobile Number"] ?? row.Mobile ?? "").trim();
      const dob = String(row["Date of Birth"] ?? row.DOB ?? "").trim();
      const roll = Number(row["Roll Number"] ?? index + 1);
      const key = `${name}-${classNumber}-${section}`.toLowerCase();
      const reasons = [
        !name && "Missing student name",
        (!classNumber || classNumber < 1 || classNumber > 12) && "Invalid class",
        !["A", "B"].includes(section) && "Missing/invalid section",
        !/^\d{10}$/.test(mobile) && "Invalid mobile number",
        !/\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(dob) && "Invalid DOB",
        seen.has(key) && "Duplicate student",
      ].filter(Boolean);
      seen.add(key);
      return {
        id: `upload-${Date.now()}-${index}`,
        name,
        classNumber,
        section,
        roll,
        mobile,
        dob,
        userId: credentialUserId(classNumber, section, roll),
        password: randomPassword(),
        scores: {
          Listening: scoreFor(classNumber, roll, "Listening"),
          Speaking: scoreFor(classNumber, roll, "Speaking"),
          Reading: scoreFor(classNumber, roll, "Reading"),
          Writing: scoreFor(classNumber, roll, "Writing"),
        },
        xp: 500,
        streak: 1,
        coins: 20,
        valid: reasons.length === 0,
        reason: reasons.join(", "),
      };
    });
    setRows(parsed);
  };

  const confirm = () => {
    const validStudents = rows.filter((row) => row.valid).map((row) => row as Student);
    dispatch({ type: "addStudents", students: validStudents });
    setRows([]);
    window.alert(`${validStudents.length} valid students onboarded and credentials generated.`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <Badge icon={<Upload size={17} />} text="Bulk Excel Onboarding" />
        <h1 className="mt-4 text-3xl font-black">Upload, validate, confirm</h1>
        <p className="mt-3 text-slate-600">Expected columns: Name, Class, Section, Mobile Number, Date of Birth, Roll Number.</p>
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 px-4 py-3 font-black text-orange-600" onClick={downloadTemplate}>
          <Download size={17} /> Download Sample Template
        </button>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50 p-8 text-center">
          <FileSpreadsheet className="text-orange-500" />
          <span className="mt-2 font-black">Choose .xlsx file</span>
          <span className="text-sm text-slate-500">Parsed locally with SheetJS</span>
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={onUpload} />
        </label>
      </div>
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">Review Rows</h2>
          <button disabled={!rows.some((row) => row.valid)} className="rounded-2xl bg-orange-500 px-4 py-2 font-black text-white disabled:opacity-40" onClick={confirm}>
            Confirm Onboarding
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                {["Status", "Name", "Class", "Section", "Mobile", "DOB", "User ID", "Reason"].map((head) => (
                  <th key={head} className="border-b p-3">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="p-6 text-slate-500" colSpan={8}>Upload a sheet or download the sample template first.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className={row.valid ? "bg-green-50/60" : "bg-amber-50/70"}>
                    <td className="p-3 font-bold">{row.valid ? "Valid" : "Flagged"}</td>
                    <td className="p-3">{row.name}</td>
                    <td className="p-3">{row.classNumber}</td>
                    <td className="p-3">{row.section}</td>
                    <td className="p-3">{row.mobile}</td>
                    <td className="p-3">{row.dob}</td>
                    <td className="p-3">{row.userId}</td>
                    <td className="p-3">{row.reason || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentManagement({ students, dispatch }: { students: Student[]; dispatch: (action: AppAction) => void }) {
  const [classFilter, setClassFilter] = useState(1);
  const [sectionFilter, setSectionFilter] = useState<"A" | "B">("A");
  const [resetStudent, setResetStudent] = useState<Student | null>(null);
  const visible = students.filter((student) => student.classNumber === classFilter && student.section === sectionFilter);
  const columnHelper = legacyCreateColumnHelper<Student>();
  const columns = [
    columnHelper.accessor("roll", { header: "Roll" }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("userId", { header: "User ID" }),
    columnHelper.accessor("mobile", { header: "Mobile" }),
    columnHelper.display({
      id: "avg",
      header: "Average",
      cell: ({ row }) => `${average(row.original.scores)}%`,
    }),
    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <button className="rounded-xl bg-orange-100 px-3 py-2 font-bold text-orange-700" onClick={() => setResetStudent(row.original)}>
          Reset Password
        </button>
      ),
    }),
  ] as unknown as LegacyColumnDef<Student>[];
  const table = useLegacyTable({ data: visible, columns, getCoreRowModel: getCoreRowModel() });

  const exportCredentials = () => {
    downloadSheet(
      visible.map((student) => ({
        Name: student.name,
        Class: student.classNumber,
        Section: student.section,
        "User ID": student.userId,
        Password: student.password,
      })),
      `Class-${classFilter}-${sectionFilter}-Credentials.xlsx`,
    );
  };

  const resetPassword = () => {
    if (!resetStudent) return;
    const password = randomPassword();
    dispatch({ type: "resetPassword", studentId: resetStudent.id, password });
    setResetStudent({ ...resetStudent, password });
  };

  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Student Management</h1>
          <p className="text-slate-500">Filter class/section, export credentials, reset individual passwords.</p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-black text-white" onClick={exportCredentials}>
          <Download size={17} /> Export Credentials
        </button>
      </div>
      <div className="mb-5 flex gap-3">
        <select className="rounded-2xl border border-slate-200 px-4 py-3" value={classFilter} onChange={(event) => setClassFilter(Number(event.target.value))}>
          {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Class {index + 1}</option>)}
        </select>
        <select className="rounded-2xl border border-slate-200 px-4 py-3" value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value as "A" | "B")}>
          <option>A</option>
          <option>B</option>
        </select>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-left text-slate-500">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border-b p-3">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={Boolean(resetStudent)} onClose={() => setResetStudent(null)} title="Password Reset">
        {resetStudent && (
          <div>
            <p className="text-slate-600">Regenerate password for {resetStudent.name} without changing any other student credentials.</p>
            <div className="mt-4 rounded-2xl bg-orange-50 p-4">
              <p className="text-sm font-bold text-slate-500">Current Password</p>
              <p className="text-2xl font-black text-orange-600">{resetStudent.password}</p>
            </div>
            <button className="mt-5 rounded-2xl bg-orange-500 px-4 py-3 font-black text-white" onClick={resetPassword}>
              Generate New Password
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AdminReports({ students }: { students: Student[] }) {
  const rows = Array.from({ length: 12 }, (_, index) => {
    const classNumber = index + 1;
    return { name: `Class ${classNumber}`, score: classAverage(students, classNumber), profile: classMeta[classNumber].profile };
  });
  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-black">School Reports</h1>
      <p className="mt-2 text-slate-500">Class-wise and band-wise analytics for admin review.</p>
      <div className="mt-6 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TeacherDashboard({ teacher, students }: { teacher: Teacher; students: Student[] }) {
  const [tab, setTab] = useState<"dashboard" | "tasks" | "live" | "roster" | "reviews">("tasks");
  const [activeClass, setActiveClass] = useState(teacher.allotted[0]);
  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <DashboardTabs
        active={tab}
        setActive={(value) => setTab(value as typeof tab)}
        tabs={[
          ["tasks", "Daily Tasks"],
          ["dashboard", "Teacher Dashboard"],
          ["live", "Live Monitoring"],
          ["roster", "Roster"],
          ["reviews", "Pending Reviews"],
        ]}
      />
      {tab === "tasks" && (
        <DailyTaskDesk teacherId={teacher.id} allotted={teacher.allotted} students={students} />
      )}
      {tab === "dashboard" && <TeacherHome teacher={teacher} students={students} activeClass={activeClass} setActiveClass={setActiveClass} setTab={setTab} />}
      {tab === "live" && <LiveMonitoring activeClass={activeClass} students={students} teacher={teacher} />}
      {tab === "roster" && <TeacherRoster teacher={teacher} students={students} />}
      {tab === "reviews" && <PendingReviews teacher={teacher} students={students} />}
    </main>
  );
}

function TeacherHome({
  teacher,
  students,
  activeClass,
  setActiveClass,
  setTab,
}: {
  teacher: Teacher;
  students: Student[];
  activeClass: { classNumber: number; section: "A" | "B" };
  setActiveClass: (value: { classNumber: number; section: "A" | "B" }) => void;
  setTab: (tab: "dashboard" | "tasks" | "live" | "roster" | "reviews") => void;
}) {
  const scoped = students.filter((student) => teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section));
  return (
    <div className="space-y-6">
      <HeroCard profile={teacher.band}>
        <div>
          <Badge icon={<UserRound size={17} />} text={`${teacher.band} Teacher · scoped access only`} />
          <h1 className="mt-4 text-4xl font-black">Welcome, {teacher.name}</h1>
          <p className="mt-3 text-slate-600">Assign AI daily tasks, start lab sessions, review submissions, and track class completion.</p>
        </div>
      </HeroCard>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Scoped Students" value={String(scoped.length)} icon={<Users />} />
        <Metric title="Allotted Sections" value={String(teacher.allotted.length)} icon={<School />} />
        <Metric title="Pending Reviews" value="8" icon={<PencilLine />} />
        <Metric title="Live Readiness" value="Good" icon={<MonitorDot />} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="rounded-2xl bg-orange-500 px-6 py-3 font-black text-white" onClick={() => setTab("tasks")}>
          Open Daily Task Desk
        </button>
      </div>
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Start Lab Session</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {teacher.allotted.map((item) => (
            <button
              key={`${item.classNumber}-${item.section}`}
              className={`rounded-2xl px-4 py-3 font-black ${activeClass === item ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700"}`}
              onClick={() => setActiveClass(item)}
            >
              Class {item.classNumber}-{item.section}
            </button>
          ))}
        </div>
        <button className="mt-5 rounded-2xl bg-orange-500 px-6 py-3 font-black text-white" onClick={() => setTab("live")}>
          Start Lab Session for Class {activeClass.classNumber}-{activeClass.section}
        </button>
      </div>
    </div>
  );
}

function LiveMonitoring({
  activeClass,
  students,
  teacher,
}: {
  activeClass: { classNumber: number; section: "A" | "B" };
  students: Student[];
  teacher: Teacher;
}) {
  const { dispatch } = useCrm();
  const roster = students.filter((student) => student.classNumber === activeClass.classNumber && student.section === activeClass.section);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<SessionStudent | null>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (ended) return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 2500);
    return () => window.clearInterval(interval);
  }, [ended]);

  const sessionStudents = roster.map<SessionStudent>((student, index) => {
    const activity = statuses[(index + tick) % statuses.length];
    const currentScore = student.scores[skills[(index + tick) % skills.length]];
    const progress = activity === "Idle" ? 8 + ((tick + index) % 20) : Math.min(100, 22 + ((tick * 13 + index * 9) % 78));
    const flag = activity === "Idle" && progress < 24 ? "idle" : currentScore < 68 ? "low-score" : "ok";
    return { student, activity, progress, flag, currentScore };
  });

  if (ended) {
    const completion = Math.round(sessionStudents.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, sessionStudents.length));
    const averageScore = Math.round(sessionStudents.reduce((sum, item) => sum + item.currentScore, 0) / Math.max(1, sessionStudents.length));
    const flags = sessionStudents.filter((item) => item.flag !== "ok").length;
    return (
      <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
        <Badge icon={<CheckCircle2 size={17} />} text="Session Summary" />
        <h1 className="mt-4 text-4xl font-black">Class {activeClass.classNumber}-{activeClass.section} lab period completed</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric title="Completion" value={`${completion}%`} icon={<CheckCircle2 />} />
          <Metric title="Average Score" value={`${averageScore}%`} icon={<BarChart3 />} />
          <Metric title="Time Spent" value="38 min" icon={<Clock />} />
          <Metric title="Flags" value={String(flags)} icon={<Flag />} />
        </div>
        <button className="mt-6 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white" onClick={() => setEnded(false)}>
          Restart Live Monitoring
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
        <div>
          <Badge icon={<MonitorDot size={17} />} text="Live session running" />
          <h1 className="mt-2 text-3xl font-black">Class {activeClass.classNumber}-{activeClass.section} Monitoring Grid</h1>
        </div>
        <button
          className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white"
          onClick={() => {
            const completion = Math.round(sessionStudents.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, sessionStudents.length));
            const averageScore = Math.round(sessionStudents.reduce((sum, item) => sum + item.currentScore, 0) / Math.max(1, sessionStudents.length));
            const flags = sessionStudents.filter((item) => item.flag !== "ok").length;
            dispatch({
              type: "addSession",
              session: {
                id: `sess-${Date.now()}`,
                date: todayISO(),
                classNumber: activeClass.classNumber,
                section: activeClass.section,
                teacherId: teacher.id,
                teacherName: teacher.name,
                completionPct: completion,
                averageScore,
                timeSpentMin: 38,
                flags,
              },
            });
            setEnded(true);
          }}
        >
          End Session
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sessionStudents.map((item) => (
          <button key={item.student.id} className="rounded-[2rem] border border-orange-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1" onClick={() => setSelected(item)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 font-black text-orange-700">{item.student.name.split(" ").map((part) => part[0]).join("")}</div>
                <div>
                  <p className="font-black">{item.student.name}</p>
                  <p className="text-sm text-slate-500">Roll {item.student.roll}</p>
                </div>
              </div>
              <StatusFlag flag={item.flag} />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm font-bold">
              <span>{item.activity}</span>
              <span>{item.progress}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-orange-100">
              <motion.div animate={{ width: `${item.progress}%` }} className="h-2 rounded-full bg-orange-500" />
            </div>
          </button>
        ))}
      </div>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Student Live Detail">
        {selected && <StudentDrawer item={selected} />}
      </Modal>
    </div>
  );
}

function TeacherRoster({ teacher, students }: { teacher: Teacher; students: Student[] }) {
  const { dispatch, reportFor } = useCrm();
  const scoped = students.filter((student) => teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section));
  const [selected, setSelected] = useState<Student | null>(null);
  const [remark, setRemark] = useState("");
  const date = todayISO();
  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-black">Scoped Class Roster</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {scoped.map((student) => (
          <button key={student.id} className="rounded-3xl border border-slate-100 p-4 text-left hover:border-orange-200" onClick={() => setSelected(student)}>
            <p className="font-black">{student.name}</p>
            <p className="text-sm text-slate-500">Class {student.classNumber}-{student.section} · Avg {average(student.scores)}%</p>
          </button>
        ))}
      </div>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Student Profile">
        {selected && (
          <div>
            <StudentProfile student={selected} />
            <div className="mt-5">
              <textarea className="h-24 w-full rounded-2xl border border-slate-200 p-3" placeholder="Add teacher remark" value={remark} onChange={(event) => setRemark(event.target.value)} />
              <button
                className="mt-3 rounded-2xl bg-orange-500 px-4 py-2 font-black text-white"
                onClick={() => {
                  if (remark.trim()) {
                    dispatch({ type: "addRemark", studentId: selected.id, date, remark: `${teacher.name}: ${remark.trim()}` });
                    setRemark("");
                  }
                }}
              >
                Add Remark
              </button>
              <div className="mt-3 space-y-2">
                {(reportFor(selected.id, date)?.teacherRemarks ?? []).map((item, index) => (
                  <p key={index} className="rounded-2xl bg-orange-50 p-3 text-sm">{item}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function PendingReviews({ teacher, students }: { teacher: Teacher; students: Student[] }) {
  const scoped = students.filter((student) => teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section)).slice(0, 8);
  const [completed, setCompleted] = useState<string[]>([]);
  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-black">Pending Speaking/Writing Reviews</h1>
      <div className="mt-5 space-y-3">
        {scoped.map((student, index) => (
          <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-100 p-4">
            <div>
              <p className="font-black">{student.name}</p>
              <p className="text-sm text-slate-500">{index % 2 ? "Writing: formal paragraph" : "Speaking: picture description"} · Class {student.classNumber}-{student.section}</p>
            </div>
            <button className="rounded-2xl bg-orange-100 px-4 py-2 font-black text-orange-700" onClick={() => setCompleted((items) => [...items, student.id])}>
              {completed.includes(student.id) ? "Reviewed" : "Quick Score + Feedback"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadSheet(rows: Record<string, unknown>[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-orange-100 bg-white p-5">
      <div className="text-orange-500">{icon}</div>
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function Badge({ icon, text }: { icon: ReactNode; text: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">{icon}{text}</span>;
}

function Metric({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.7rem] border border-orange-100 bg-white p-5 shadow-sm">
      <div className="text-orange-500">{icon}</div>
      <p className="mt-3 text-sm font-bold text-slate-500">{title}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function HeroCard({ profile, children }: { profile: Profile; children: ReactNode }) {
  return <div className={`hero-card ${profile.toLowerCase().replace("-", "")}`}>{children}</div>;
}

function SideButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-bold ${active ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-50"}`} onClick={onClick}>{icon}{label}</button>;
}

function DashboardTabs({ active, setActive, tabs }: { active: string; setActive: (value: string) => void; tabs: [string, string][] }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-[1.5rem] border border-orange-100 bg-white p-2 shadow-sm">
      {tabs.map(([value, label]) => (
        <button key={value} className={`rounded-2xl px-4 py-3 font-black ${active === value ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-50"}`} onClick={() => setActive(value)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">{title}</h2>
          <button className="rounded-xl bg-orange-100 px-3 py-2 font-black text-orange-700" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AiTeacher({ mood }: { mood: "wave" | "celebrate" }) {
  return <motion.div animate={{ rotate: mood === "wave" ? [0, -4, 4, 0] : [0, 8, -8, 0], scale: mood === "celebrate" ? [1, 1.06, 1] : 1 }} transition={{ repeat: Infinity, duration: 1.7 }} className="text-8xl">🤖</motion.div>;
}

function StudentDrawer({ item }: { item: SessionStudent }) {
  return (
    <div>
      <StudentProfile student={item.student} />
      <div className="mt-5 rounded-3xl bg-orange-50 p-4">
        <p className="font-black">Current Exercise: {item.activity}</p>
        <p className="text-sm text-slate-600">Progress {item.progress}% · Current score {item.currentScore}% · Flag {item.flag}</p>
      </div>
    </div>
  );
}

function StudentProfile({ student }: { student: Student }) {
  return (
    <div>
      <h3 className="text-xl font-black">{student.name}</h3>
      <p className="text-slate-500">Class {student.classNumber}-{student.section} · User ID {student.userId}</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData(student.scores)}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <Radar dataKey="score" fill="#f97316" fillOpacity={0.35} stroke="#f97316" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatusFlag({ flag }: { flag: SessionStudent["flag"] }) {
  const style = flag === "ok" ? "bg-green-100 text-green-700" : flag === "idle" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${style}`}>{flag === "ok" ? "Active" : flag === "idle" ? "Idle flag" : "Low score"}</span>;
}

function skillIcon(skill: Skill) {
  const map: Record<Skill, ReactNode> = {
    Listening: <Headphones size={20} />,
    Speaking: <Mic size={20} />,
    Reading: <BookOpen size={20} />,
    Writing: <PencilLine size={20} />,
  };
  return map[skill];
}

export default App;
