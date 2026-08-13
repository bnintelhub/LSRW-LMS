export type Skill = "Listening" | "Speaking" | "Reading" | "Writing";
export type Scores = Record<Skill, number>;
export type TaskMode = "game" | "lab";
export type TaskStatus = "draft" | "published" | "done";
export type TaskSource = "ai" | "teacher";
export type Attendance = "present" | "absent" | "partial";

export type DailyTask = {
  id: string;
  date: string;
  classNumber: number;
  section: "A" | "B" | "ALL";
  skill: Skill;
  title: string;
  prompt: string;
  mode: TaskMode;
  status: TaskStatus;
  source: TaskSource;
  xpReward: number;
  estimatedMinutes: number;
  completedBy: string[];
};

export type TaskTemplate = {
  skill: Skill;
  title: string;
  prompt: string;
  mode: TaskMode;
  xpReward: number;
  estimatedMinutes: number;
};

export type DailyReport = {
  studentId: string;
  date: string;
  skills: Scores;
  tasksCompleted: number;
  tasksTotal: number;
  timeSpentMin: number;
  attendance: Attendance;
  teacherRemarks: string[];
  sessionSummary?: string;
};

export type LabSessionRecord = {
  id: string;
  date: string;
  classNumber: number;
  section: "A" | "B";
  teacherId: string;
  teacherName: string;
  completionPct: number;
  averageScore: number;
  timeSpentMin: number;
  flags: number;
};

export type TeacherAllotment = {
  teacherId: string;
  teacherName: string;
  allotted: { classNumber: number; section: "A" | "B" }[];
};

export type ActiveLabSession = {
  classNumber: number;
  section: "A" | "B";
  teacherId: string;
  teacherName: string;
  startedAt: string;
  date: string;
};

export type CrmState = {
  tasks: DailyTask[];
  reports: DailyReport[];
  sessions: LabSessionRecord[];
  allotments: TeacherAllotment[];
  activeLabSessions: ActiveLabSession[];
};

export type CrmAction =
  | { type: "hydrate"; state: CrmState }
  | { type: "setDraftPack"; tasks: DailyTask[] }
  | { type: "addDraftTask"; task: DailyTask }
  | { type: "updateDraftTask"; taskId: string; patch: Partial<DailyTask> }
  | { type: "removeDraftTask"; taskId: string }
  | { type: "publishPack"; date: string; classNumber: number; section: "A" | "B" | "ALL" }
  | { type: "completeTask"; taskId: string; studentId: string; minutes?: number }
  | { type: "upsertReport"; report: DailyReport }
  | { type: "addRemark"; studentId: string; date: string; remark: string }
  | { type: "addSession"; session: LabSessionRecord }
  | { type: "setAllotments"; allotments: TeacherAllotment[] }
  | { type: "startLabSession"; session: ActiveLabSession }
  | { type: "endLabSession"; classNumber: number; section: "A" | "B" };
