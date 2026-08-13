import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { Skill } from "../types/crm";
import type {
  Announcement,
  AppStoreState,
  AttendanceRecord,
  LabCompletion,
  SchoolProfile,
  ScoreToast,
  Submission,
} from "../types/progress";
import type { Student, Teacher } from "../types/student";
import { loadAppStoreState, saveAppStoreState } from "../lib/persist";
import { applyLabScore, classRank, leaderboardFor } from "../lib/scoring";
import { todayISO } from "../lib/aiTaskGenerator";
import { writeLiveActivity } from "../lib/liveActivity";
import { bindStudentStore } from "../api/students";
import { createSubmission as stubCreateSubmission } from "../api/submissions";

type Action =
  | { type: "hydrate"; state: AppStoreState }
  | { type: "setStudents"; students: Student[] }
  | { type: "addStudents"; students: Student[] }
  | { type: "updateStudent"; student: Student }
  | { type: "resetPassword"; studentId: string; password: string }
  | { type: "addCompletion"; completion: LabCompletion; student: Student }
  | { type: "addSubmission"; submission: Submission }
  | { type: "reviewSubmission"; id: string; teacherScore: number; teacherComment: string }
  | { type: "markAttendance"; records: AttendanceRecord[] }
  | { type: "upsertTeacher"; teacher: Teacher }
  | { type: "setSchool"; school: SchoolProfile }
  | { type: "addAnnouncement"; announcement: Announcement }
  | { type: "updateAnnouncement"; announcement: Announcement }
  | { type: "setHindiHints"; value: boolean };

function reducer(state: AppStoreState, action: Action): AppStoreState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "setStudents":
      return { ...state, students: action.students };
    case "addStudents":
      return { ...state, students: [...state.students, ...action.students] };
    case "updateStudent":
      return {
        ...state,
        students: state.students.map((s) => (s.id === action.student.id ? action.student : s)),
      };
    case "resetPassword":
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.studentId ? { ...s, password: action.password } : s,
        ),
      };
    case "addCompletion":
      return {
        ...state,
        students: state.students.map((s) => (s.id === action.student.id ? action.student : s)),
        completions: [action.completion, ...state.completions].slice(0, 400),
      };
    case "addSubmission":
      return { ...state, submissions: [action.submission, ...state.submissions] };
    case "reviewSubmission":
      return {
        ...state,
        submissions: state.submissions.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: "reviewed" as const,
                teacherScore: action.teacherScore,
                teacherComment: action.teacherComment,
              }
            : item,
        ),
      };
    case "markAttendance": {
      const keys = new Set(
        action.records.map((r) => `${r.date}|${r.classNumber}|${r.section}|${r.studentId}`),
      );
      const kept = state.attendance.filter(
        (r) => !keys.has(`${r.date}|${r.classNumber}|${r.section}|${r.studentId}`),
      );
      return { ...state, attendance: [...kept, ...action.records] };
    }
    case "upsertTeacher": {
      const exists = state.teachers.some((t) => t.id === action.teacher.id);
      return {
        ...state,
        teachers: exists
          ? state.teachers.map((t) => (t.id === action.teacher.id ? action.teacher : t))
          : [...state.teachers, action.teacher],
      };
    }
    case "setSchool":
      return { ...state, school: action.school };
    case "addAnnouncement":
      return { ...state, announcements: [action.announcement, ...state.announcements] };
    case "updateAnnouncement":
      return {
        ...state,
        announcements: state.announcements.map((item) =>
          item.id === action.announcement.id ? action.announcement : item,
        ),
      };
    case "setHindiHints":
      return { ...state, showHindiHints: action.value };
    default:
      return state;
  }
}

type AppStoreValue = {
  state: AppStoreState;
  students: Student[];
  teachers: AppStoreState["teachers"];
  submissions: Submission[];
  attendance: AttendanceRecord[];
  completions: LabCompletion[];
  school: SchoolProfile;
  announcements: Announcement[];
  showHindiHints: boolean;
  lastToast: ScoreToast;
  clearToast: () => void;
  addStudents: (students: Student[]) => void;
  resetPassword: (studentId: string, password: string) => void;
  completeLab: (studentId: string, skill: Skill, score: number) => ScoreToast;
  practicedSkillToday: (studentId: string, skill: Skill) => boolean;
  addSubmission: (submission: Omit<Submission, "id" | "submittedAt" | "status">) => void;
  reviewSubmission: (id: string, teacherScore: number, teacherComment: string) => void;
  markAttendance: (records: AttendanceRecord[]) => void;
  upsertTeacher: (teacher: Teacher) => void;
  setSchool: (school: SchoolProfile) => void;
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt">) => void;
  updateAnnouncement: (announcement: Announcement) => void;
  setHindiHints: (value: boolean) => void;
  pulseActivity: (studentId: string, skill: Skill | "Idle", progress: number) => void;
  rankFor: (studentId: string) => { rank: number; total: number };
  leaderboard: (classNumber: number, section: "A" | "B") => Student[];
  studentById: (id: string) => Student | undefined;
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadAppStoreState());
  const [lastToast, setLastToast] = useState<ScoreToast>(null);

  useEffect(() => {
    saveAppStoreState(state);
  }, [state]);

  useEffect(() => {
    bindStudentStore(() => state.students);
  }, [state.students]);

  const completeLab = useCallback(
    (studentId: string, skill: Skill, score: number): ScoreToast => {
      const student = state.students.find((s) => s.id === studentId);
      if (!student) return null;
      const result = applyLabScore(student, skill, score);
      const date = todayISO();
      dispatch({
        type: "addCompletion",
        student: result.student,
        completion: {
          studentId,
          date,
          skill,
          score,
          xpGained: result.xpGained,
          at: new Date().toISOString(),
        },
      });
      const toast: ScoreToast = {
        skill,
        score,
        xpGained: result.xpGained,
        newBadges: result.newBadges,
      };
      setLastToast(toast);
      return toast;
    },
    [state.students],
  );

  const addSubmission = useCallback(
    (submission: Omit<Submission, "id" | "submittedAt" | "status">) => {
      const item: Submission = {
        ...submission,
        id: `sub-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };
      void stubCreateSubmission(item);
      dispatch({ type: "addSubmission", submission: item });
    },
    [],
  );

  const value = useMemo<AppStoreValue>(
    () => ({
      state,
      students: state.students,
      teachers: state.teachers,
      submissions: state.submissions,
      attendance: state.attendance,
      completions: state.completions,
      school: state.school,
      announcements: state.announcements,
      showHindiHints: state.showHindiHints,
      lastToast,
      clearToast: () => setLastToast(null),
      addStudents: (students) => dispatch({ type: "addStudents", students }),
      resetPassword: (studentId, password) => dispatch({ type: "resetPassword", studentId, password }),
      completeLab,
      practicedSkillToday: (studentId, skill) =>
        state.completions.some(
          (c) => c.studentId === studentId && c.skill === skill && c.date === todayISO(),
        ),
      addSubmission,
      reviewSubmission: (id, teacherScore, teacherComment) =>
        dispatch({ type: "reviewSubmission", id, teacherScore, teacherComment }),
      markAttendance: (records) => dispatch({ type: "markAttendance", records }),
      upsertTeacher: (teacher) => dispatch({ type: "upsertTeacher", teacher }),
      setSchool: (school) => dispatch({ type: "setSchool", school }),
      addAnnouncement: (announcement) =>
        dispatch({
          type: "addAnnouncement",
          announcement: {
            ...announcement,
            id: `ann-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
        }),
      updateAnnouncement: (announcement) => dispatch({ type: "updateAnnouncement", announcement }),
      setHindiHints: (value) => dispatch({ type: "setHindiHints", value }),
      pulseActivity: (studentId, skill, progress) => writeLiveActivity(studentId, skill, progress),
      rankFor: (studentId) => classRank(state.students, studentId),
      leaderboard: (classNumber, section) => leaderboardFor(state.students, classNumber, section),
      studentById: (id) => state.students.find((s) => s.id === id),
    }),
    [state, lastToast, completeLab, addSubmission],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
