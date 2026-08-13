import { School } from "lucide-react";
import { useAppStore } from "../../context/AppStoreContext";
import { useCrm } from "../../context/CrmContext";
import { decodeParentToken } from "../../lib/parentLink";
import { todayISO } from "../../lib/aiTaskGenerator";
import type { Skill } from "../../types/crm";

const SKILLS: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];

type Props = {
  studentId: string;
  token: string;
};

export function ParentReport({ studentId, token }: Props) {
  const { students, attendance, school } = useAppStore();
  const { reportFor } = useCrm();
  const parsed = decodeParentToken(token);
  const student = students.find((item) => item.id === studentId);
  const valid = parsed?.studentId === studentId && Boolean(student);

  if (!valid || !student) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="panel-card text-center">
          <h1 className="text-2xl font-black">Link expired or invalid</h1>
          <p className="mt-2 text-sm text-slate-600">Ask the school for a fresh parent report link. This demo token is not a signed login.</p>
          <a className="mt-5 inline-block rounded-xl bg-orange-500 px-4 py-2.5 font-black text-white" href="/">
            Back to lab
          </a>
        </div>
      </main>
    );
  }

  const date = todayISO();
  const report = reportFor(student.id, date);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
  const present = attendance.filter(
    (row) => row.studentId === student.id && week.includes(row.date) && row.status === "present",
  ).length;
  const avg = Math.round(
    (student.scores.Listening + student.scores.Speaking + student.scores.Reading + student.scores.Writing) / 4,
  );
  const remarks = report?.teacherRemarks ?? [];

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-6 py-10">
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wide text-orange-600">Parent view · read only</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black">
          <School size={26} /> {school.name}
        </h1>
        <p className="mt-2 text-lg font-black">{student.name}</p>
        <p className="text-sm text-slate-500">
          Class {student.classNumber}-{student.section} · Roll {student.roll} · {school.academicYear}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="metric-label">Average</p>
          <p className="metric-value">{avg}%</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">XP / Streak</p>
          <p className="metric-value">
            {student.xp} / {student.streak}d
          </p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Present (7 days)</p>
          <p className="metric-value">{present}</p>
        </div>
      </div>
      <div className="panel-card">
        <h2 className="text-xl font-black">LSRW scores</h2>
        <div className="mt-4 space-y-3">
          {SKILLS.map((skill) => (
            <div key={skill}>
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>{skill}</span>
                <span>{student.scores[skill]}%</span>
              </div>
              <div className="h-2 rounded-full bg-orange-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${student.scores[skill]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-card">
        <h2 className="text-xl font-black">Teacher remarks</h2>
        {!remarks.length ? (
          <p className="mt-3 text-sm text-slate-500">No remarks for today yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {remarks.map((item, index) => (
              <li key={index} className="rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
