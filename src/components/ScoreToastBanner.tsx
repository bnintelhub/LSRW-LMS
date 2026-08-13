import { AnimatePresence, motion } from "framer-motion";
import { Award, X } from "lucide-react";
import { BADGE_DEFS } from "../data/badges";
import type { ScoreToast } from "../types/progress";

export function ScoreToastBanner({ toast, onClose }: { toast: ScoreToast; onClose: () => void }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-24 left-1/2 z-[70] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-orange-200 bg-white p-4 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                <Award size={18} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-orange-600">{toast.skill} complete</p>
                <p className="font-black text-slate-900">
                  Score {toast.score}% · +{toast.xpGained} XP
                </p>
                {toast.newBadges.length > 0 && (
                  <p className="mt-1 text-sm text-emerald-700">
                    Badge unlocked:{" "}
                    {toast.newBadges
                      .map((id) => BADGE_DEFS.find((b) => b.id === id)?.title ?? id)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg bg-slate-100 p-1 text-slate-500">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
