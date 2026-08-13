import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { PHONICS_BLENDS, PHONICS_LETTERS } from "../../../data/phonicsContent";
import { playSoundEffect, speakText, stopSpeech } from "../../../lib/speech";

type Props = {
  classNumber: number;
  onComplete: (score: number) => void;
};

export function PhonicsModule({ classNumber, onComplete }: Props) {
  const [tab, setTab] = useState<"sounds" | "blend" | "quiz">("sounds");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [done, setDone] = useState(false);
  const quiz = useMemo(() => PHONICS_LETTERS.slice(0, classNumber === 1 ? 6 : 8), [classNumber]);
  const current = quiz[quizIndex];
  const options = useMemo(() => {
    if (!current) return [];
    const others = PHONICS_LETTERS.filter((item) => item.letter !== current.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [current, ...others].sort(() => Math.random() - 0.5);
  }, [current]);

  const hear = (text: string, rate = 0.8) => {
    stopSpeech();
    speakText(text, { rate });
  };

  const answer = (letter: string) => {
    if (!current || done) return;
    const correct = letter === current.letter;
    if (correct) {
      playSoundEffect("success");
      setQuizScore((n) => n + 1);
    } else {
      playSoundEffect("click");
    }
    if (quizIndex + 1 >= quiz.length) {
      const total = quizScore + (correct ? 1 : 0);
      const score = Math.round((total / quiz.length) * 100);
      setDone(true);
      onComplete(score);
      return;
    }
    setQuizIndex((i) => i + 1);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border-4 border-orange-200 bg-white p-5 shadow-sm md:p-6">
        <div className="rounded-3xl bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-orange-950/70">Phonics · Class {classNumber}</p>
          <h2 className="mt-1 text-2xl font-black">Letter sounds and blending</h2>
          <p className="mt-1 text-sm font-semibold text-orange-950/80">Tap a letter to hear the sound. Then try the quiz.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["sounds", "blend", "quiz"] as const).map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-black capitalize ${
                tab === item ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700"
              }`}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {tab === "sounds" && (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
          {PHONICS_LETTERS.map((item) => (
            <button
              key={item.letter}
              className="panel-card text-left"
              onClick={() => hear(`${item.letter}. ${item.sound}. ${item.example}.`)}
            >
              <p className="text-3xl">{item.emoji}</p>
              <p className="mt-2 text-3xl font-black">{item.letter}</p>
              <p className="text-sm font-semibold text-slate-600">{item.example}</p>
            </button>
          ))}
        </div>
      )}

      {tab === "blend" && (
        <div className="grid gap-4 md:grid-cols-2">
          {PHONICS_BLENDS.map((blend) => (
            <div key={blend.word} className="panel-card">
              <p className="text-3xl">{blend.emoji}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {blend.parts.map((part) => (
                  <button
                    key={`${blend.word}-${part}`}
                    className="rounded-2xl bg-orange-100 px-4 py-3 text-2xl font-black text-orange-700"
                    onClick={() => hear(part, 0.7)}
                  >
                    {part}
                  </button>
                ))}
              </div>
              <button
                className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-black text-white"
                onClick={() => hear(blend.parts.join(" ") + ". " + blend.word)}
              >
                <Volume2 size={16} /> Blend {blend.word}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "quiz" && (
        <div className="panel-card">
          {done ? (
            <p className="text-lg font-black text-emerald-700">
              Great work! You scored {Math.round((quizScore / quiz.length) * 100)}%.
            </p>
          ) : (
            <>
              <p className="text-sm font-black uppercase text-orange-600">
                Sound {quizIndex + 1} of {quiz.length}
              </p>
              <button
                className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-black text-white"
                onClick={() => current && hear(current.sound)}
              >
                <Volume2 size={18} /> Hear the sound
              </button>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {options.map((item) => (
                  <button
                    key={item.letter}
                    className="rounded-2xl border border-slate-200 px-4 py-6 text-3xl font-black hover:bg-orange-50"
                    onClick={() => answer(item.letter)}
                  >
                    {item.letter}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
