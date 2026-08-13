import { BADGE_DEFS } from "../data/badges";

export function BadgeGrid({ earned }: { earned: string[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shadow-md">
        <p className="text-xs font-black uppercase tracking-wide text-orange-50">Achievements</p>
        <h1 className="mt-2 text-3xl font-black">My Badges</h1>
        <p className="mt-2 text-orange-50">
          {earned.length}/{BADGE_DEFS.length} unlocked. Practice labs to earn more.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {BADGE_DEFS.map((badge) => {
          const unlocked = earned.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`rounded-[1.5rem] border p-5 ${
                unlocked ? "border-orange-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              <div className="text-4xl">{badge.icon}</div>
              <h3 className="mt-3 font-black text-slate-900">{badge.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
              <p className="mt-3 text-xs font-black uppercase text-orange-600">
                {unlocked ? "Unlocked" : "Locked"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
