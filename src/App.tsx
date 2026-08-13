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
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  Flag,
  Headphones,
  Home,
  LogOut,
  Megaphone,
  Mic,
  MonitorDot,
  PencilLine,
  Play,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Upload,
  UserRound,
  Users,
  ClipboardList,
  FileText,
  Inbox,
  AlertCircle,
  HelpCircle,
  Settings,
  SpellCheck,
  MessagesSquare,
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
import {
  DebatePractice,
  LearningPath,
  MockInterview,
  PhonicsModule,
  SpellingBee,
  StoryMode,
} from "./features/student/engagement";
import { ParentReport } from "./features/parent/ParentReport";
import { CopyParentLink } from "./features/parent/CopyParentLink";
import { parseParentShare } from "./lib/parentLink";
import { StudentDailyTasks } from "./features/student/DailyTasks";
import { StudentDailyReport } from "./features/student/DailyReport";
import { DailyTaskDesk } from "./features/teacher/DailyTaskDesk";
import { SubmissionInbox } from "./features/teacher/SubmissionInbox";
import { AttendancePanel } from "./features/teacher/AttendancePanel";
import { ClassSnapshot } from "./features/teacher/ClassSnapshot";
import { exportClassReport } from "./features/teacher/ClassExport";
import { SchoolCrmReports } from "./features/admin/SchoolCrmReports";
import { TeacherManagement } from "./features/admin/TeacherManagement";
import { SchoolProfileForm } from "./features/admin/SchoolProfile";
import { AcademicYear } from "./features/admin/AcademicYear";
import { AnnouncementBanner, AnnouncementsAdmin } from "./features/admin/Announcements";
import { allotmentsFromTeachers } from "./lib/persist";
import { SessionTimer, elapsedMinutes } from "./components/SessionTimer";
import { getLiveActivity, isStale } from "./lib/liveActivity";
import { useCrm } from "./context/CrmContext";
import { todayISO } from "./lib/aiTaskGenerator";
import { Chatbot } from "./components/Chatbot";
import { WordOfDayModal } from "./components/WordOfDayModal";
import { Leaderboard } from "./components/Leaderboard";
import { BadgeGrid } from "./components/BadgeGrid";
import { HomeworkBanner } from "./components/HomeworkBanner";
import { HindiHintToggle } from "./components/HindiHintToggle";
import { ScoreToastBanner } from "./components/ScoreToastBanner";
import { PortalShell, WelcomeBanner, Sparkline, RingProgress } from "./components/PortalShell";
import {
  getWordForDate,
  hasSeenWordToday,
  markWordSeen,
} from "./data/wordOfTheDay";
import { useAppStore } from "./context/AppStoreContext";
import { useLiveActivity } from "./hooks/useLiveActivity";
import { credentialUserId, randomPassword, scoreFor } from "./data/seed";
import type { Student, Teacher } from "./types/student";

/** Class 1–4: game labs. Class 5–12: AI Speaking/Listening/Reading/Writing labs. */
function isGameBand(classNumber: number) {
  return classNumber < 5;
}

type Role = "admin" | "teacher" | "student";
type Skill = "Listening" | "Speaking" | "Reading" | "Writing";
type Profile = "Foundational" | "Elementary" | "Exam-Track" | "Advanced";
type Activity = Skill | "Idle";
type ExtraView = "phonics" | "story" | "spelling" | "debate" | "interview";
type View = "home" | "tasks" | "report" | "leaderboard" | "badges" | "help" | ExtraView | Skill;

function isSkillView(view: View): view is Skill {
  return view === "Listening" || view === "Speaking" || view === "Reading" || view === "Writing";
}

type Scores = Record<Skill, number>;

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
};

type AppAction =
  | { type: "login"; session: Session }
  | { type: "logout" };

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

function createAccounts(students: Student[], teacherList: Teacher[]): Account[] {
  const admin: Account = {
    id: "admin",
    label: "School Admin - Full School Access",
    role: "admin",
    userId: "admin",
    password: "admin123",
  };
  const teacherAccounts = teacherList
    .filter((teacher) => teacher.active !== false)
    .map<Account>((teacher) => ({
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
  const { students, teachers, school, lastToast, clearToast } = useAppStore();
  const { dispatch: crmDispatch } = useCrm();
  const [share, setShare] = useState(() => parseParentShare());
  const [state, dispatch] = useReducer(appReducer, {
    session: null,
  });
  const accounts = useMemo(() => createAccounts(students, teachers), [students, teachers]);
  const teacherSession = state.session?.role === "teacher" ? state.session : null;
  const sessionTeacher = teacherSession
    ? teachers.find((teacher) => teacher.id === teacherSession.teacherId && teacher.active !== false)
    : undefined;

  useEffect(() => {
    const sync = () => setShare(parseParentShare());
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  useEffect(() => {
    crmDispatch({ type: "setAllotments", allotments: allotmentsFromTeachers(teachers) });
  }, [teachers, crmDispatch]);

  useEffect(() => {
    // Preload browser voices so Listen Target Sentence works on first click
    if (!("speechSynthesis" in window)) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warm);
  }, []);

  if (share) {
    return <ParentReport studentId={share.studentId} token={share.token} />;
  }

  if (!state.session) {
    return <LoginPage accounts={accounts} students={students} dispatch={dispatch} />;
  }

  const session = state.session;

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      {session.role === "admin" && (
        <AdminDashboard
          students={students}
          schoolName={school.name}
          onLogout={() => dispatch({ type: "logout" })}
        />
      )}
      {session.role === "teacher" && sessionTeacher && (
        <TeacherDashboard
          teacher={sessionTeacher}
          students={students}
          schoolName={school.name}
          onLogout={() => dispatch({ type: "logout" })}
        />
      )}
      {session.role === "student" && (
        <StudentExperience
          studentId={session.studentId}
          students={students}
          onLogout={() => dispatch({ type: "logout" })}
        />
      )}
      <SessionChatbot session={session} students={students} />
      <ScoreToastBanner toast={lastToast} onClose={clearToast} />
    </div>
  );
}

function SessionChatbot({ session, students }: { session: Session; students: Student[] }) {
  const { isClassSessionActive } = useCrm();
  const student =
    session.role === "student"
      ? students.find((s) => s.id === session.studentId)
      : undefined;
  return (
    <Chatbot
      role={session.role}
      studentClass={
        student
          ? { classNumber: student.classNumber, section: student.section }
          : undefined
      }
      isSessionActive={
        student
          ? isClassSessionActive(student.classNumber, student.section)
          : undefined
      }
    />
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
  const { isClassSessionActive } = useCrm();
  const [role, setRole] = useState<Role>("admin");
  const filtered = accounts.filter((account) => account.role === role);
  const [selected, setSelected] = useState<Account>(filtered[0]);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    setSelected(accounts.find((account) => account.role === role)!);
    setLoginError("");
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
      if (!isClassSessionActive(student.classNumber, student.section)) {
        setLoginError(
          `Your class has not been started by your teacher. Please wait for Class ${student.classNumber}-${student.section} session to begin.`,
        );
        return;
      }
      setLoginError("");
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

  const selectedStudent =
    role === "student" && selected?.studentId
      ? students.find((s) => s.id === selected.studentId)
      : undefined;
  const classSessionLive =
    selectedStudent &&
    isClassSessionActive(selectedStudent.classNumber, selectedStudent.section);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fed7aa,transparent_34%),linear-gradient(135deg,#fff,rgba(255,247,237,.95))] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <section className="panel-card p-8">
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

        <section className="panel-card">
          <div className="flex gap-2 rounded-2xl bg-orange-50 p-2">
            {(["admin", "teacher", "student"] as Role[]).map((item) => (
              <button
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold capitalize transition ${
                  role === item ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "text-slate-600"
                }`}
                key={item}
                onClick={() => setRole(item)}
              >
                {item === "admin" ? "School Admin" : item}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Login form</p>
            {role === "student" && selectedStudent && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  classSessionLive
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                <MonitorDot size={16} />
                {classSessionLive
                  ? `Class ${selectedStudent.classNumber}-${selectedStudent.section} session is live — you can log in.`
                  : `Waiting for teacher to start Class ${selectedStudent.classNumber}-${selectedStudent.section} session.`}
              </div>
            )}
            {loginError && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
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
      <Chatbot
        role="guest"
        studentClass={
          selectedStudent
            ? { classNumber: selectedStudent.classNumber, section: selectedStudent.section }
            : undefined
        }
        isSessionActive={classSessionLive || undefined}
      />
    </main>
  );
}

function Header({ session, dispatch }: { session: Session; dispatch: (action: AppAction) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 px-6 py-3.5 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white shadow-sm">
            <School />
          </div>
          <div>
            <p className="font-black">LSRW Language Lab</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
              {session.role} demo session
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.role === "student" && <HindiHintToggle />}
          <button className="flex items-center gap-2 rounded-2xl border border-orange-200 px-4 py-2 font-bold text-orange-600" onClick={() => dispatch({ type: "logout" })}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function StudentExperience({
  studentId,
  students,
  onLogout,
}: {
  studentId: string;
  students: Student[];
  onLogout: () => void;
}) {
  const { studentById, practicedSkillToday, school, completeLab, addSubmission } = useAppStore();
  const { publishedTasksFor } = useCrm();
  const student = studentById(studentId) ?? students.find((item) => item.id === studentId);
  const [view, setView] = useState<View>("home");
  const date = todayISO();
  const word = getWordForDate(date);
  const [showWotd, setShowWotd] = useState(() => !hasSeenWordToday(studentId, date));
  const searchItems = useMemo(() => {
    if (!student) return [];
    const tasks = publishedTasksFor({ date, classNumber: student.classNumber, section: student.section });
    const classmates = students.filter(
      (item) =>
        item.id !== student.id &&
        item.classNumber === student.classNumber &&
        item.section === student.section,
    );
    return [
      ...tasks.map((task) => ({
        id: `task-${task.id}`,
        label: task.title,
        hint: `${task.skill} · ${task.estimatedMinutes} min`,
        category: "Tasks",
        keywords: [task.skill, task.prompt],
        onSelect: () => setView("tasks"),
      })),
      ...classmates.map((mate) => ({
        id: `mate-${mate.id}`,
        label: mate.name,
        hint: `Class ${mate.classNumber}-${mate.section} · Roll ${mate.roll}`,
        category: "Classmates",
        keywords: [String(mate.roll), mate.userId],
        onSelect: () => setView("leaderboard"),
      })),
      {
        id: "wotd",
        label: word.word,
        hint: `Word of the Day · ${word.meaning}`,
        category: "Word of the Day",
        keywords: [word.meaning, word.pronunciation, word.hindi ?? ""],
        onSelect: () =>
          window.dispatchEvent(
            new CustomEvent("lsrw-open-chatbot", { detail: { prompt: "Word of the day" } }),
          ),
      },
      ...(student.classNumber <= 2
        ? [{ id: "nav-phonics", label: "Phonics", hint: "Letter sounds and blending", category: "Practice", onSelect: () => setView("phonics" as View) }]
        : []),
      ...(student.classNumber <= 4
        ? [{ id: "nav-story", label: "Story Mode", hint: "Picture story read-along", category: "Practice", onSelect: () => setView("story" as View) }]
        : []),
      ...(student.classNumber >= 3 && student.classNumber <= 6
        ? [{ id: "nav-spelling", label: "Spelling Bee", hint: "Weekly word list", category: "Practice", onSelect: () => setView("spelling" as View) }]
        : []),
      ...(student.classNumber >= 9
        ? [{ id: "nav-debate", label: "Debate / GD", hint: "Two-minute topic card", category: "Practice", onSelect: () => setView("debate" as View) }]
        : []),
      ...(student.classNumber >= 11
        ? [{ id: "nav-interview", label: "Mock Interview", hint: "Question deck", category: "Practice", onSelect: () => setView("interview" as View) }]
        : []),
    ];
  }, [student, students, date, word, publishedTasksFor]);
  if (!student) return null;
  const meta = classMeta[student.classNumber];
  const profile = meta.profile;
  const avg = average(student.scores);
  const gameMode = isGameBand(student.classNumber);
  const initials = student.name.split(" ").map((p) => p[0]).join("").slice(0, 2);

  const closeWotd = () => {
    markWordSeen(student.id, date);
    setShowWotd(false);
  };

  const nav = [
    { id: "home", label: "Dashboard", icon: <Home size={17} /> },
    { id: "tasks", label: "Today's Tasks", icon: <ClipboardList size={17} /> },
    { id: "report", label: "Daily Report", icon: <FileText size={17} /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={17} /> },
    { id: "badges", label: "My Badges", icon: <Award size={17} /> },
    ...(student.classNumber <= 2
      ? [{ id: "phonics", label: "Phonics", icon: <Sparkles size={17} /> }]
      : []),
    ...(student.classNumber <= 4
      ? [{ id: "story", label: "Story Mode", icon: <BookOpen size={17} /> }]
      : []),
    ...(student.classNumber >= 3 && student.classNumber <= 6
      ? [{ id: "spelling", label: "Spelling Bee", icon: <SpellCheck size={17} /> }]
      : []),
    ...(student.classNumber >= 9
      ? [{ id: "debate", label: "Debate / GD", icon: <MessagesSquare size={17} /> }]
      : []),
    ...(student.classNumber >= 11
      ? [{ id: "interview", label: "Mock Interview", icon: <Briefcase size={17} /> }]
      : []),
    ...(gameMode
      ? [
          { id: "Listening", label: "Listening Game", icon: <Headphones size={17} /> },
          { id: "Speaking", label: "Speaking Game", icon: <Mic size={17} /> },
          { id: "Reading", label: "Reading Game", icon: <BookOpen size={17} /> },
          { id: "Writing", label: "Writing Game", icon: <PencilLine size={17} /> },
        ]
      : [
          { id: "Speaking", label: "AI Speaking Lab", icon: <Mic size={17} /> },
          { id: "Listening", label: "Listening Studio", icon: <Headphones size={17} /> },
          { id: "Reading", label: "Reading & WPM", icon: <BookOpen size={17} /> },
          { id: "Writing", label: "Writing AI Checker", icon: <PencilLine size={17} /> },
        ]),
    { id: "help", label: "Help & Support", icon: <HelpCircle size={17} /> },
  ];

  return (
    <>
      <WordOfDayModal open={showWotd} word={word} date={date} onClose={closeWotd} />
      <PortalShell
        brand={school.name}
        roleLabel="Student Panel"
        greeting={`Hello, ${student.name.split(" ")[0]}`}
        personName={student.name}
        personMeta={`Class ${student.classNumber}-${student.section}`}
        initials={initials}
        nav={nav}
        active={view}
        onNav={(id) => setView(id as View)}
        onLogout={onLogout}
        searchItems={searchItems}
        headerExtra={<HindiHintToggle />}
        promo={{
          title: "Word of the Day",
          text: "Open the chatbot anytime to revise today's word.",
          action: "Ask Assistant",
          onClick: () =>
            window.dispatchEvent(
              new CustomEvent("lsrw-open-chatbot", { detail: { prompt: "Word of the day" } }),
            ),
        }}
      >
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
            practicedSkillToday={(skill) => practicedSkillToday(student.id, skill)}
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
        {view === "leaderboard" && (
          <Leaderboard
            students={students
              .filter((item) => item.classNumber === student.classNumber && item.section === student.section)
              .sort((a, b) => b.xp - a.xp)
              .slice(0, 10)}
            currentId={student.id}
          />
        )}
        {view === "badges" && <BadgeGrid earned={student.badges} />}
        {view === "phonics" && (
          <PhonicsModule classNumber={student.classNumber} onComplete={(score) => completeLab(student.id, "Reading", score)} />
        )}
        {view === "story" && (
          <StoryMode classNumber={student.classNumber} onComplete={(score) => completeLab(student.id, "Reading", score)} />
        )}
        {view === "spelling" && (
          <SpellingBee classNumber={student.classNumber} onComplete={(score) => completeLab(student.id, "Writing", score)} />
        )}
        {view === "debate" && (
          <DebatePractice
            studentId={student.id}
            classNumber={student.classNumber}
            onComplete={(score, transcript, title) => {
              completeLab(student.id, "Speaking", score);
              addSubmission({
                studentId: student.id,
                studentName: student.name,
                classNumber: student.classNumber,
                section: student.section,
                skill: "Speaking",
                title,
                content: transcript || title,
                score,
              });
            }}
          />
        )}
        {view === "interview" && (
          <MockInterview
            studentId={student.id}
            onComplete={(score, transcript, title) => {
              completeLab(student.id, "Speaking", score);
              addSubmission({
                studentId: student.id,
                studentName: student.name,
                classNumber: student.classNumber,
                section: student.section,
                skill: "Speaking",
                title,
                content: transcript || title,
                score,
              });
            }}
          />
        )}
        {view === "help" && (
          <div className="panel-card">
            <h1 className="text-2xl font-black">Help & Support</h1>
            <p className="mt-2 text-slate-600">Use the LSRW Assistant chatbot for Word of the Day, labs, and login help.</p>
          </div>
        )}
        {isSkillView(view) && <PracticeScreen student={student} profile={profile} skill={view} setView={setView} />}
      </PortalShell>
    </>
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
  const { rankFor, showHindiHints } = useAppStore();
  const { publishedTasksFor } = useCrm();
  const chartData = skills.map((skill) => ({
    skill,
    score: student.scores[skill],
    classAvg: classAverage(students, student.classNumber),
  }));
  const gameMode = isGameBand(student.classNumber);
  const rank = rankFor(student.id);
  const date = todayISO();
  const tasks = publishedTasksFor({ date, classNumber: student.classNumber, section: student.section });
  const remaining = tasks.filter((t) => !t.completedBy.includes(student.id)).length;
  const wotd = getWordForDate(date);
  return (
    <div className="space-y-6">
      <AnnouncementBanner audience="student" />
      <WelcomeBanner
        badge={`Class ${student.classNumber} · ${meta.cefr} · ${gameMode ? "Game Mode" : "AI Lab Mode"}`}
        title={
          gameMode
            ? `Good day, ${student.name.split(" ")[0]}!`
            : `Good day, ${student.name.split(" ")[0]}!`
        }
        text={
          gameMode
            ? "Play, listen, speak and win stars with today's LSRW games."
            : "Your communication labs, tasks, and progress are ready for today's session."
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Average" value={`${avg}%`} icon={<BarChart3 />} accent="orange" />
        <Metric title="Streak" value={`${student.streak} days`} icon={<Sparkles />} accent="purple" />
        <Metric title="Class Rank" value={`#${rank.rank}`} icon={<Star />} accent="green" />
        <Metric title="XP" value={String(student.xp)} icon={<Award />} accent="blue" />
      </div>

      <HomeworkBanner remaining={remaining} onOpenTasks={() => setView("tasks")} />
      {student.classNumber >= 5 && <LearningPath student={student} onOpenSkill={(skill) => setView(skill)} />}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="word-of-day-strip">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-500 text-2xl text-white shadow-lg shadow-orange-200">
              📖
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Word of the Day</p>
              <p className="text-xl font-black text-slate-900">{wotd.word}</p>
              <p className="text-sm text-slate-500">{wotd.meaning}</p>
              {showHindiHints && wotd.hindi && (
                <p className="mt-1 text-sm font-semibold text-orange-700">Hindi: {wotd.hindi}</p>
              )}
            </div>
          </div>
        </div>
        <div className="panel-card flex items-center justify-center">
          <RingProgress
            value={tasks.length ? Math.round(((tasks.length - remaining) / tasks.length) * 100) : 0}
            label="Today's tasks"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="content-card">
            <h2 className="mb-4 flex items-center justify-between text-xl font-black text-slate-900">
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
        <div className="content-card">
          <h2 className="mb-3 text-xl font-black text-slate-900">
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
        <div className="panel-card">
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
  const { completeLab, addSubmission } = useAppStore();
  useLiveActivity(student.id, skill, true);
  const onScore = (score: number) => completeLab(student.id, skill, score);
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
          {skill === "Listening" && <ListeningGame classNumber={student.classNumber} onComplete={onScore} />}
          {skill === "Speaking" && <SpeakingGame classNumber={student.classNumber} onComplete={onScore} />}
          {skill === "Reading" && <ReadingGame classNumber={student.classNumber} onComplete={onScore} />}
          {skill === "Writing" && <WritingGame classNumber={student.classNumber} onComplete={onScore} />}
        </>
      ) : (
        <>
          {skill === "Speaking" && (
            <SpeakingLab
              profile={profile}
              classNumber={student.classNumber}
              onEvaluationComplete={(result) => {
                onScore(result.overallScore);
                addSubmission({
                  studentId: student.id,
                  studentName: student.name,
                  classNumber: student.classNumber,
                  section: student.section,
                  skill: "Speaking",
                  title: "Speaking lab recording",
                  content: result.transcribedText || `Speaking score ${result.overallScore}%`,
                  score: result.overallScore,
                });
              }}
            />
          )}
          {skill === "Listening" && (
            <ListeningLab profile={profile} classNumber={student.classNumber} onComplete={onScore} />
          )}
          {skill === "Reading" && (
            <ReadingLab profile={profile} classNumber={student.classNumber} onComplete={onScore} />
          )}
          {skill === "Writing" && (
            <WritingLab
              profile={profile}
              classNumber={student.classNumber}
              onComplete={onScore}
              onSubmitWriting={({ title, content, score }) =>
                addSubmission({
                  studentId: student.id,
                  studentName: student.name,
                  classNumber: student.classNumber,
                  section: student.section,
                  skill: "Writing",
                  title,
                  content,
                  score,
                })
              }
            />
          )}
        </>
      )}
    </div>
  );
}

function AdminDashboard({
  students,
  schoolName,
  onLogout,
}: {
  students: Student[];
  schoolName: string;
  onLogout: () => void;
}) {
  const { state } = useCrm();
  const { teachers } = useAppStore();
  const [tab, setTab] = useState<
    | "overview"
    | "profile"
    | "teachers"
    | "onboard"
    | "students"
    | "reports"
    | "crm"
    | "announcements"
    | "settings"
    | "help"
  >("overview");
  const [focusStudentId, setFocusStudentId] = useState<string | null>(null);
  const searchItems = useMemo(
    () => [
      ...students.map((student) => ({
        id: `student-${student.id}`,
        label: student.name,
        hint: `Class ${student.classNumber}-${student.section} · Roll ${student.roll}`,
        category: "Students",
        keywords: [student.userId, student.mobile, String(student.roll)],
        onSelect: () => {
          setFocusStudentId(student.id);
          setTab("students");
        },
      })),
      ...Array.from({ length: 12 }, (_, index) => index + 1).flatMap((classNumber) =>
        (["A", "B"] as const).map((section) => ({
          id: `class-${classNumber}-${section}`,
          label: `Class ${classNumber}-${section}`,
          hint: "Open class reports",
          category: "Classes",
          onSelect: () => setTab("reports"),
        })),
      ),
      ...teachers.map((teacher) => ({
        id: `teacher-${teacher.id}`,
        label: teacher.name,
        hint: `${teacher.band} · ${teacher.allotted.map((slot) => `${slot.classNumber}-${slot.section}`).join(", ")}`,
        category: "Teachers",
        keywords: [teacher.userId, teacher.band],
        onSelect: () => setTab("teachers"),
      })),
      ...state.tasks.map((task) => ({
        id: `task-${task.id}`,
        label: task.title,
        hint: `${task.skill} · Class ${task.classNumber}-${task.section} · ${task.status}`,
        category: "Tasks",
        keywords: [task.skill, task.prompt, task.status],
        onSelect: () => setTab("crm"),
      })),
    ],
    [students, teachers, state.tasks],
  );
  return (
    <PortalShell
      brand={schoolName}
      roleLabel="Admin Panel"
      greeting="Hello, Admin"
      personName="School Admin"
      personMeta="Full school access"
      initials="SA"
      nav={[
        { id: "overview", label: "Dashboard", icon: <Home size={17} /> },
        { id: "profile", label: "School Profile", icon: <School size={17} /> },
        { id: "teachers", label: "Teachers", icon: <UserRound size={17} /> },
        { id: "onboard", label: "Bulk Onboarding", icon: <Upload size={17} /> },
        { id: "students", label: "Students", icon: <Users size={17} /> },
        { id: "reports", label: "Reports", icon: <BarChart3 size={17} /> },
        { id: "crm", label: "School CRM", icon: <School size={17} /> },
        { id: "announcements", label: "Announcements", icon: <Megaphone size={17} /> },
        { id: "settings", label: "Settings", icon: <Settings size={17} /> },
        { id: "help", label: "Help & Support", icon: <HelpCircle size={17} /> },
      ]}
      active={tab}
      onNav={(id) => setTab(id as typeof tab)}
      onLogout={onLogout}
      searchItems={searchItems}
    >
      {tab === "overview" && <AdminOverview students={students} />}
      {tab === "profile" && <SchoolProfileForm />}
      {tab === "teachers" && <TeacherManagement />}
      {tab === "onboard" && <BulkOnboarding />}
      {tab === "students" && <StudentManagement students={students} focusStudentId={focusStudentId} />}
      {tab === "reports" && <AdminReports students={students} />}
      {tab === "crm" && <SchoolCrmReports students={students} />}
      {tab === "announcements" && <AnnouncementsAdmin />}
      {tab === "settings" && <AcademicYear />}
      {tab === "help" && (
        <div className="panel-card">
          <h1 className="text-2xl font-black">Help & Support</h1>
          <p className="mt-2 text-slate-600">Use the LSRW Assistant for onboarding, allotments, and report questions.</p>
        </div>
      )}
    </PortalShell>
  );
}

function AdminOverview({ students }: { students: Student[] }) {
  const { school, teachers } = useAppStore();
  const activeTeachers = teachers.filter((teacher) => teacher.active !== false);
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
      <WelcomeBanner
        badge="School Admin"
        title={`Good morning, Admin!`}
        text={`${school.name} · ${school.academicYear} · Term ${school.term}. Manage teachers, allotments, and school-wide LSRW analytics.`}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Students" value={String(students.length)} icon={<Users />} accent="orange" />
        <Metric title="Classes" value="12" icon={<School />} accent="purple" />
        <Metric title="Teachers" value={String(activeTeachers.length)} icon={<UserRound />} accent="green" />
        <Metric title="Avg Score" value={`${Math.round(students.reduce((sum, s) => sum + average(s.scores), 0) / students.length)}%`} icon={<BarChart3 />} accent="blue" />
      </div>
      <div className="panel-card">
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

function BulkOnboarding() {
  const { addStudents } = useAppStore();
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
        badges: [],
        lastActiveDate: "",
        valid: reasons.length === 0,
        reason: reasons.join(", "),
      };
    });
    setRows(parsed);
  };

  const confirm = () => {
    const validStudents = rows.filter((row) => row.valid).map((row) => row as Student);
    addStudents(validStudents);
    setRows([]);
    window.alert(`${validStudents.length} valid students onboarded and credentials generated.`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="panel-card">
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
      <div className="panel-card">
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

function StudentManagement({ students, focusStudentId }: { students: Student[]; focusStudentId?: string | null }) {
  const { resetPassword: savePassword } = useAppStore();
  const [classFilter, setClassFilter] = useState(1);
  const [sectionFilter, setSectionFilter] = useState<"A" | "B">("A");
  const [resetStudent, setResetStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!focusStudentId) return;
    const found = students.find((student) => student.id === focusStudentId);
    if (!found) return;
    setClassFilter(found.classNumber);
    setSectionFilter(found.section);
  }, [focusStudentId, students]);
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
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl bg-orange-100 px-3 py-2 font-bold text-orange-700" onClick={() => setResetStudent(row.original)}>
            Reset Password
          </button>
          <CopyParentLink studentId={row.original.id} />
        </div>
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
    savePassword(resetStudent.id, password);
    setResetStudent({ ...resetStudent, password });
  };

  return (
    <div className="panel-card">
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
              <tr key={row.id} className={`border-b border-slate-100 ${row.original.id === focusStudentId ? "bg-orange-50" : ""}`}>
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
  const { school, teachers } = useAppStore();
  const rows = Array.from({ length: 12 }, (_, index) => {
    const classNumber = index + 1;
    return { name: `Class ${classNumber}`, score: classAverage(students, classNumber), profile: classMeta[classNumber].profile };
  });
  return (
    <div className="panel-card">
      <p className="text-xs font-black uppercase tracking-wide text-orange-600">
        {school.name} · {school.academicYear} · Term {school.term}
      </p>
      <h1 className="mt-2 text-3xl font-black">School Reports</h1>
      <p className="mt-2 text-slate-500">
        Class-wise analytics for {teachers.filter((teacher) => teacher.active !== false).length} active teachers.
      </p>
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

type TeacherTab =
  | "dashboard"
  | "tasks"
  | "live"
  | "roster"
  | "reviews"
  | "submissions"
  | "reports"
  | "settings"
  | "help"
  | "attendance";

function TeacherDashboard({
  teacher,
  students,
  schoolName,
  onLogout,
}: {
  teacher: Teacher;
  students: Student[];
  schoolName: string;
  onLogout: () => void;
}) {
  const { state } = useCrm();
  const [tab, setTab] = useState<TeacherTab>("dashboard");
  const [activeClass, setActiveClass] = useState(
    teacher.allotted[0] ?? { classNumber: 1, section: "A" as const },
  );
  const [focusStudentId, setFocusStudentId] = useState<string | null>(null);
  const scoped = students.filter((student) =>
    teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section),
  );
  const searchItems = useMemo(
    () => [
      ...teacher.allotted.map((slot) => ({
        id: `class-${slot.classNumber}-${slot.section}`,
        label: `Class ${slot.classNumber}-${slot.section}`,
        hint: "Open live monitoring",
        category: "Classes",
        onSelect: () => {
          setActiveClass(slot);
          setTab("live");
        },
      })),
      ...scoped.map((student) => ({
        id: `student-${student.id}`,
        label: student.name,
        hint: `Class ${student.classNumber}-${student.section} · Roll ${student.roll}`,
        category: "Students",
        keywords: [student.userId, String(student.roll)],
        onSelect: () => {
          setActiveClass({ classNumber: student.classNumber, section: student.section });
          setFocusStudentId(student.id);
          setTab("roster");
        },
      })),
      ...state.tasks
        .filter((task) =>
          teacher.allotted.some(
            (slot) =>
              slot.classNumber === task.classNumber &&
              (task.section === "ALL" || slot.section === task.section),
          ),
        )
        .map((task) => ({
          id: `task-${task.id}`,
          label: task.title,
          hint: `${task.skill} · Class ${task.classNumber}-${task.section} · ${task.status}`,
          category: "Tasks",
          keywords: [task.skill, task.prompt],
          onSelect: () => setTab("tasks"),
        })),
    ],
    [teacher.allotted, scoped, state.tasks],
  );
  return (
    <PortalShell
      brand={schoolName}
      roleLabel="Teacher Panel"
      greeting={`Hello, ${teacher.name.split(" ")[0]}`}
      personName={teacher.name}
      personMeta={`${teacher.band} · English Department`}
      initials={teacher.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
      nav={[
        { id: "dashboard", label: "Dashboard", icon: <Home size={17} /> },
        { id: "tasks", label: "Daily Tasks", icon: <ClipboardList size={17} /> },
        { id: "live", label: "Live Monitoring", icon: <MonitorDot size={17} /> },
        { id: "submissions", label: "Submissions", icon: <Inbox size={17} /> },
        { id: "roster", label: "Roster", icon: <Users size={17} /> },
        { id: "reviews", label: "Pending Reviews", icon: <PencilLine size={17} /> },
        { id: "attendance", label: "Attendance", icon: <Clock size={17} /> },
        { id: "reports", label: "Reports", icon: <BarChart3 size={17} /> },
        { id: "settings", label: "Settings", icon: <Settings size={17} /> },
        { id: "help", label: "Help & Support", icon: <HelpCircle size={17} /> },
      ]}
      active={tab}
      onNav={(id) => setTab(id as typeof tab)}
      onLogout={onLogout}
      searchItems={searchItems}
      promo={{
        title: "AI Task Generator",
        text: "Create LSRW packs for your class in one click.",
        action: "Try Now",
        onClick: () => setTab("tasks"),
      }}
    >
      {tab === "tasks" && (
        <DailyTaskDesk teacherId={teacher.id} allotted={teacher.allotted} students={students} />
      )}
      {tab === "dashboard" && (
        <TeacherHome teacher={teacher} students={students} activeClass={activeClass} setActiveClass={setActiveClass} setTab={setTab} />
      )}
      {tab === "live" && <LiveMonitoring activeClass={activeClass} students={students} teacher={teacher} />}
      {tab === "submissions" && <SubmissionInbox allotted={teacher.allotted} />}
      {tab === "roster" && <TeacherRoster teacher={teacher} students={students} focusStudentId={focusStudentId} />}
      {tab === "reviews" && <SubmissionInbox allotted={teacher.allotted} pendingOnly />}
      {tab === "attendance" && (
        <TeacherAttendanceView
          teacher={teacher}
          students={students}
          activeClass={activeClass}
          setActiveClass={setActiveClass}
        />
      )}
      {tab === "reports" && <TeacherClassReports teacher={teacher} students={students} />}
      {tab === "settings" && (
        <div className="panel-card">
          <h1 className="text-2xl font-black">Settings</h1>
          <p className="mt-2 text-slate-600">Notification and class preferences will live here in the next sprint.</p>
        </div>
      )}
      {tab === "help" && (
        <div className="panel-card">
          <h1 className="text-2xl font-black">Help & Support</h1>
          <p className="mt-2 text-slate-600">Use the LSRW Assistant for session start, daily tasks, and review workflows.</p>
        </div>
      )}
    </PortalShell>
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
  setTab: (tab: TeacherTab) => void;
}) {
  const { dispatch, isClassSessionActive, publishedTasksFor } = useCrm();
  const { submissions, attendance, markAttendance } = useAppStore();
  const [showAttendance, setShowAttendance] = useState(false);
  const date = todayISO();
  const wotd = getWordForDate(date);
  const scoped = students.filter((student) => teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section));
  const pending = submissions.filter(
    (item) =>
      item.status === "pending" &&
      teacher.allotted.some((slot) => slot.classNumber === item.classNumber && slot.section === item.section),
  ).length;
  const sessionLive = isClassSessionActive(activeClass.classNumber, activeClass.section, date);
  const classStudents = scoped.filter(
    (student) => student.classNumber === activeClass.classNumber && student.section === activeClass.section,
  );
  const published = publishedTasksFor({
    date,
    classNumber: activeClass.classNumber,
    section: activeClass.section,
  });
  const completionPct =
    published.length && classStudents.length
      ? Math.round(
          (published.reduce(
            (sum, task) => sum + task.completedBy.filter((id) => classStudents.some((s) => s.id === id)).length,
            0,
          ) /
            (published.length * classStudents.length)) *
            100,
        )
      : 0;

  const startSession = () => {
    if (sessionLive) {
      setTab("live");
      return;
    }
    setShowAttendance(true);
  };

  const confirmAttendance = (records: typeof attendance) => {
    markAttendance(records);
    dispatch({
      type: "startLabSession",
      session: {
        classNumber: activeClass.classNumber,
        section: activeClass.section,
        teacherId: teacher.id,
        teacherName: teacher.name,
        startedAt: new Date().toISOString(),
        date,
      },
    });
    setShowAttendance(false);
    setTab("live");
  };

  if (showAttendance) {
    return (
      <AttendancePanel
        key={`${activeClass.classNumber}-${activeClass.section}-home`}
        classNumber={activeClass.classNumber}
        section={activeClass.section}
        date={date}
        teacherId={teacher.id}
        students={classStudents}
        existing={attendance.filter(
          (row) =>
            row.date === date &&
            row.classNumber === activeClass.classNumber &&
            row.section === activeClass.section,
        )}
        onSave={confirmAttendance}
        onCancel={() => setShowAttendance(false)}
      />
    );
  }
  return (
    <div className="space-y-6">
      <AnnouncementBanner audience="teacher" />
      <WelcomeBanner
        badge={`${teacher.band} Teacher`}
        title={`Good morning, ${teacher.name.split(" ")[0]}!`}
        text="Assign AI daily tasks, start lab sessions, review submissions, and track class completion."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Students" value={String(scoped.length)} icon={<Users />} accent="orange" />
        <Metric title="Classes" value={String(teacher.allotted.length)} icon={<School />} accent="purple" />
        <Metric title="Pending Reviews" value={String(pending)} icon={<PencilLine />} accent="green" />
        <Metric title="Session" value={sessionLive ? "Live" : "Idle"} icon={<MonitorDot />} accent="blue" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="panel-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black">Start Lab Session</h2>
            {sessionLive && (
              <Badge icon={<MonitorDot size={17} />} text={`Class ${activeClass.classNumber}-${activeClass.section} is LIVE`} />
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Students can log in only after you start the session for their class.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {teacher.allotted.map((item) => (
              <button
                key={`${item.classNumber}-${item.section}`}
                className={`rounded-full px-4 py-2 text-sm font-black ${activeClass.classNumber === item.classNumber && activeClass.section === item.section ? "bg-orange-500 text-white" : "bg-violet-50 text-violet-700"}`}
                onClick={() => setActiveClass(item)}
              >
                Class {item.classNumber}-{item.section}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={startSession}>
              {sessionLive ? "Open Live Monitoring" : `Start Lab Session`}
            </button>
            <button className="rounded-xl border border-slate-200 px-5 py-2.5 font-black text-slate-700" onClick={() => setTab("tasks")}>
              Open Daily Tasks
            </button>
          </div>
        </div>
        <div className="space-y-5">
          <ClassSnapshot
            classNumber={activeClass.classNumber}
            section={activeClass.section}
            students={classStudents}
            published={published}
          />
          <div className="panel-card">
            <p className="text-xs font-black uppercase tracking-wide text-orange-600">Word of the Day</p>
            <p className="mt-1 text-2xl font-black">{wotd.word}</p>
            <p className="text-sm text-slate-500">{wotd.pronunciation}</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">{wotd.meaning}</p>
          </div>
          <div className="panel-card flex justify-center py-6">
            <RingProgress value={completionPct} label="Today's Progress" />
          </div>
          <div className="panel-card">
          <h2 className="mb-3 text-lg font-black">Today's Schedule</h2>
          {teacher.allotted.map((item, index) => (
            <div key={`${item.classNumber}-${item.section}`} className="schedule-row">
              <span className="schedule-dot" style={{ background: ["#f97316", "#22c55e", "#8b5cf6"][index % 3] }} />
              <div className="flex-1">
                <p className="text-sm font-black">Class {item.classNumber}-{item.section}</p>
                <p className="text-xs font-semibold text-slate-500">{8 + index}:30 AM · LSRW Lab</p>
              </div>
            </div>
          ))}
          </div>
        </div>
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
  const { dispatch, getActiveSession } = useCrm();
  const { attendance, markAttendance } = useAppStore();
  const date = todayISO();
  const roster = students.filter((student) => student.classNumber === activeClass.classNumber && student.section === activeClass.section);
  const session = getActiveSession(activeClass.classNumber, activeClass.section);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<SessionStudent | null>(null);
  const [ended, setEnded] = useState(false);
  const [lastMinutes, setLastMinutes] = useState(1);

  useEffect(() => {
    if (ended || !session) return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 2500);
    return () => window.clearInterval(interval);
  }, [ended, session]);

  const sessionStudents = roster.map<SessionStudent>((student) => {
    void tick;
    const live = getLiveActivity(student.id);
    const stale = isStale(live, 30_000);
    const activity = !live || stale ? "Idle" : live.skill;
    const progress = !live || stale ? 0 : live.progress;
    const skillForScore: Skill = activity === "Idle" ? "Listening" : activity;
    const currentScore = student.scores[skillForScore];
    const flag = activity === "Idle" ? "idle" : currentScore < 68 ? "low-score" : "ok";
    return { student, activity, progress, flag, currentScore };
  });

  const startFromAttendance = (records: typeof attendance) => {
    markAttendance(records);
    dispatch({
      type: "startLabSession",
      session: {
        classNumber: activeClass.classNumber,
        section: activeClass.section,
        teacherId: teacher.id,
        teacherName: teacher.name,
        startedAt: new Date().toISOString(),
        date,
      },
    });
  };

  if (!ended && !session) {
    return (
      <AttendancePanel
        key={`${activeClass.classNumber}-${activeClass.section}-live`}
        classNumber={activeClass.classNumber}
        section={activeClass.section}
        date={date}
        teacherId={teacher.id}
        students={roster}
        existing={attendance.filter(
          (row) =>
            row.date === date &&
            row.classNumber === activeClass.classNumber &&
            row.section === activeClass.section,
        )}
        saveLabel="Save attendance & go live"
        onSave={startFromAttendance}
      />
    );
  }

  if (ended) {
    const completion = Math.round(sessionStudents.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, sessionStudents.length));
    const averageScore = Math.round(sessionStudents.reduce((sum, item) => sum + item.currentScore, 0) / Math.max(1, sessionStudents.length));
    const flags = sessionStudents.filter((item) => item.flag !== "ok").length;
    return (
      <div className="panel-card p-8">
        <Badge icon={<CheckCircle2 size={17} />} text="Session Summary" />
        <h1 className="mt-4 text-4xl font-black">Class {activeClass.classNumber}-{activeClass.section} lab period completed</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric title="Completion" value={`${completion}%`} icon={<CheckCircle2 />} />
          <Metric title="Average Score" value={`${averageScore}%`} icon={<BarChart3 />} />
          <Metric title="Time Spent" value={`${lastMinutes} min`} icon={<Clock />} />
          <Metric title="Flags" value={String(flags)} icon={<Flag />} />
        </div>
        <button className="mt-6 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white" onClick={() => setEnded(false)}>
          Start New Session
        </button>
      </div>
    );
  }

  const endSession = () => {
    const completion = Math.round(sessionStudents.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, sessionStudents.length));
    const averageScore = Math.round(sessionStudents.reduce((sum, item) => sum + item.currentScore, 0) / Math.max(1, sessionStudents.length));
    const flags = sessionStudents.filter((item) => item.flag !== "ok").length;
    const minutes = elapsedMinutes(session?.startedAt ?? new Date().toISOString());
    setLastMinutes(minutes);
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
        timeSpentMin: minutes,
        flags,
      },
    });
    dispatch({
      type: "endLabSession",
      classNumber: activeClass.classNumber,
      section: activeClass.section,
    });
    setEnded(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 panel-card">
        <div>
          <Badge icon={<MonitorDot size={17} />} text="Live session running" />
          <h1 className="mt-2 text-3xl font-black">Class {activeClass.classNumber}-{activeClass.section} Monitoring Grid</h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">Heartbeat from student labs · Idle if no update in 30s</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {session && <SessionTimer startedAt={session.startedAt} />}
          <button className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white" onClick={endSession}>
            End Session
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sessionStudents.map((item) => (
          <button key={item.student.id} className="nested-card w-full text-left transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => setSelected(item)}>
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

function TeacherAttendanceView({
  teacher,
  students,
  activeClass,
  setActiveClass,
}: {
  teacher: Teacher;
  students: Student[];
  activeClass: { classNumber: number; section: "A" | "B" };
  setActiveClass: (value: { classNumber: number; section: "A" | "B" }) => void;
}) {
  const { attendance, markAttendance } = useAppStore();
  const date = todayISO();
  const roster = students.filter(
    (student) => student.classNumber === activeClass.classNumber && student.section === activeClass.section,
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {teacher.allotted.map((item) => (
          <button
            key={`${item.classNumber}-${item.section}`}
            className={`rounded-full px-4 py-2 text-sm font-black ${
              activeClass.classNumber === item.classNumber && activeClass.section === item.section
                ? "bg-orange-500 text-white"
                : "bg-violet-50 text-violet-700"
            }`}
            onClick={() => setActiveClass(item)}
          >
            Class {item.classNumber}-{item.section}
          </button>
        ))}
      </div>
      <AttendancePanel
        key={`${activeClass.classNumber}-${activeClass.section}-tab`}
        classNumber={activeClass.classNumber}
        section={activeClass.section}
        date={date}
        teacherId={teacher.id}
        students={roster}
        existing={attendance.filter(
          (row) =>
            row.date === date &&
            row.classNumber === activeClass.classNumber &&
            row.section === activeClass.section,
        )}
        saveLabel="Save attendance"
        onSave={markAttendance}
      />
    </div>
  );
}

function TeacherClassReports({ teacher, students }: { teacher: Teacher; students: Student[] }) {
  const { publishedTasksFor } = useCrm();
  const { attendance, submissions } = useAppStore();
  const date = todayISO();
  const rows = teacher.allotted.map((slot) => {
    const classStudents = students.filter(
      (student) => student.classNumber === slot.classNumber && student.section === slot.section,
    );
    const avg = classStudents.length
      ? Math.round(classStudents.reduce((sum, student) => sum + average(student.scores), 0) / classStudents.length)
      : 0;
    return {
      slot,
      label: `Class ${slot.classNumber}-${slot.section}`,
      students: classStudents.length,
      avg,
      classStudents,
    };
  });
  return (
    <div className="space-y-6">
      <WelcomeBanner
        badge="Class reports"
        title="Your allotted classes"
        text="Quick averages for the classes assigned to you. School-wide analytics stay with Admin."
      />
      <div className="panel-card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Class</th>
              <th className="px-5 py-3">Students</th>
              <th className="px-5 py-3">Avg score</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Export</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-100">
                <td className="px-5 py-3 font-black">{row.label}</td>
                <td className="px-5 py-3 font-semibold text-slate-600">{row.students}</td>
                <td className="px-5 py-3 font-black">{row.avg}%</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Active</span>
                </td>
                <td className="px-5 py-3">
                  <button
                    className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700"
                    onClick={() =>
                      exportClassReport({
                        classNumber: row.slot.classNumber,
                        section: row.slot.section,
                        date,
                        students: row.classStudents,
                        tasks: publishedTasksFor({
                          date,
                          classNumber: row.slot.classNumber,
                          section: row.slot.section,
                        }),
                        attendance: attendance.filter(
                          (item) =>
                            item.date === date &&
                            item.classNumber === row.slot.classNumber &&
                            item.section === row.slot.section,
                        ),
                        submissions: submissions.filter(
                          (item) => item.classNumber === row.slot.classNumber && item.section === row.slot.section,
                        ),
                      })
                    }
                  >
                    <Download size={14} /> Excel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeacherRoster({
  teacher,
  students,
  focusStudentId,
}: {
  teacher: Teacher;
  students: Student[];
  focusStudentId?: string | null;
}) {
  const { dispatch, reportFor } = useCrm();
  const scoped = students.filter((student) => teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section));
  const [selected, setSelected] = useState<Student | null>(null);
  const [remark, setRemark] = useState("");
  const date = todayISO();

  useEffect(() => {
    if (!focusStudentId) return;
    const found = students.find(
      (student) =>
        student.id === focusStudentId &&
        teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section),
    );
    if (found) setSelected(found);
  }, [focusStudentId, students, teacher.allotted]);
  return (
    <div className="panel-card">
      <h1 className="text-3xl font-black">Scoped Class Roster</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {scoped.map((student) => (
          <button
            key={student.id}
            className={`nested-card text-left hover:shadow-sm ${student.id === focusStudentId ? "ring-2 ring-orange-300" : ""}`}
            onClick={() => setSelected(student)}
          >
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
              <CopyParentLink studentId={selected.id} />
              <textarea className="mt-4 h-24 w-full rounded-2xl border border-slate-200 p-3" placeholder="Add teacher remark" value={remark} onChange={(event) => setRemark(event.target.value)} />
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

function downloadSheet(rows: Record<string, unknown>[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, fileName);
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-orange-100/80 bg-white p-5 shadow-sm">
      <div className="text-orange-500">{icon}</div>
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function Badge({ icon, text }: { icon: ReactNode; text: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">{icon}{text}</span>;
}

function Metric({
  title,
  value,
  icon,
  accent = "orange",
}: {
  title: string;
  value: string;
  icon: ReactNode;
  accent?: "orange" | "amber" | "yellow" | "rose" | "purple" | "green" | "blue";
}) {
  const spark = { orange: "#f97316", purple: "#7c3aed", green: "#059669", blue: "#2563eb", amber: "#d97706", yellow: "#ca8a04", rose: "#e11d48" }[accent];
  return (
    <div className={`metric-card metric-card-${accent}`}>
      <div className="flex items-start justify-between">
        <div className="metric-icon">{icon}</div>
        <Sparkline color={spark} />
      </div>
      <p className="metric-label">{title}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}

function HeroCard({ profile, children }: { profile: Profile; children: ReactNode }) {
  return <div className={`hero-card ${profile.toLowerCase().replace("-", "")}`}>{children}</div>;
}

function SideButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold ${
        active ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-orange-50"
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function DashboardTabs({ active, setActive, tabs }: { active: string; setActive: (value: string) => void; tabs: [string, string][] }) {
  return (
    <div className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
      {tabs.map(([value, label]) => (
        <button key={value} className={`rounded-xl px-4 py-2.5 text-sm font-black ${active === value ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-orange-50"}`} onClick={() => setActive(value)}>
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
      <div className="rounded-2xl bg-white p-6 shadow-2xl">
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
