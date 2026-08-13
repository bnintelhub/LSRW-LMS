import { ClipboardList } from "lucide-react";

export function HomeworkBanner({
  remaining,
  onOpenTasks,
}: {
  remaining: number;
  onOpenTasks: () => void;
}) {
  if (remaining <= 0) return null;
  return (
    <button
      onClick={onOpenTasks}
      className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-left"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-400 text-white">
          <ClipboardList size={20} />
        </div>
        <div>
          <p className="font-black text-amber-900">Aaj ka task incomplete hai</p>
          <p className="text-sm font-semibold text-amber-800">
            {remaining} published task{remaining > 1 ? "s" : ""} still waiting. Open Today's Tasks.
          </p>
        </div>
      </div>
      <span className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white">Open</span>
    </button>
  );
}
