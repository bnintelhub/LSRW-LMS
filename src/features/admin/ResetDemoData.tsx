import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { clearDemoStorage } from "../../lib/persist";
import { useToast } from "../../context/ToastContext";

export function ResetDemoData() {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    clearDemoStorage();
    toast("Demo data cleared. Reloading…");
    window.setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div className="panel-card space-y-3">
      <h2 className="text-xl font-black">Reset demo data</h2>
      <p className="text-sm text-slate-600">
        Clears localStorage (students, tasks, submissions, attendance, school profile) and reloads seed data.
      </p>
      {!confirming ? (
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 font-black text-rose-600"
          onClick={() => setConfirming(true)}
        >
          <RotateCcw size={16} /> Reset demo
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl bg-rose-600 px-4 py-2.5 font-black text-white" onClick={reset}>
            Yes, clear everything
          </button>
          <button className="rounded-xl border border-slate-200 px-4 py-2.5 font-black" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
