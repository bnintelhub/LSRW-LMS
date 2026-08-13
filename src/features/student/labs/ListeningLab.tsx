import { FormEvent, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Headphones, Pause, Play, RotateCcw } from "lucide-react";
import {
  getActiveVoiceLabel,
  playSoundEffect,
  speakText,
  stopSpeech,
} from "../../../lib/speech";
import { formatClipDuration, getListeningClips, type ListeningClip } from "../../../data/listeningClips";

type Props = { profile: string; classNumber: number; onComplete?: (score: number) => void };

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function ListeningLab({ classNumber, onComplete }: Props) {
  const clips = useMemo(() => getListeningClips(classNumber), [classNumber]);
  const [clipId, setClipId] = useState(clips[0]?.id ?? "");
  const clip = clips.find((item) => item.id === clipId) ?? clips[0];
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voiceLabel, setVoiceLabel] = useState(getActiveVoiceLabel());
  const [mcqChoices, setMcqChoices] = useState<string[]>([]);
  const [dictation, setDictation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setClipId(clips[0]?.id ?? "");
  }, [clips]);

  useEffect(() => {
    stopSpeech();
    setIsPlaying(false);
    setMcqChoices([]);
    setDictation("");
    setSubmitted(false);
  }, [clipId]);

  useEffect(() => {
    const sync = () => setVoiceLabel(getActiveVoiceLabel());
    sync();
    window.speechSynthesis?.addEventListener("voiceschanged", sync);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", sync);
      stopSpeech();
    };
  }, []);

  if (!clip) return null;

  const play = (nextSpeed = speed, target: ListeningClip = clip) => {
    playSoundEffect("click");
    setIsPlaying(true);
    speakText(target.transcript, {
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

  const mcqResults = clip.mcqs.map((item, index) => mcqChoices[index] === item.answer);
  const blankOk = normalizeAnswer(dictation) === normalizeAnswer(clip.blank.answer);
  const totalQuestions = clip.mcqs.length + 1;
  const correctCount = mcqResults.filter(Boolean).length + (blankOk ? 1 : 0);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    playSoundEffect("chime");
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.75 }, colors: ["#f97316", "#22c55e"] });
    const score = Math.round((correctCount / totalQuestions) * 100);
    onComplete?.(Math.max(40, score));
  };

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-orange-600">Listening clip library · Class {classNumber}</p>
          <h2 className="mt-1 text-xl font-black">Choose a clip, then take the quiz</h2>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
          Demo · TTS stand-in for MP3
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {clips.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setClipId(item.id)}
            className={`rounded-2xl border p-4 text-left ${
              clip.id === item.id ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="font-black text-slate-900">{item.title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {item.fileLabel} · {formatClipDuration(item.durationSec)}
            </p>
          </button>
        ))}
      </div>

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
                <Headphones className="h-4 w-4" /> {clip.title}
              </div>
              <div className="text-xs text-orange-50">
                {clip.fileLabel} · {formatClipDuration(clip.durationSec)} · {voiceLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-2">
            <button onClick={stop} className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-bold">
              <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Stop
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
          <h3 className="font-black text-slate-900">Comprehension quiz</h3>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
            {clip.mcqs.length + 1} questions
          </span>
        </div>

        {clip.mcqs.map((item, index) => (
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
                    setMcqChoices((prev) => {
                      const next = [...prev];
                      next[index] = opt;
                      return next;
                    })
                  }
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-bold ${
                    mcqChoices[index] === opt ? "border-orange-400 bg-orange-50 text-orange-800" : "border-slate-200 bg-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="text-sm font-bold text-slate-700">
            Q{clip.mcqs.length + 1}. {clip.blank.prompt}
          </p>
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
              <CheckCircle2 className="h-5 w-5" /> Score saved: {Math.round((correctCount / totalQuestions) * 100)}%
            </div>
            {clip.mcqs.map((item, index) => (
              <p key={item.q}>
                Q{index + 1}: {mcqResults[index] ? "Correct" : `Review — answer is “${item.answer}”`}
              </p>
            ))}
            <p>
              Dictation: {blankOk ? "Correct" : `Review — answer is “${clip.blank.answer}”`}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
