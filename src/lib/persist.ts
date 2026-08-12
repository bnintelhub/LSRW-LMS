import type { CrmState, TeacherAllotment } from "../types/crm";

const STORAGE_KEY = "lsrw-gov-lab-crm-v1";

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

export function emptyCrmState(): CrmState {
  return {
    tasks: [],
    reports: [],
    sessions: [],
    allotments: defaultAllotments,
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
