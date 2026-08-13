import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { spellingListFor } from "../../../data/spellingBee";
import { playSoundEffect, speakText, stopSpeech } from "../../../lib/speech";

type Props = {
  classNumber: number;
  onComplete: (score: number) => void;
};

export function SpellingBee({ classNumber, onComplete }: Props) {
  const words = useMemo(() => spellingListFor(classNumber), [classNumber]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const word = words[index];

  const hear = () => {
    if (!word) return;
    stopSpeech();
    speakText(word, { rate: 0.85 });
  };

  const check = () => {
    if (!word || done) return;
    const ok = typed.trim().toLowerCase() === word.toLowerCase();
    const nextScore = score + (ok ? 1 : 0);
    setFeedback(ok ? "Correct!" : `It was “${word}”.`);
    playSoundEffect(ok ? "success" : "click");
    setScore(nextScore);
    window.setTimeout(() => {
      setTyped("");
      setFeedback("");
      if (index + 1 >= words.length) {
        setDone(true);
        onComplete(Math.round((nextScore / words.length) * 100));
        return;
      }
      setIndex((n) => n + 1);
    }, 900);
  };

  return (
    <div className="space-y-5">
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wide text-orange-600">Weekly spelling bee · Class {classNumber}</p>
        <h1 className="mt-1 text-3xl font-black">Hear the word. Type the spelling.</h1>
        <p className="mt-2 text-sm text-slate-600">This week's list rotates automatically. No looking at the answer first.</p>
      </div>

      <div className="panel-card">
        {done ? (
          <p className="text-lg font-black text-emerald-700">
            Bee complete — {score}/{words.length} ({Math.round((score / words.length) * 100)}%).
          </p>
        ) : (
          <>
            <p className="text-sm font-black uppercase text-slate-400">
              Word {index + 1} of {words.length}
            </p>
            <button
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-black text-white"
              onClick={hear}
            >
              <Volume2 size={18} /> Hear word
            </button>
            <input
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-black tracking-wide"
              placeholder="Type the spelling"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && check()}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <button className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 font-black text-white" onClick={check}>
              Check
            </button>
            {feedback && (
              <p className={`mt-3 font-black ${feedback.startsWith("Correct") ? "text-emerald-700" : "text-rose-600"}`}>
                {feedback}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
