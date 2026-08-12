import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { CrmAction, CrmState, DailyReport, DailyTask, Scores } from "../types/crm";
import { loadCrmState, saveCrmState } from "../lib/persist";

function crmReducer(state: CrmState, action: CrmAction): CrmState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "setDraftPack": {
      const incoming = action.tasks;
      if (!incoming.length) return state;
      const { date, classNumber, section } = incoming[0];
      const kept = state.tasks.filter(
        (t) =>
          !(
            t.date === date &&
            t.classNumber === classNumber &&
            t.section === section &&
            t.status === "draft"
          ),
      );
      return { ...state, tasks: [...kept, ...incoming] };
    }
    case "updateDraftTask":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId && t.status === "draft" ? { ...t, ...action.patch, id: t.id } : t,
        ),
      };
    case "removeDraftTask":
      return {
        ...state,
        tasks: state.tasks.filter((t) => !(t.id === action.taskId && t.status === "draft")),
      };
    case "publishPack": {
      const { date, classNumber, section } = action;
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.date !== date || t.classNumber !== classNumber) return t;
          if (t.section !== section && !(section === "ALL" || t.section === "ALL")) return t;
          if (t.status === "draft") return { ...t, status: "published" as const };
          return t;
        }),
      };
    }
    case "completeTask": {
      const tasks = state.tasks.map((t) => {
        if (t.id !== action.taskId) return t;
        if (t.completedBy.includes(action.studentId)) return t;
        return { ...t, completedBy: [...t.completedBy, action.studentId] };
      });
      return { ...state, tasks };
    }
    case "upsertReport": {
      const idx = state.reports.findIndex(
        (r) => r.studentId === action.report.studentId && r.date === action.report.date,
      );
      const reports = [...state.reports];
      if (idx >= 0) reports[idx] = action.report;
      else reports.push(action.report);
      return { ...state, reports };
    }
    case "addRemark": {
      const idx = state.reports.findIndex(
        (r) => r.studentId === action.studentId && r.date === action.date,
      );
      if (idx >= 0) {
        const reports = [...state.reports];
        reports[idx] = {
          ...reports[idx],
          teacherRemarks: [...reports[idx].teacherRemarks, action.remark],
        };
        return { ...state, reports };
      }
      const blankSkills = {
        Listening: 0,
        Speaking: 0,
        Reading: 0,
        Writing: 0,
      } as Scores;
      const report: DailyReport = {
        studentId: action.studentId,
        date: action.date,
        skills: blankSkills,
        tasksCompleted: 0,
        tasksTotal: 0,
        timeSpentMin: 0,
        attendance: "partial",
        teacherRemarks: [action.remark],
      };
      return { ...state, reports: [...state.reports, report] };
    }
    case "addSession":
      return { ...state, sessions: [action.session, ...state.sessions].slice(0, 50) };
    case "setAllotments":
      return { ...state, allotments: action.allotments };
    default:
      return state;
  }
}

type CrmContextValue = {
  state: CrmState;
  dispatch: (action: CrmAction) => void;
  publishedTasksFor: (opts: {
    date: string;
    classNumber: number;
    section: "A" | "B";
  }) => DailyTask[];
  draftsFor: (opts: {
    date: string;
    classNumber: number;
    section: "A" | "B" | "ALL";
  }) => DailyTask[];
  reportFor: (studentId: string, date: string) => DailyReport | undefined;
};

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(crmReducer, undefined, () => loadCrmState());

  useEffect(() => {
    saveCrmState(state);
  }, [state]);

  const value = useMemo<CrmContextValue>(
    () => ({
      state,
      dispatch,
      publishedTasksFor: ({ date, classNumber, section }) =>
        state.tasks.filter(
          (t) =>
            t.date === date &&
            t.classNumber === classNumber &&
            t.status === "published" &&
            (t.section === "ALL" || t.section === section),
        ),
      draftsFor: ({ date, classNumber, section }) =>
        state.tasks.filter(
          (t) =>
            t.date === date &&
            t.classNumber === classNumber &&
            t.status === "draft" &&
            t.section === section,
        ),
      reportFor: (studentId, date) =>
        state.reports.find((r) => r.studentId === studentId && r.date === date),
    }),
    [state],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used within CrmProvider");
  return ctx;
}
