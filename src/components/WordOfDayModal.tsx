import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Volume2, X } from "lucide-react";
import type { WordEntry } from "../data/wordOfTheDay";

type Props = {
  open: boolean;
  word: WordEntry;
  date: string;
  onClose: () => void;
};

export function WordOfDayModal({ open, word, date, onClose }: Props) {
  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-IN";
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-orange-200 bg-white shadow-2xl shadow-orange-200/40"
          >
            <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 px-6 py-5 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-100">
                      Word of the Day
                    </p>
                    <p className="text-sm font-semibold text-white/90">{date}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-white/20 p-2 transition hover:bg-white/30"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-4xl font-black text-slate-900">{word.word}</h2>
                <button
                  onClick={speak}
                  className="flex items-center gap-2 rounded-2xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-200"
                >
                  <Volume2 size={16} />
                  Listen
                </button>
              </div>
              <p className="mt-1 text-lg font-semibold text-orange-600">{word.pronunciation}</p>
              <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                {word.partOfSpeech}
              </span>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                    Meaning
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-800">{word.meaning}</p>
                  {word.hindi && (
                    <p className="mt-1 text-sm text-slate-500">Hindi: {word.hindi}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Example Sentence
                  </p>
                  <p className="mt-1 text-base italic text-slate-700">"{word.example}"</p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                You can revisit today's word anytime in the LSRW Assistant chatbot.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(
                      new CustomEvent("lsrw-open-chatbot", { detail: { prompt: "Word of the day" } }),
                    );
                  }}
                  className="rounded-2xl border border-orange-200 bg-white py-3 font-black text-orange-600"
                >
                  Add to Chatbot
                </button>
                <button
                  onClick={onClose}
                  className="rounded-2xl bg-orange-500 py-3 font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                >
                  Got it! Let's Learn
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
