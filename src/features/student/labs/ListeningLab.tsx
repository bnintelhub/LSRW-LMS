import { FormEvent, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Headphones, Pause, Play, RotateCcw } from "lucide-react";
import {
  getActiveVoiceLabel,
  playSoundEffect,
  speakText,
  stopSpeech,
} from "../../../lib/speech";

const PASSAGES: Record<string, { title: string; text: string; mcq: { q: string; options: string[]; answer: string }; blank: { prompt: string; answer: string } }> = {
  Foundational: {
    title: "Junior_Listening_Clip_A1.mp3",
    text: "Good morning. This is a red ball. Tap the ball picture. The dog is happy. The sun is bright.",
    mcq: {
      q: "What colour is the ball?",
      options: ["Red", "Blue", "Green", "Black"],
      answer: "Red",
    },
    blank: { prompt: "Type the missing word: The sun is ______.", answer: "bright" },
  },
  Elementary: {
    title: "School_Announcement_A2.mp3",
    text: "The science club meets on Friday after lunch in the school library. Bring your notebook and a pencil. Parents may collect reports from the office.",
    mcq: {
      q: "Where does the science club meet?",
      options: ["Playground", "School library", "Canteen", "Computer lab"],
      answer: "School library",
    },
    blank: { prompt: 'Type missing word: Bring your notebook and a ______.', answer: "pencil" },
  },
  "Exam-Track": {
    title: "Climate_Summit_Podcast_B1.mp3",
    text: "Welcome to the Global Climate Summit podcast. Today we discuss offshore solar energy, wind power, and achieving net-zero carbon emissions by 2045.",
    mcq: {
      q: "Which energy sources are discussed?",
      options: ["Coal & Oil", "Offshore Solar & Wind", "Nuclear Only", "Hydro Only"],
      answer: "Offshore Solar & Wind",
    },
    blank: { prompt: "Type missing word: Achieving net-zero carbon ______ by 2045.", answer: "emissions" },
  },
  Advanced: {
    title: "Ethical_AI_Lecture_B2.mp3",
    text: "Ethical artificial intelligence in education requires transparency, consent and measurable learning outcomes. Schools must protect student data while using adaptive tools responsibly.",
    mcq: {
      q: "What must schools protect while using adaptive tools?",
      options: ["Student data", "Only textbooks", "Furniture", "Cafeteria menus"],
      answer: "Student data",
    },
    blank: { prompt: "Type missing word: Ethical AI requires transparency, consent and measurable ______ outcomes.", answer: "learning" },
  },
};

type Props = { profile: string; classNumber: number };

export function ListeningLab({ profile, classNumber }: Props) {
  const content = useMemo(() => PASSAGES[profile] ?? PASSAGES.Elementary, [profile]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voiceLabel, setVoiceLabel] = useState(getActiveVoiceLabel());
  const [mcqChoice, setMcqChoice] = useState("");
  const [dictation, setDictation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const sync = () => setVoiceLabel(getActiveVoiceLabel());
    sync();
    window.speechSynthesis?.addEventListener("voiceschanged", sync);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", sync);
  }, []);

  const play = (nextSpeed = speed) => {
    playSoundEffect("click");
    setIsPlaying(true);
    speakText(content.text, {
      langCode: "en",
      rate: nextSpeed,
      onVoice: setVoiceLabel,
      onEnd: () => setIsPlaying(false),
    });
  };

  const stop = () => {
    stopSpeech();
    setIsPlaying(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    playSoundEffect("chime");
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.75 }, colors: ["#f97316", "#22c55e"] });
  };

  const mcqOk = mcqChoice === content.mcq.answer;
  const blankOk = dictation.trim().toLowerCase() === content.blank.answer.toLowerCase();

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm md:p-6">
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (isPlaying ? stop() : play())}
              className="grid h-14 w-14 place-items-center rounded-full bg-white text-orange-600 shadow-lg transition hover:scale-105"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
            </button>
            <div>
              <div className="flex items-center gap-2 font-bold">
                <Headphones className="h-4 w-4" /> {content.title}
              </div>
              <div className="text-xs text-orange-50">Google / Web Speech Synthesizer Active · {voiceLabel}</div>
              <div className="mt-1 text-xs font-semibold text-white/90">Listening Studio · Class {classNumber}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-2">
            <button onClick={stop} className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
              <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Stop Speech
            </button>
            <span className="text-xs font-bold">Speed:</span>
            {[0.75, 1, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  if (isPlaying) play(s);
                }}
                className={`rounded-lg px-2 py-1 text-xs font-bold ${speed === s ? "bg-white text-orange-600" : "text-white"}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div className={`h-full rounded-full bg-white transition-all ${isPlaying ? "w-2/3 animate-pulse" : "w-0"}`} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900">Audio Comprehension & Dictation</h3>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">+150 XP Reward</span>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-700">Q1. {content.mcq.q}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {content.mcq.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setMcqChoice(opt)}
                className={`rounded-xl border px-3 py-2 text-left text-sm font-bold ${
                  mcqChoice === opt ? "border-orange-400 bg-orange-50 text-orange-800" : "border-slate-200 bg-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-slate-700">Q2. {content.blank.prompt}</p>
          <input
            value={dictation}
            onChange={(e) => setDictation(e.target.value)}
            placeholder="Type missing word here..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-orange-400"
          />
        </div>

        <button type="submit" className="w-full rounded-xl bg-orange-500 py-3 text-sm font-black text-white shadow hover:bg-orange-600">
          Submit Quiz
        </button>

        {submitted && (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Quiz checked
            </div>
            <p>MCQ: {mcqOk ? "Correct" : `Review — answer is "${content.mcq.answer}"`}</p>
            <p>Dictation: {blankOk ? "Correct" : `Review — answer is "${content.blank.answer}"`}</p>
          </div>
        )}
      </form>
    </div>
  );
}
