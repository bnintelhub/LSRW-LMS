import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useReducer,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  RefreshCcw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  UserRound,
  Users,
  Volume2,
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

type Role = "admin" | "teacher" | "student";
type Skill = "Listening" | "Speaking" | "Reading" | "Writing";
type Profile = "Foundational" | "Elementary" | "Exam-Track" | "Advanced";
type Activity = Skill | "Idle";
type View = "home" | Skill;

type Scores = Record<Skill, number>;

type SpeechAnalysis = {
  transcript: string;
  pronunciation: number;
  fluency: number;
  confidence: number;
  pace: number;
  clarity: number;
};

type SpeechRecognitionResultLike = {
  readonly 0: { transcript: string };
};

type SpeechRecognitionEventLike = Event & {
  results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

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
    ui: "Mascot-led voice-first games",
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
      title: "Pop the Sound Bubble",
      prompt: "Listen to the mascot and pop the picture bubble that matches.",
      task: "Audio says: 'This is a red ball'",
      metric: "engagement",
    },
    Speaking: {
      title: "Mascot Repeat",
      prompt: "Say the happy sentence after Bunny: This is a ball.",
      task: "Record a 5 second answer and clap with the mascot.",
      metric: "pronunciation",
    },
    Reading: {
      title: "Picture Story Trail",
      prompt: "Match the picture card with the sight word.",
      task: "sun, ball, dog, cat",
      metric: "sight words",
    },
    Writing: {
      title: "Trace and Shine",
      prompt: "Trace the word and copy it once.",
      task: "Trace: SUN",
      metric: "letter formation",
    },
  },
  Elementary: {
    Listening: {
      title: "Dialogue Detective",
      prompt: "Listen to a short school announcement and fill the missing words.",
      task: "The science club meets on Friday after lunch.",
      metric: "detail capture",
    },
    Speaking: {
      title: "One-Minute Picture Talk",
      prompt: "Describe the classroom picture in 4 clear sentences.",
      task: "Use connectors: first, next, finally.",
      metric: "fluency",
    },
    Reading: {
      title: "Story Paragraph Lab",
      prompt: "Read the passage and answer vocabulary-in-context questions.",
      task: "A 180-word story about a school garden project.",
      metric: "comprehension",
    },
    Writing: {
      title: "Friendly Letter Builder",
      prompt: "Write a short paragraph or informal letter with correct punctuation.",
      task: "Write to a friend about your favourite activity.",
      metric: "grammar",
    },
  },
  "Exam-Track": {
    Listening: {
      title: "Board Pattern Listening",
      prompt: "Take notes from an extended audio passage and answer timed MCQs.",
      task: "Lecture excerpt: conserving water in cities.",
      metric: "accuracy under time",
    },
    Speaking: {
      title: "JAM Practice",
      prompt: "Speak for one minute on the topic without repetition.",
      task: "Topic: Technology in student life.",
      metric: "confidence",
    },
    Reading: {
      title: "Unseen Passage Drill",
      prompt: "Read a passage and answer inference, vocabulary, and factual questions.",
      task: "Board-style passage with 8 questions.",
      metric: "speed and accuracy",
    },
    Writing: {
      title: "Analytical Paragraph",
      prompt: "Write a structured response using the given data points.",
      task: "Compare online and library reading habits.",
      metric: "structure",
    },
  },
  Advanced: {
    Listening: {
      title: "Lecture Note Benchmark",
      prompt: "Summarize a professional talk and identify the speaker's position.",
      task: "Talk excerpt: ethical AI in education.",
      metric: "summarization",
    },
    Speaking: {
      title: "GD / Interview Studio",
      prompt: "Prepare a concise opening statement for a group discussion.",
      task: "Topic: Should internships be compulsory?",
      metric: "executive presence",
    },
    Reading: {
      title: "Editorial Analysis",
      prompt: "Analyze an editorial and separate argument, evidence, and tone.",
      task: "Opinion passage on climate policy.",
      metric: "critical reasoning",
    },
    Writing: {
      title: "Formal Report Desk",
      prompt: "Draft a formal report with recommendation and evidence.",
      task: "Report on improving communication in school clubs.",
      metric: "professional writing",
    },
  },
};

const speakingTargets: Record<Profile, string> = {
  Foundational: "This is a ball",
  Elementary: "This classroom is bright and friendly",
  "Exam-Track": "Technology helps students learn when it is used with discipline",
  Advanced: "Internships should build communication skills and professional confidence",
};

const listeningScripts: Record<Profile, string> = {
  Foundational: "This is a red ball. Tap the ball bubble.",
  Elementary: "The science club meets on Friday after lunch in the school library.",
  "Exam-Track": "Urban water conservation needs planning, citizen participation and regular monitoring.",
  Advanced: "Ethical artificial intelligence in education requires transparency, consent and measurable learning outcomes.",
};

function normalizeWords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function analyzeSpeech(target: string, transcript: string, durationSeconds: number, averageVolume: number): SpeechAnalysis {
  const targetWords = normalizeWords(target);
  const spokenWords = normalizeWords(transcript);
  const matched = targetWords.filter((word) => spokenWords.includes(word)).length;
  const pronunciation = targetWords.length ? (matched / targetWords.length) * 100 : 0;
  const pace = durationSeconds > 0 ? (spokenWords.length / durationSeconds) * 60 : 0;
  const idealPace = targetWords.length <= 5 ? 55 : 105;
  const fluency = 100 - Math.abs(pace - idealPace) * 0.55;
  const confidence = 45 + averageVolume * 95;
  const clarity = pronunciation * 0.55 + fluency * 0.25 + confidence * 0.2;
  return {
    transcript,
    pronunciation: clampScore(pronunciation),
    fluency: clampScore(fluency),
    confidence: clampScore(confidence),
    pace: Math.round(pace),
    clarity: clampScore(clarity),
  };
}

function speakText(text: string, langCode = "en", rate = 1, onEnd?: () => void) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    console.warn("SpeechSynthesis API is not supported in this browser.");
    onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  const langMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    or: "or-IN",
    pa: "pa-IN",
    ur: "ur-PK",
  };
  const targetLang = langMap[langCode] ?? "en-US";

  const play = (retry = true) => {
    const voices = synth.getVoices();
    const matchedVoice =
      voices.find((voice) => voice.lang === targetLang) ??
      voices.find((voice) => voice.lang.startsWith(targetLang.split("-")[0])) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.voice = matchedVoice ?? null;
    utterance.rate = Math.max(0.5, Math.min(2, rate));
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    synth.cancel();
    window.setTimeout(() => {
      synth.resume();
      synth.speak(utterance);
    }, 20);

    if (retry) {
      window.setTimeout(() => {
        if (!synth.speaking && !synth.pending) play(false);
      }, 350);
    }
  };

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null;
      play();
    };
    window.setTimeout(() => play(), 500);
    return;
  }

  play();
}

function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function playSoundEffect(type: "record_start" | "record_stop" | "success" | "click" | "chime") {
  try {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "success" || type === "chime") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.frequency.value = freq;
        const noteTime = now + index * 0.08;
        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);
        oscillator.start(noteTime);
        oscillator.stop(noteTime + 0.2);
      });
      window.setTimeout(() => void ctx.close(), 650);
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = type === "click" ? "triangle" : "sine";
    const startFreq = type === "record_stop" ? 880 : type === "click" ? 600 : 440;
    const endFreq = type === "record_stop" ? 440 : 880;
    oscillator.frequency.setValueAtTime(startFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);
    gain.gain.setValueAtTime(type === "click" ? 0.1 : 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    oscillator.start(now);
    oscillator.stop(now + 0.16);
    window.setTimeout(() => void ctx.close(), 260);
  } catch (error) {
    console.warn("Web Audio effect failed", error);
  }
}

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
            <Feature icon={<Sparkles />} title="Junior games" text="Mascot, bubbles, matching cards and reward bursts for Classes 1-3." />
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
          <div className={profile === "Foundational" ? "mascot-card" : "rounded-3xl bg-orange-50 p-5"}>
            <div className="text-4xl">{profile === "Foundational" ? "🦊" : profile === "Advanced" ? "🎯" : "📚"}</div>
            <h2 className="mt-3 text-xl font-black">{student.name}</h2>
            <p className="text-sm font-semibold text-slate-500">
              Class {student.classNumber}-{student.section} · {meta.level}
            </p>
          </div>
          <nav className="mt-5 space-y-2">
            <SideButton active={view === "home"} icon={<Home size={17} />} label="Dashboard" onClick={() => setView("home")} />
            {skills.map((skill) => (
              <SideButton key={skill} active={view === skill} icon={skillIcon(skill)} label={skill} onClick={() => setView(skill)} />
            ))}
          </nav>
        </aside>

        <section>
          {view === "home" ? (
            <StudentHome student={student} profile={profile} meta={meta} students={students} setView={setView} avg={avg} />
          ) : (
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
  return (
    <div className="space-y-6">
      <HeroCard profile={profile}>
        <div>
          <Badge icon={<Award size={17} />} text={`Class ${student.classNumber} · ${meta.cefr} · ${meta.ui}`} />
          <h1 className="mt-4 text-3xl font-black md:text-5xl">
            {profile === "Foundational"
              ? "Ready to play, listen and speak?"
              : profile === "Elementary"
                ? "Today's LSRW learning path"
                : profile === "Exam-Track"
                  ? "Exam practice dashboard"
                  : "Communication readiness dashboard"}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">Focus for this class: {meta.focus}. All lessons use class-specific scores and progress.</p>
        </div>
        {profile === "Foundational" && <Mascot mood="wave" />}
      </HeroCard>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Average" value={`${avg}%`} icon={<BarChart3 />} />
        <Metric title="Streak" value={`${student.streak} days`} icon={<Sparkles />} />
        <Metric title={profile === "Advanced" ? "Benchmark" : "Coins"} value={profile === "Advanced" ? "Top 28%" : String(student.coins)} icon={<Star />} />
        <Metric title="XP" value={String(student.xp)} icon={<Award />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">{profile === "Foundational" ? "Animated Lessons" : "Today's Lessons"}</h2>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">No dead links</span>
          </div>
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
                  <span className="block text-lg font-black">{lessonCopy[profile][skill].title}</span>
                  <span className="text-sm text-slate-600">{lessonCopy[profile][skill].prompt}</span>
                </span>
                {profile === "Foundational" && <span className="gif-orbit" />}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-black">
            {profile === "Foundational" ? "Badge Shelf" : "Skill Radar"}
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
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [choice, setChoice] = useState("");
  const [speechAnalysis, setSpeechAnalysis] = useState<SpeechAnalysis | null>(null);
  const content = lessonCopy[profile][skill];

  const submit = () => {
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setSubmitted(true);
    }, 650);
  };

  return (
    <div className="space-y-6">
      <HeroCard profile={profile}>
        <div>
          <button className="mb-4 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-orange-700" onClick={() => setView("home")}>
            Back to dashboard
          </button>
          <Badge icon={skillIcon(skill)} text={`${profile} ${skill} practice · Class ${student.classNumber}`} />
          <h1 className="mt-4 text-4xl font-black">{content.title}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">{content.prompt}</p>
        </div>
        {profile === "Foundational" && <Mascot mood={submitted ? "celebrate" : "wave"} />}
      </HeroCard>

      {profile === "Foundational" ? (
        <FoundationalGame
          skill={skill}
          profile={profile}
          choice={choice}
          setChoice={setChoice}
          submit={submit}
          onSpeechAnalysis={setSpeechAnalysis}
        />
      ) : (
        <StructuredPractice
          profile={profile}
          skill={skill}
          content={content}
          choice={choice}
          setChoice={setChoice}
          submit={submit}
          onSpeechAnalysis={setSpeechAnalysis}
        />
      )}

      <AnimatePresence>
        {(processing || submitted) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm"
          >
            {processing ? (
              <div className="flex items-center gap-3 font-black text-orange-600">
                <span className="loader" /> AI speech/writing scorer processing...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Pronunciation", speechAnalysis?.pronunciation ?? student.scores.Speaking],
                  ["Fluency", speechAnalysis?.fluency ?? Math.min(98, student.scores.Speaking + 4)],
                  ["Confidence", speechAnalysis?.confidence ?? student.scores.Speaking],
                  ["Clarity", speechAnalysis?.clarity ?? student.scores.Reading],
                ].map(([label, score]) => (
                  <div key={label} className="rounded-3xl bg-orange-50 p-5">
                    <p className="text-sm font-bold text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-black text-orange-600">{score}%</p>
                  </div>
                ))}
                {speechAnalysis?.transcript && (
                  <div className="md:col-span-4 rounded-3xl border border-orange-100 p-4">
                    <p className="text-sm font-black text-slate-500">Heard by browser mic</p>
                    <p className="mt-1 text-slate-700">"{speechAnalysis.transcript}"</p>
                    <p className="mt-2 text-xs font-bold text-orange-700">Pace: {speechAnalysis.pace} words/min</p>
                  </div>
                )}
                {profile === "Foundational" && <Confetti />}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FoundationalGame({
  skill,
  profile,
  choice,
  setChoice,
  submit,
  onSpeechAnalysis,
}: {
  skill: Skill;
  profile: Profile;
  choice: string;
  setChoice: (choice: string) => void;
  submit: () => void;
  onSpeechAnalysis: (analysis: SpeechAnalysis) => void;
}) {
  const options = skill === "Listening" ? ["⚽ Ball", "🐘 Elephant", "🌞 Sun", "🐶 Dog"] : ["SUN", "CAT", "DOG", "BALL"];
  const [audioStatus, setAudioStatus] = useState("Tap speaker to hear Bunny.");
  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3 rounded-3xl bg-orange-50 p-4">
        <button
          className="grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-white"
          onClick={() => {
            playSoundEffect("click");
            setAudioStatus("Playing Bunny voice...");
            speakText(listeningScripts[profile], "en", 0.85, () => setAudioStatus("Audio finished. Choose the answer now."));
          }}
        >
          <Volume2 />
        </button>
        <div>
          <p className="font-black">Tap speaker, then choose. Voice instruction is available for pre-readers.</p>
          <p className="text-sm text-slate-500">
            {skill === "Writing" ? "Trace with your finger, then copy the word." : "Mascot will clap when you choose correctly."}
          </p>
          <p className="mt-1 text-xs font-bold text-orange-700">{audioStatus}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {options.map((option) => (
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -5 }}
            key={option}
            className={`min-h-32 rounded-[2rem] border-4 text-2xl font-black ${
              choice === option ? "border-orange-400 bg-orange-100" : "border-orange-100 bg-white"
            }`}
            onClick={() => setChoice(option)}
          >
            {option}
          </motion.button>
        ))}
      </div>
      {(skill === "Speaking" || skill === "Reading") && (
        <div className="mt-5">
          <VoiceAnalyzer
            label={skill === "Speaking" ? "Say this with Bunny" : "Read this sight sentence aloud"}
            target={speakingTargets[profile]}
            onAnalysis={onSpeechAnalysis}
            junior
          />
        </div>
      )}
      {skill === "Writing" && <WritingAnalyzer target="SUN" junior />}
      <button className="mt-5 rounded-2xl bg-orange-500 px-6 py-3 font-black text-white" onClick={submit}>
        Finish Game
      </button>
    </div>
  );
}

function StructuredPractice({
  profile,
  skill,
  content,
  choice,
  setChoice,
  submit,
  onSpeechAnalysis,
}: {
  profile: Profile;
  skill: Skill;
  content: { title: string; prompt: string; task: string; metric: string };
  choice: string;
  setChoice: (choice: string) => void;
  submit: () => void;
  onSpeechAnalysis: (analysis: SpeechAnalysis) => void;
}) {
  const isSerious = profile === "Exam-Track" || profile === "Advanced";
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">{content.task}</h2>
          {isSerious && (
            <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-600">
              <Clock size={16} /> 12:00
            </span>
          )}
        </div>
        {skill === "Listening" && <WavePlayer script={listeningScripts[profile]} />}
        {skill === "Speaking" && (
          <VoiceAnalyzer
            label="Speak into the mic for live browser analysis"
            target={speakingTargets[profile]}
            onAnalysis={onSpeechAnalysis}
          />
        )}
        {skill === "Reading" && (
          <>
            <ReadingPassage advanced={profile === "Advanced"} />
            <div className="mt-4">
              <VoiceAnalyzer
                label="Read the passage aloud"
                target={profile === "Advanced" ? "Communication is a measurable professional competency" : "The school garden became a cheerful reading corner"}
                onAnalysis={onSpeechAnalysis}
              />
            </div>
          </>
        )}
        {skill === "Writing" && <WritingAnalyzer target={profile === "Advanced" ? "formal report recommendation evidence communication" : "dear friend favourite activity"} />}
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["A. Main idea", "B. Supporting detail", "C. Vocabulary clue", "D. Inference"].map((option) => (
            <button key={option} className={`rounded-2xl border p-4 text-left font-bold ${choice === option ? "border-orange-400 bg-orange-50" : "border-slate-200"}`} onClick={() => setChoice(option)}>
              {option}
            </button>
          ))}
        </div>
        <button className="mt-5 rounded-2xl bg-orange-500 px-6 py-3 font-black text-white" onClick={submit}>
          Submit for AI Score
        </button>
      </div>
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black">Feedback Target</h3>
        <p className="mt-3 text-slate-600">This activity measures {content.metric}. Scores are pre-baked for demo credibility and revealed after a short processing animation.</p>
        <div className="mt-5 space-y-3">
          {["Pronunciation", "Fluency", "Confidence", "Grammar"].map((item, index) => (
            <div key={item}>
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>{item}</span>
                <span>{82 + index * 3}%</span>
              </div>
              <div className="h-2 rounded-full bg-orange-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${82 + index * 3}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ students, dispatch }: { students: Student[]; dispatch: (action: AppAction) => void }) {
  const [tab, setTab] = useState<"overview" | "onboard" | "students" | "reports">("overview");
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
        ]}
      />
      {tab === "overview" && <AdminOverview students={students} />}
      {tab === "onboard" && <BulkOnboarding dispatch={dispatch} />}
      {tab === "students" && <StudentManagement students={students} dispatch={dispatch} />}
      {tab === "reports" && <AdminReports students={students} />}
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
  const [tab, setTab] = useState<"dashboard" | "live" | "roster" | "reviews">("dashboard");
  const [activeClass, setActiveClass] = useState(teacher.allotted[0]);
  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <DashboardTabs
        active={tab}
        setActive={(value) => setTab(value as typeof tab)}
        tabs={[
          ["dashboard", "Teacher Dashboard"],
          ["live", "Live Monitoring"],
          ["roster", "Roster"],
          ["reviews", "Pending Reviews"],
        ]}
      />
      {tab === "dashboard" && <TeacherHome teacher={teacher} students={students} activeClass={activeClass} setActiveClass={setActiveClass} setTab={setTab} />}
      {tab === "live" && <LiveMonitoring activeClass={activeClass} students={students} />}
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
  setTab: (tab: "dashboard" | "live" | "roster" | "reviews") => void;
}) {
  const scoped = students.filter((student) => teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section));
  return (
    <div className="space-y-6">
      <HeroCard profile={teacher.band}>
        <div>
          <Badge icon={<UserRound size={17} />} text={`${teacher.band} Teacher · scoped access only`} />
          <h1 className="mt-4 text-4xl font-black">Welcome, {teacher.name}</h1>
          <p className="mt-3 text-slate-600">Start lab sessions, watch students live, add remarks and review speaking/writing submissions.</p>
        </div>
      </HeroCard>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Scoped Students" value={String(scoped.length)} icon={<Users />} />
        <Metric title="Allotted Sections" value={String(teacher.allotted.length)} icon={<School />} />
        <Metric title="Pending Reviews" value="8" icon={<PencilLine />} />
        <Metric title="Live Readiness" value="Good" icon={<MonitorDot />} />
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

function LiveMonitoring({ activeClass, students }: { activeClass: { classNumber: number; section: "A" | "B" }; students: Student[] }) {
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
    const completion = Math.round(sessionStudents.reduce((sum, item) => sum + item.progress, 0) / sessionStudents.length);
    return (
      <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
        <Badge icon={<CheckCircle2 size={17} />} text="Session Summary" />
        <h1 className="mt-4 text-4xl font-black">Class {activeClass.classNumber}-{activeClass.section} lab period completed</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric title="Completion" value={`${completion}%`} icon={<CheckCircle2 />} />
          <Metric title="Average Score" value={`${Math.round(sessionStudents.reduce((sum, item) => sum + item.currentScore, 0) / sessionStudents.length)}%`} icon={<BarChart3 />} />
          <Metric title="Time Spent" value="38 min" icon={<Clock />} />
          <Metric title="Flags" value={String(sessionStudents.filter((item) => item.flag !== "ok").length)} icon={<Flag />} />
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
        <button className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white" onClick={() => setEnded(true)}>End Session</button>
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
  const scoped = students.filter((student) => teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section));
  const [selected, setSelected] = useState<Student | null>(null);
  const [remark, setRemark] = useState("");
  const [remarks, setRemarks] = useState<string[]>([]);
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
              <button className="mt-3 rounded-2xl bg-orange-500 px-4 py-2 font-black text-white" onClick={() => {
                if (remark.trim()) setRemarks((items) => [...items, `${selected.name}: ${remark}`]);
                setRemark("");
              }}>
                Add Remark
              </button>
              <div className="mt-3 space-y-2">
                {remarks.map((item, index) => <p key={index} className="rounded-2xl bg-orange-50 p-3 text-sm">{item}</p>)}
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

function Mascot({ mood }: { mood: "wave" | "celebrate" }) {
  return <motion.div animate={{ rotate: mood === "wave" ? [0, -8, 8, 0] : [0, 14, -14, 0], scale: mood === "celebrate" ? [1, 1.08, 1] : 1 }} transition={{ repeat: Infinity, duration: 1.7 }} className="text-8xl">🦊</motion.div>;
}

function Confetti() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{Array.from({ length: 16 }, (_, index) => <span key={index} className="confetti" style={{ left: `${5 + index * 6}%`, animationDelay: `${index * 0.04}s` }} />)}</div>;
}

function WavePlayer({ script }: { script: string }) {
  const [status, setStatus] = useState("Click play to hear the listening passage.");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const play = (nextSpeed = speed) => {
    playSoundEffect("click");
    setIsPlaying(true);
    setStatus("Playing browser TTS audio...");
    speakText(script, "en", nextSpeed, () => {
      setIsPlaying(false);
      setStatus("Audio finished. Answer the question now.");
    });
  };

  const stop = () => {
    stopSpeech();
    setIsPlaying(false);
    setStatus("Audio stopped.");
  };

  return (
    <div className="rounded-3xl bg-orange-50 p-5">
      <div className="flex items-center gap-4">
        <button className="grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-white" onClick={() => (isPlaying ? stop() : play())}><Play /></button>
        <div className="flex h-14 flex-1 items-center gap-1">
          {Array.from({ length: 36 }, (_, index) => <span key={index} className="wavebar" style={{ height: `${16 + ((index * 11) % 34)}px` }} />)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="rounded-xl bg-white px-3 py-2 text-xs font-black text-orange-700" onClick={stop}>Stop</button>
        <span className="text-xs font-black text-slate-500">Speed:</span>
        {[0.75, 1, 1.25, 1.5].map((item) => (
          <button
            key={item}
            className={`rounded-xl px-3 py-2 text-xs font-black ${speed === item ? "bg-orange-500 text-white" : "bg-white text-orange-700"}`}
            onClick={() => {
              setSpeed(item);
              if (isPlaying) play(item);
            }}
          >
            {item}x
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-600">{status}</p>
      <p className="mt-1 text-xs text-slate-500">Text being spoken: "{script}"</p>
    </div>
  );
}

function VoiceAnalyzer({
  label,
  target,
  onAnalysis,
  junior = false,
}: {
  label: string;
  target: string;
  onAnalysis: (analysis: SpeechAnalysis) => void;
  junior?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [levels, setLevels] = useState<number[]>(Array.from({ length: 24 }, () => 8));
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [message, setMessage] = useState("Mic ready. Browser may ask permission.");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const volumeSamplesRef = useRef<number[]>([]);
  const startedAtRef = useRef<number>(0);
  const transcriptRef = useRef("");

  const stopAudio = () => {
    if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioContextRef.current?.close();
    recognitionRef.current?.stop();
    streamRef.current = null;
    audioContextRef.current = null;
    recognitionRef.current = null;
  };

  useEffect(() => () => stopAudio(), []);

  const start = async () => {
    try {
      playSoundEffect("record_start");
      const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 128;
      const data = new Uint8Array(analyser.frequencyBinCount);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      volumeSamplesRef.current = [];
      transcriptRef.current = "";
      startedAtRef.current = performance.now();
      setTranscript("");
      setAnalysis(null);
      setRecording(true);
      setMessage(SpeechRecognition ? "Listening live. Speak clearly into the mic." : "Mic level active. Speech transcript is not supported in this browser.");

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";
        recognition.onresult = (event) => {
          const text = Array.from({ length: event.results.length }, (_, index) => event.results[index][0].transcript).join(" ");
          transcriptRef.current = text;
          setTranscript(text);
        };
        recognition.onerror = () => setMessage("Speech recognition had trouble, but mic level analysis is still running.");
        recognition.start();
        recognitionRef.current = recognition;
      }

      const draw = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((sum, value) => sum + value, 0) / data.length / 255;
        volumeSamplesRef.current.push(avg);
        setLevels((items) => [...items.slice(1), Math.max(8, avg * 72)]);
        animationRef.current = window.requestAnimationFrame(draw);
      };
      draw();
    } catch {
      setMessage("Mic permission denied or unavailable. Allow microphone access and try again.");
    }
  };

  const stop = () => {
    playSoundEffect("record_stop");
    const duration = Math.max(1, (performance.now() - startedAtRef.current) / 1000);
    const averageVolume =
      volumeSamplesRef.current.reduce((sum, value) => sum + value, 0) /
      Math.max(1, volumeSamplesRef.current.length);
    const text = transcriptRef.current.trim();
    const result = analyzeSpeech(target, text, duration, averageVolume);
    setAnalysis(result);
    onAnalysis(result);
    playSoundEffect("chime");
    setRecording(false);
    setMessage(text ? "Analysis complete from your mic input." : "Mic heard audio level, but no clear English transcript was detected.");
    stopAudio();
  };

  return (
    <div className={`rounded-3xl ${junior ? "bg-orange-50" : "bg-slate-50"} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-orange-600">{label}</p>
          <p className="mt-1 text-lg font-black">Target: "{target}"</p>
        </div>
        <button className={`flex items-center gap-2 rounded-full px-5 py-3 font-black text-white ${recording ? "bg-slate-900" : "bg-orange-500"}`} onClick={recording ? stop : start}>
          <Mic size={18} /> {recording ? "Stop & Analyze" : "Start Mic"}
        </button>
      </div>
      <div className="mt-4 flex h-16 items-end gap-1 rounded-2xl bg-white p-3">
        {levels.map((level, index) => <span key={index} className="voicebar" style={{ height: `${level}px` }} />)}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-600">{message}</p>
      {transcript && (
        <div className="mt-3 rounded-2xl border border-orange-100 bg-white p-3">
          <p className="text-xs font-black text-slate-500">Live transcript</p>
          <p className="text-slate-700">"{transcript}"</p>
        </div>
      )}
      {analysis && (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Pronunciation", analysis.pronunciation],
            ["Fluency", analysis.fluency],
            ["Confidence", analysis.confidence],
            ["Clarity", analysis.clarity],
          ].map(([title, value]) => (
            <div key={title} className="rounded-2xl bg-white p-3">
              <p className="text-xs font-bold text-slate-500">{title}</p>
              <p className="text-2xl font-black text-orange-600">{value}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReadingPassage({ advanced }: { advanced: boolean }) {
  return <div className="rounded-3xl bg-slate-50 p-5 leading-8 text-slate-700">{advanced ? "The editorial argues that communication is no longer a soft skill but a measurable professional competency. Students must analyze evidence, detect tone, and build a precise response." : "The school garden started with five small plants. Every student watered one plant and wrote a note about its growth. Soon the garden became a cheerful reading corner."} <button className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">tap-to-define</button></div>;
}

function WritingAnalyzer({ target, junior = false }: { target: string; junior?: boolean }) {
  const [text, setText] = useState(junior ? "SUN" : "");
  const words = normalizeWords(text);
  const targetWords = normalizeWords(target);
  const matched = targetWords.filter((word) => words.includes(word)).length;
  const grammar = clampScore(55 + Math.min(35, words.length * 2) + (/[.!?]$/.test(text.trim()) ? 10 : 0));
  const vocabulary = clampScore(targetWords.length ? (matched / targetWords.length) * 100 : 0);
  const structure = clampScore(junior ? (text.trim().length >= 3 ? 92 : 40) : 45 + Math.min(45, words.length));
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <textarea
        className="h-44 w-full rounded-3xl border border-orange-100 bg-white p-5 outline-orange-400"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={junior ? "Copy the word here" : "Write your answer here for live local analysis"}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric title="Words" value={String(words.length)} icon={<PencilLine />} />
        <Metric title="Grammar" value={`${grammar}%`} icon={<CheckCircle2 />} />
        <Metric title="Vocabulary" value={`${vocabulary}%`} icon={<BookOpen />} />
        <Metric title="Structure" value={`${structure}%`} icon={<BarChart3 />} />
      </div>
    </div>
  );
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
