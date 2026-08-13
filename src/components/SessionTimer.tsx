import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function SessionTimer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsedMs = Math.max(0, now - new Date(startedAt).getTime());
  const totalSec = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-black text-white">
      <Clock size={14} /> {mm}:{ss}
    </span>
  );
}

export function elapsedMinutes(startedAt: string, endedAt = Date.now()) {
  return Math.max(1, Math.round((endedAt - new Date(startedAt).getTime()) / 60_000));
}
