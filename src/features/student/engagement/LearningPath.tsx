import { weakestSkill } from "../../../lib/scoring";
import type { Skill } from "../../../types/crm";
import type { Student } from "../../../types/student";

type Props = {
  student: Student;
  onOpenSkill: (skill: Skill) => void;
};

export function LearningPath({ student, onOpenSkill }: Props) {
  const skill = weakestSkill(student.scores);
  const gap = student.scores[skill];
  if (gap >= 80) {
    return (
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Personal learning path</p>
        <h2 className="mt-1 text-xl font-black">You are steady across LSRW.</h2>
        <p className="mt-1 text-sm text-slate-600">Keep a short daily lab so the scores stay high.</p>
      </div>
    );
  }
  return (
    <div className="panel-card flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-orange-600">Personal learning path</p>
        <h2 className="mt-1 text-xl font-black">Practice more {skill}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {skill} is your weakest score at {gap}%. One focused lab today will lift it fastest.
        </p>
      </div>
      <button className="rounded-xl bg-orange-500 px-4 py-2.5 font-black text-white" onClick={() => onOpenSkill(skill)}>
        Open {skill} lab
      </button>
    </div>
  );
}
