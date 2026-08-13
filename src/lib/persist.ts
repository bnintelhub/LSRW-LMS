import type { CrmState, TeacherAllotment } from "../types/crm";
import type { Announcement, AppStoreState, SchoolProfile } from "../types/progress";
import type { Teacher } from "../types/student";
import { defaultTeachers, generateStudents } from "../data/seed";
import { loadLiveActivities } from "./liveActivity";

const STORAGE_KEY = "lsrw-gov-lab-crm-v1";
const APP_KEY = "lsrw-app-state-v1";
const SUBMISSIONS_KEY = "lsrw-submissions-v1";
const ATTENDANCE_KEY = "lsrw-attendance-v1";
const SCHOOL_KEY = "lsrw-school-profile-v1";
const ANNOUNCEMENTS_KEY = "lsrw-announcements-v1";
const HINTS_KEY = "lsrw-hindi-hints";

export const defaultAllotments: TeacherAllotment[] = [
  {
    teacherId: "t-foundation",
    teacherName: "Meera Kapoor",
    allotted: [
      { classNumber: 1, section: "A" },
      { classNumber: 2, section: "A" },
      { classNumber: 3, section: "A" },
    ],
  },
  {
    teacherId: "t-elementary",
    teacherName: "Rahul Menon",
    allotted: [
      { classNumber: 4, section: "A" },
      { classNumber: 5, section: "A" },
      { classNumber: 6, section: "A" },
      { classNumber: 7, section: "A" },
    ],
  },
  {
    teacherId: "t-exam",
    teacherName: "Nandita Rao",
    allotted: [
      { classNumber: 8, section: "A" },
      { classNumber: 9, section: "A" },
      { classNumber: 10, section: "A" },
    ],
  },
  {
    teacherId: "t-advanced",
    teacherName: "Arvind Iyer",
    allotted: [
      { classNumber: 11, section: "A" },
      { classNumber: 12, section: "A" },
    ],
  },
  {
    teacherId: "t-lab-a",
    teacherName: "Fatima Sheikh",
    allotted: [
      { classNumber: 2, section: "B" },
      { classNumber: 6, section: "B" },
      { classNumber: 9, section: "B" },
    ],
  },
  {
    teacherId: "t-lab-b",
    teacherName: "Joseph Dsouza",
    allotted: [
      { classNumber: 10, section: "B" },
      { classNumber: 11, section: "B" },
      { classNumber: 12, section: "B" },
    ],
  },
];

export function allotmentsFromTeachers(teachers: Teacher[]): TeacherAllotment[] {
  return teachers
    .filter((teacher) => teacher.active !== false)
    .map((teacher) => ({
      teacherId: teacher.id,
      teacherName: teacher.name,
      allotted: teacher.allotted,
    }));
}

function normalizeTeacher(raw: Teacher): Teacher {
  return {
    ...raw,
    active: raw.active !== false,
    allotted: raw.allotted ?? [],
  };
}

export function emptyCrmState(): CrmState {
  return {
    tasks: [],
    reports: [],
    sessions: [],
    allotments: defaultAllotments,
    activeLabSessions: [],
  };
}

export function loadCrmState(): CrmState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCrmState();
    const parsed = JSON.parse(raw) as CrmState;
    return {
      tasks: parsed.tasks ?? [],
      reports: parsed.reports ?? [],
      sessions: parsed.sessions ?? [],
      allotments: parsed.allotments?.length ? parsed.allotments : defaultAllotments,
      activeLabSessions: parsed.activeLabSessions ?? [],
    };
  } catch {
    return emptyCrmState();
  }
}

export function saveCrmState(state: CrmState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

const defaultSchool: SchoolProfile = {
  name: "LSRW Language Lab",
  address: "Demo Campus",
  academicYear: "2025-26",
  term: "1",
};

function normalizeStudent(raw: AppStoreState["students"][number]) {
  return {
    ...raw,
    badges: raw.badges ?? [],
    lastActiveDate: raw.lastActiveDate ?? "",
  };
}

export function emptyAppStoreState(): AppStoreState {
  return {
    students: generateStudents(),
    teachers: defaultTeachers,
    submissions: [],
    attendance: [],
    liveActivities: [],
    completions: [],
    school: defaultSchool,
    announcements: [],
    showHindiHints: false,
  };
}

export function loadAppStoreState(): AppStoreState {
  const empty = emptyAppStoreState();
  try {
    const raw = localStorage.getItem(APP_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AppStoreState>) : {};
    const submissionsRaw = localStorage.getItem(SUBMISSIONS_KEY);
    const attendanceRaw = localStorage.getItem(ATTENDANCE_KEY);
    const schoolRaw = localStorage.getItem(SCHOOL_KEY);
    const announcementsRaw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    const hints = localStorage.getItem(HINTS_KEY);
    return {
      students: (parsed.students?.length ? parsed.students : empty.students).map(normalizeStudent),
      teachers: (parsed.teachers?.length ? parsed.teachers : empty.teachers).map(normalizeTeacher),
      submissions: submissionsRaw ? JSON.parse(submissionsRaw) : parsed.submissions ?? [],
      attendance: attendanceRaw ? JSON.parse(attendanceRaw) : parsed.attendance ?? [],
      liveActivities: loadLiveActivities(),
      completions: parsed.completions ?? [],
      school: schoolRaw ? JSON.parse(schoolRaw) : parsed.school ?? defaultSchool,
      announcements: announcementsRaw ? (JSON.parse(announcementsRaw) as Announcement[]) : parsed.announcements ?? [],
      showHindiHints: hints === "1" || parsed.showHindiHints === true,
    };
  } catch {
    return empty;
  }
}

export function saveAppStoreState(state: AppStoreState) {
  try {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify({
        students: state.students,
        teachers: state.teachers,
        completions: state.completions,
        showHindiHints: state.showHindiHints,
      }),
    );
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(state.submissions));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(state.attendance));
    localStorage.setItem(SCHOOL_KEY, JSON.stringify(state.school));
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(state.announcements));
    localStorage.setItem(HINTS_KEY, state.showHindiHints ? "1" : "0");
  } catch {
    /* ignore quota */
  }
}
