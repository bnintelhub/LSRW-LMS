import { Trophy } from "lucide-react";
import { EmptyState } from "./EmptyState";
import type { Student } from "../types/student";

export function Leaderboard({
  students,
  currentId,
}: {
  students: Student[];
  currentId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shadow-md">
        <p className="text-xs font-black uppercase tracking-wide text-orange-50">Class ranking</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black">
          <Trophy size={28} /> Leaderboard
        </h1>
        <p className="mt-2 text-orange-50">Top students in your class by XP. Keep practicing to climb.</p>
      </div>
      <div className="content-card space-y-2">
        {!students.length ? (
          <EmptyState title="No classmates yet" text="Leaderboard fills when students in your class-section earn XP." />
        ) : (
        students.map((student, index) => {
          const mine = student.id === currentId;
          return (
            <div
              key={student.id}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                mine ? "bg-orange-50 ring-1 ring-orange-200" : "bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-black text-orange-600">
                  {index + 1}
                </span>
                <div>
                  <p className="font-black text-slate-900">
                    {student.name}
                    {mine ? " (You)" : ""}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    Roll {student.roll} · Avg {Math.round(Object.values(student.scores).reduce((a, b) => a + b, 0) / 4)}%
                  </p>
                </div>
              </div>
              <p className="text-lg font-black text-orange-600">{student.xp} XP</p>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
