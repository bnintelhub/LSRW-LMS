import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, School } from "lucide-react";
import { useCrm } from "../../context/CrmContext";
import { useAppStore } from "../../context/AppStoreContext";
import { todayISO } from "../../lib/aiTaskGenerator";
import { dateInTerm } from "./AcademicYear";
import { allotmentsFromTeachers } from "../../lib/persist";

type StudentLite = {
  id: string;
  name: string;
  classNumber: number;
  section: "A" | "B";
  scores: { Listening: number; Speaking: number; Reading: number; Writing: number };
};

type Props = { students: StudentLite[] };

function avgScores(s: StudentLite["scores"]) {
  return Math.round((s.Listening + s.Speaking + s.Reading + s.Writing) / 4);
}

export function SchoolCrmReports({ students }: Props) {
  const { state, dispatch } = useCrm();
  const { completions, school, teachers, upsertTeacher } = useAppStore();
  const date = todayISO();
  const [exportClass, setExportClass] = useState(6);

  const heatmap = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const classNumber = i + 1;
      const classStudents = students.filter((s) => s.classNumber === classNumber);
      const published = state.tasks.filter(
        (t) => t.date === date && t.classNumber === classNumber && t.status === "published",
      );
      if (!classStudents.length) {
        return { className: `C${classNumber}`, completion: 0, tasks: published.length };
      }
      if (published.length) {
        const done = published.reduce(
          (sum, t) =>
            sum + t.completedBy.filter((id) => classStudents.some((s) => s.id === id)).length,
          0,
        );
        return {
          className: `C${classNumber}`,
          completion: Math.round((done / (published.length * classStudents.length)) * 100),
          tasks: published.length,
        };
      }
      const practiced = new Set(
        completions.filter((c) => c.date === date && classStudents.some((s) => s.id === c.studentId)).map((c) => c.studentId),
      ).size;
      return {
        className: `C${classNumber}`,
        completion: Math.round((practiced / classStudents.length) * 100),
        tasks: 0,
      };
    });
  }, [students, state.tasks, date, completions]);

  const sessions = state.sessions.filter((s) => dateInTerm(s.date, school.term));

  const exportDaily = () => {
    const classStudents = students.filter((s) => s.classNumber === exportClass);
    const published = state.tasks.filter(
      (t) => t.date === date && t.classNumber === exportClass && t.status === "published",
    );
    const rows = classStudents.map((s) => {
      const done = published.filter((t) => t.completedBy.includes(s.id)).length;
      const report = state.reports.find((r) => r.studentId === s.id && r.date === date);
      return {
        Name: s.name,
        Class: s.classNumber,
        Section: s.section,
        "Tasks Done": `${done}/${published.length}`,
        "Avg Score": avgScores(s.scores),
        Attendance: report?.attendance ?? (done ? "present" : "partial"),
        "Time (min)": report?.timeSpentMin ?? done * 10,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily");
    XLSX.writeFile(workbook, `Class-${exportClass}-Daily-${date}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wider text-orange-600">{school.name} · {school.academicYear} · Term {school.term}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">School Daily Oversight</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Class completion heatmap from published tasks (or lab practice if no pack), teacher allotments, and session history for the selected term.
        </p>
      </div>

      <div className="panel-card">
        <h2 className="mb-4 text-lg font-black">Today's Class Completion Heatmap · {date}</h2>
        <div className="h-80 rounded-xl bg-[#faf8f5] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmap}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" />
              <XAxis dataKey="className" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completion" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="panel-card">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
            <School className="h-5 w-5 text-orange-600" /> Teacher Allotments
          </h2>
          <div className="space-y-3">
            {state.allotments.map((a) => (
              <div key={a.teacherId} className="nested-card">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500 text-sm font-black text-white">
                    {a.teacherName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-900">{a.teacherName}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.allotted.map((x) => (
                        <span key={`${a.teacherId}-chip-${x.classNumber}-${x.section}`} className="stat-chip">
                          Class {x.classNumber}-{x.section}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Reassign classes</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {a.allotted.map((x) => (
                    <select
                      key={`${a.teacherId}-${x.classNumber}-${x.section}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                      value={`${x.classNumber}-${x.section}`}
                      onChange={(e) => {
                        const [c, s] = e.target.value.split("-");
                        const teacher = teachers.find((item) => item.id === a.teacherId);
                        if (teacher) {
                          const nextTeacher = {
                            ...teacher,
                            allotted: teacher.allotted.map((slot) =>
                              slot.classNumber === x.classNumber && slot.section === x.section
                                ? { classNumber: Number(c), section: s as "A" | "B" }
                                : slot,
                            ),
                          };
                          upsertTeacher(nextTeacher);
                          dispatch({
                            type: "setAllotments",
                            allotments: allotmentsFromTeachers(
                              teachers.map((item) => (item.id === nextTeacher.id ? nextTeacher : item)),
                            ),
                          });
                        }
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).flatMap((cls) =>
                        (["A", "B"] as const).map((sec) => (
                          <option key={`${cls}-${sec}`} value={`${cls}-${sec}`}>
                            Class {cls}-{sec}
                          </option>
                        )),
                      )}
                    </select>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <h2 className="mb-4 text-lg font-black">Lab Session History</h2>
          {!sessions.length ? (
            <div className="empty-state">No lab sessions in Term {school.term} yet. End a live session from the Teacher panel.</div>
          ) : (
            <div className="max-h-96 space-y-2.5 overflow-auto pr-1">
              {sessions.map((s) => (
                <div key={s.id} className="nested-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-slate-900">
                      Class {s.classNumber}-{s.section}
                    </p>
                    <span className="text-xs font-bold text-slate-500">{s.date}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{s.teacherName}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="stat-chip">{s.completionPct}% complete</span>
                    <span className="stat-chip">avg {s.averageScore}%</span>
                    <span className="stat-chip">{s.timeSpentMin} min</span>
                    <span className="stat-chip">{s.flags} flags</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel-card">
        <h2 className="text-lg font-black">Export Class Daily Summary</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={exportClass}
            onChange={(e) => setExportClass(Number(e.target.value))}
            className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Class {i + 1}
              </option>
            ))}
          </select>
          <button
            onClick={exportDaily}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white"
          >
            <Download className="h-4 w-4" /> Export .xlsx
          </button>
        </div>
      </div>
    </div>
  );
}
