import type { Skill } from "./crm";

export type Submission = {
  id: string;
  studentId: string;
  studentName: string;
  classNumber: number;
  section: "A" | "B";
  skill: "Speaking" | "Writing";
  title: string;
  content: string;
  score?: number;
  status: "pending" | "reviewed";
  teacherScore?: number;
  teacherComment?: string;
  submittedAt: string;
};

export type AttendanceRecord = {
  date: string;
  classNumber: number;
  section: "A" | "B";
  studentId: string;
  status: "present" | "absent" | "late";
  markedBy: string;
};

export type LiveActivity = {
  studentId: string;
  skill: Skill | "Idle";
  progress: number;
  updatedAt: string;
};

export type LabCompletion = {
  studentId: string;
  date: string;
  skill: Skill;
  score: number;
  xpGained: number;
  at: string;
};

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  rule: "streak_7" | "speaking_80" | "wpm_100" | "all_tasks_day" | "xp_2000" | "first_lab";
};

export type SchoolProfile = {
  name: string;
  logoUrl?: string;
  address: string;
  academicYear: string;
  term: "1" | "2" | "3";
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  active: boolean;
  audience: "all" | "student" | "teacher";
};

export type ScoreToast = {
  skill: Skill;
  score: number;
  xpGained: number;
  newBadges: string[];
} | null;

export type AppStoreState = {
  students: import("./student").Student[];
  teachers: import("./student").Teacher[];
  submissions: Submission[];
  attendance: AttendanceRecord[];
  liveActivities: LiveActivity[];
  completions: LabCompletion[];
  school: SchoolProfile;
  announcements: Announcement[];
  showHindiHints: boolean;
};
