import type { Student } from "../../types/student";
import type { DailyTask, Skill } from "../../types/crm";

const SKILLS: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];

function average(student: Student) {
  return Math.round((student.scores.Listening + student.scores.Speaking + student.scores.Reading + student.scores.Writing) / 4);
}

type Props = {
  classNumber: number;
  section: "A" | "B";
  students: Student[];
  published: DailyTask[];
};

export function ClassSnapshot({ classNumber, section, students, published }: Props) {
  const avg = students.length
    ? Math.round(students.reduce((sum, student) => sum + average(student), 0) / students.length)
    : 0;
  const skillAvgs = SKILLS.map((skill) => ({
    skill,
    avg: students.length
      ? Math.round(students.reduce((sum, student) => sum + student.scores[skill], 0) / students.length)
      : 0,
  }));
  const weak = skillAvgs.reduce((min, item) => (item.avg < min.avg ? item : min), skillAvgs[0] ?? { skill: "Listening" as Skill, avg: 0 });
  const completion =
    published.length && students.length
      ? Math.round(
          (published.reduce(
            (sum, task) => sum + task.completedBy.filter((id) => students.some((s) => s.id === id)).length,
            0,
          ) /
            (published.length * students.length)) *
            100,
        )
      : 0;

  return (
    <div className="panel-card">
      <p className="text-xs font-black uppercase tracking-wide text-orange-600">Class snapshot</p>
      <h2 className="mt-1 text-lg font-black">
        Class {classNumber}-{section}
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-orange-50 p-3">
          <p className="text-[11px] font-bold uppercase text-slate-500">Avg score</p>
          <p className="text-2xl font-black text-orange-600">{avg}%</p>
        </div>
        <div className="rounded-2xl bg-violet-50 p-3">
          <p className="text-[11px] font-bold uppercase text-slate-500">Weak skill</p>
          <p className="text-sm font-black text-violet-700">{weak.skill}</p>
          <p className="text-xs font-bold text-slate-500">{weak.avg}%</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3">
          <p className="text-[11px] font-bold uppercase text-slate-500">Tasks today</p>
          <p className="text-2xl font-black text-emerald-700">{completion}%</p>
        </div>
      </div>
    </div>
  );
}
