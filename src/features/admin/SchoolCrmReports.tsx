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
import { todayISO } from "../../lib/aiTaskGenerator";

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
  const date = todayISO();
  const [exportClass, setExportClass] = useState(6);

  const heatmap = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const classNumber = i + 1;
      const classStudents = students.filter((s) => s.classNumber === classNumber);
      const published = state.tasks.filter(
        (t) => t.date === date && t.classNumber === classNumber && t.status === "published",
      );
      if (!classStudents.length || !published.length) {
        return { className: `C${classNumber}`, completion: 0, tasks: published.length };
      }
      const done = published.reduce(
        (sum, t) =>
          sum + t.completedBy.filter((id) => classStudents.some((s) => s.id === id)).length,
        0,
      );
      const completion = Math.round((done / (published.length * classStudents.length)) * 100);
      return { className: `C${classNumber}`, completion, tasks: published.length };
    });
  }, [students, state.tasks, date]);

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
      <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase text-orange-600">School Lab CRM</p>
        <h1 className="mt-2 text-3xl font-black">Government School Daily Oversight</h1>
        <p className="mt-2 text-slate-600">
          Class completion heatmap, teacher allotments, lab session history, and Excel daily export.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-black">Today's Class Completion Heatmap · {date}</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="className" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="completion" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
            <School className="h-5 w-5 text-orange-600" /> Teacher Allotments
          </h2>
          <div className="space-y-3">
            {state.allotments.map((a) => (
              <div key={a.teacherId} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-black">{a.teacherName}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {a.allotted.map((x) => `Class ${x.classNumber}-${x.section}`).join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {a.allotted.map((x) => (
                    <select
                      key={`${a.teacherId}-${x.classNumber}-${x.section}`}
                      className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                      value={`${x.classNumber}-${x.section}`}
                      onChange={(e) => {
                        const [c, s] = e.target.value.split("-");
                        const next = state.allotments.map((item) => {
                          if (item.teacherId !== a.teacherId) return item;
                          return {
                            ...item,
                            allotted: item.allotted.map((slot) =>
                              slot.classNumber === x.classNumber && slot.section === x.section
                                ? { classNumber: Number(c), section: s as "A" | "B" }
                                : slot,
                            ),
                          };
                        });
                        dispatch({ type: "setAllotments", allotments: next });
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

        <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-black">Lab Session History</h2>
          {!state.sessions.length ? (
            <p className="text-sm text-slate-500">
              No sessions recorded yet. End a live lab session from the Teacher panel to populate this list.
            </p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-auto">
              {state.sessions.map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm">
                  <p className="font-black">
                    Class {s.classNumber}-{s.section} · {s.date}
                  </p>
                  <p className="text-slate-600">
                    {s.teacherName} · {s.completionPct}% complete · avg {s.averageScore}% · {s.timeSpentMin}{" "}
                    min · {s.flags} flags
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Export Class Daily Summary</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={exportClass}
            onChange={(e) => setExportClass(Number(e.target.value))}
            className="rounded-2xl border border-slate-200 px-4 py-3 font-bold"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Class {i + 1}
              </option>
            ))}
          </select>
          <button
            onClick={exportDaily}
            className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white"
          >
            <Download className="h-4 w-4" /> Export .xlsx
          </button>
        </div>
      </div>
    </div>
  );
}
