import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock, Volume2, X } from "lucide-react";
import { getActiveVoiceLabel, playSoundEffect, speakText, stopSpeech } from "../../../lib/speech";

const PASSAGES: Record<string, { title: string; text: string; cefr: string; wpmTarget: string }> = {
  Foundational: {
    title: "Sight Words & Picture Stories",
    text: "The sun is hot. The ball is red. The dog can run. I see a cat. Good morning teacher.",
    cefr: "Pre-A1",
    wpmTarget: "40–70 WPM",
  },
  Elementary: {
    title: "School Garden Paragraphs",
    text: "The school garden started with five small plants. Every student watered one plant and wrote a note about its growth. Soon the garden became a cheerful reading corner for the whole class.",
    cefr: "A2",
    wpmTarget: "90–120 WPM",
  },
  "Exam-Track": {
    title: "Unseen Passage Drill",
    text: "Technology helps students learn when it is used with discipline. Libraries still matter because they teach focus, research habits and careful reading. Board exams reward accuracy under timed conditions.",
    cefr: "B1+",
    wpmTarget: "120–150 WPM",
  },
  Advanced: {
    title: "Quantum Computing Passages & Instant Dictionary",
    text: "Quantum computing leverages superposition and entanglement to solve complex mathematical problems exponentially faster than classical supercomputers. Students must analyze evidence, detect tone, and build a precise response.",
    cefr: "B2",
    wpmTarget: "130–160 WPM",
  },
};

const DICT: Record<string, string> = {
  quantum: "Related to physics at atomic scale; here used for advanced computing.",
  superposition: "A quantum state where a system can exist in multiple states at once.",
  entanglement: "A link between quantum particles that affects each other instantly.",
  discipline: "Careful self-control and organised study habits.",
  libraries: "Places that store books and support focused research.",
  evidence: "Facts or information that support a claim.",
  transparency: "Openness about how a system works.",
  vocabulary: "The set of words a learner knows and uses.",
};

type Props = { profile: string; classNumber: number };

export function ReadingLab({ profile, classNumber }: Props) {
  const content = useMemo(() => PASSAGES[profile] ?? PASSAGES.Elementary, [profile]);
  const words = useMemo(() => content.text.split(" "), [content.text]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [voiceLabel, setVoiceLabel] = useState(getActiveVoiceLabel());
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const sync = () => setVoiceLabel(getActiveVoiceLabel());
    sync();
    window.speechSynthesis?.addEventListener("voiceschanged", sync);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", sync);
  }, []);

  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerOn]);

  const wordCount = words.length;
  const wpm = seconds > 0 ? Math.round((wordCount / seconds) * 60) : null;

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

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm md:p-6">
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
          <div className="mt-1 text-2xl font-extrabold">{mm}:{ss}</div>
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
        <BookOpen className="h-5 w-5" /> Click any word for instant voice pronunciation & dictionary
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-base leading-relaxed font-medium text-slate-800">
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
              Definition: {DICT[selectedWord] ?? "Academic / classroom vocabulary used in CEFR reading practice."}
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
