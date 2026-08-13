import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clock, Volume2, X } from "lucide-react";
import { getActiveVoiceLabel, playSoundEffect, speakText, stopSpeech } from "../../../lib/speech";
import { getReadingPassage } from "../../../data/readingPassages";

type Props = { profile: string; classNumber: number; onComplete?: (score: number) => void };

export function ReadingLab({ classNumber, onComplete }: Props) {
  const content = useMemo(() => getReadingPassage(classNumber), [classNumber]);
  const words = useMemo(() => content.text.split(" "), [content.text]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [voiceLabel, setVoiceLabel] = useState(getActiveVoiceLabel());
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setChoices([]);
    setSubmitted(false);
    setTimerOn(false);
    setSeconds(0);
    setSelectedWord(null);
  }, [content.id]);

  useEffect(() => {
    const sync = () => setVoiceLabel(getActiveVoiceLabel());
    sync();
    window.speechSynthesis?.addEventListener("voiceschanged", sync);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", sync);
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerOn]);

  const wordCount = words.length;
  const wpm = seconds > 0 ? Math.round((wordCount / seconds) * 60) : null;
  const quizCorrect = content.mcqs.filter((item, index) => choices[index] === item.answer).length;
  const quizPct = content.mcqs.length ? Math.round((quizCorrect / content.mcqs.length) * 100) : 0;
  const speedScore = wpm ? Math.min(100, Math.round((wpm / 140) * 100)) : 70;
  const combined = Math.round(speedScore * 0.4 + quizPct * 0.6);

  const cleanWord = (raw: string) => raw.replace(/[^a-zA-Z]/g, "").toLowerCase();

  const handleWordClick = (raw: string) => {
    const word = cleanWord(raw);
    if (!word) return;
    setSelectedWord(word);
    playSoundEffect("click");
    speakText(word, { rate: 0.88, onVoice: setVoiceLabel });
  };

  const readAloud = () => {
    playSoundEffect("click");
    speakText(content.text, { rate: 0.92, onVoice: setVoiceLabel });
  };

  const finish = () => {
    setTimerOn(false);
    setSubmitted(true);
    playSoundEffect("chime");
    onComplete?.(Math.max(50, combined));
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-orange-50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-emerald-700">
              Reading & WPM Lab · Class {classNumber} · {content.cefr}
            </span>
            <h2 className="mt-1 text-xl font-black text-slate-900 md:text-2xl">{content.title}</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">Clear AI voice · {voiceLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={readAloud}
              className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-black text-orange-700"
            >
              <Volume2 className="h-4 w-4" /> Read Passage Aloud
            </button>
            <button
              onClick={() => {
                if (!timerOn) setSeconds(0);
                setTimerOn((v) => !v);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white"
            >
              <Clock className="h-4 w-4" /> {timerOn ? "Stop Timer" : "Start Reading Timer"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">Live Reading Timer</div>
          <div className="mt-1 text-2xl font-extrabold">
            {mm}:{ss}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">Words Per Minute</div>
          <div className="mt-1 text-2xl font-extrabold text-orange-600">{wpm ?? "Calculating..."}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase text-slate-500">CEFR Speed Benchmark</div>
          <div className="mt-1 text-lg font-extrabold text-emerald-700">{content.wpmTarget}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
        <BookOpen className="h-5 w-5" /> Click any word for pronunciation and dictionary
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-base font-medium leading-relaxed text-slate-800">
        {words.map((word, idx) => (
          <span
            key={`${word}-${idx}`}
            onClick={() => handleWordClick(word)}
            className="inline-block cursor-pointer rounded px-1 transition hover:bg-orange-100 hover:text-orange-900"
          >
            {word}{" "}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-black text-slate-900">Comprehension ({content.mcqs.length} questions)</h3>
        <p className="mt-1 text-sm text-slate-500">Answer after reading. Score uses 40% WPM + 60% quiz.</p>
        <div className="mt-4 space-y-4">
          {content.mcqs.map((item, index) => (
            <div key={item.q}>
              <p className="text-sm font-bold text-slate-700">
                Q{index + 1}. {item.q}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {item.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setChoices((prev) => {
                        const next = [...prev];
                        next[index] = opt;
                        return next;
                      })
                    }
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-bold ${
                      choices[index] === opt ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={finish} className="mt-5 w-full rounded-xl bg-orange-500 py-3 text-sm font-black text-white">
          Finish & Save Score
        </button>
        {submitted && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Combined score {combined}% · Quiz {quizPct}% · Speed {speedScore}%
            </p>
            {content.mcqs.map((item, index) => (
              <p key={item.q} className="mt-1">
                Q{index + 1}: {choices[index] === item.answer ? "Correct" : `Answer: ${item.answer}`}
              </p>
            ))}
          </div>
        )}
      </div>

      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => {
                stopSpeech();
                setSelectedWord(null);
              }}
              className="absolute top-3 right-3 rounded-full bg-slate-100 p-1 text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
            <h4 className="text-xl font-extrabold capitalize text-slate-900">{selectedWord}</h4>
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              Definition: {content.dictionary[selectedWord] ?? "Classroom vocabulary used in this CEFR reading passage."}
            </p>
            <button
              onClick={() => speakText(selectedWord, { rate: 0.85, onVoice: setVoiceLabel })}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
            >
              <Volume2 className="h-4 w-4" /> Speak Word Voice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
