import { useMemo, useState } from "react";
import { useCrm } from "../../context/CrmContext";
import type { Scores, Skill } from "../../types/crm";

type Props = {
  studentId: string;
  classNumber: number;
  section: "A" | "B";
  name: string;
  scores: Scores;
};

export function StudentDailyReport({ studentId, classNumber, section, name, scores }: Props) {
  const { reportFor, publishedTasksFor } = useCrm();
  const dates = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      list.push(d.toISOString().slice(0, 10));
    }
    return list;
  }, []);

  const [selected, setSelected] = useState(dates[0]);
  const report = reportFor(studentId, selected);
  const tasks = publishedTasksFor({ date: selected, classNumber, section });
  const done = tasks.filter((t) => t.completedBy.includes(studentId)).length;
  const skills = report?.skills ?? scores;
  const remarks = report?.teacherRemarks ?? [];
  const avg = Math.round(
    (skills.Listening + skills.Speaking + skills.Reading + skills.Writing) / 4,
  );

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase text-orange-600">Student Daily Report</p>
        <h1 className="mt-2 text-3xl font-black">{name}</h1>
        <p className="mt-1 text-slate-500">
          Class {classNumber}-{section} · Government School Language Lab
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={`rounded-xl px-3 py-2 text-xs font-black ${
                selected === d ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Avg Score" value={`${avg}%`} />
        <MetricCard
          label="Tasks Done"
          value={`${report?.tasksCompleted ?? done}/${report?.tasksTotal || tasks.length || 0}`}
        />
        <MetricCard label="Time Spent" value={`${report?.timeSpentMin ?? done * 10} min`} />
        <MetricCard label="Attendance" value={report?.attendance ?? (done ? "present" : "partial")} />
      </div>

      <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">LSRW Skill Snapshot</h2>
        <div className="mt-4 space-y-3">
          {(Object.keys(skills) as Skill[]).map((skill) => (
            <div key={skill}>
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>{skill}</span>
                <span>{skills[skill]}%</span>
              </div>
              <div className="h-2 rounded-full bg-orange-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${skills[skill]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Teacher Feedback</h2>
        {!remarks.length ? (
          <p className="mt-3 text-sm text-slate-500">No remarks for this date yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {remarks.map((r, i) => (
              <li key={i} className="rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-slate-700">
                {r}
              </li>
            ))}
          </ul>
        )}
        {report?.sessionSummary && (
          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{report.sessionSummary}</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black capitalize text-orange-600">{value}</p>
    </div>
  );
}
