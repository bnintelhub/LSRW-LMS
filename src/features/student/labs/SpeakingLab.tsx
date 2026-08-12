import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Mic,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSpeechRecognition } from "../../../hooks/useSpeechRecognition";
import {
  evaluateSpeechAccuracy,
  getActiveVoiceLabel,
  playSoundEffect,
  speakText,
  stopSpeech,
  type EvaluationResult,
  type WordAnalysis,
} from "../../../lib/speech";

const DEFAULT_SENTENCES: Record<string, string[]> = {
  Foundational: [
    "This is a ball.",
    "I see a red sun.",
    "The dog is happy.",
    "Good morning teacher.",
    "I like my school.",
  ],
  Elementary: [
    "The science club meets on Friday after lunch.",
    "Our classroom is bright and friendly.",
    "I introduce myself clearly and politely.",
    "Reading every day improves vocabulary.",
    "We write short paragraphs with correct punctuation.",
  ],
  "Exam-Track": [
    "Technology helps students learn when used with discipline.",
    "Water conservation needs planning and citizen participation.",
    "Effective communication requires active listening and clear speech.",
    "Board exam success depends on accuracy under timed conditions.",
    "Unseen passages test both vocabulary and inference skills.",
  ],
  Advanced: [
    "Artificial intelligence is transforming digital education across Indian language labs.",
    "Internships should build communication skills and professional confidence.",
    "Ethical AI in education requires transparency, consent and measurable outcomes.",
    "Group discussion practice prepares students for competitive interviews.",
    "Formal reports must present evidence before recommendations.",
  ],
};

type Props = {
  profile: string;
  classNumber: number;
  onEvaluationComplete?: (result: EvaluationResult) => void;
};

export function SpeakingLab({ profile, classNumber, onEvaluationComplete }: Props) {
  const sentences = useMemo(
    () => DEFAULT_SENTENCES[profile] ?? DEFAULT_SENTENCES.Elementary,
    [profile],
  );
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const currentSentence = sentences[sentenceIndex];
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [voiceLabel, setVoiceLabel] = useState(getActiveVoiceLabel());
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const sync = () => setVoiceLabel(getActiveVoiceLabel());
    sync();
    window.speechSynthesis?.addEventListener("voiceschanged", sync);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", sync);
  }, []);

  useEffect(() => {
    if (!isListening) return;
    const timer = window.setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isListening]);

  useEffect(() => {
    if (!isListening || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId = 0;
    let step = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mid = canvas.height / 2;
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#f97316";
      for (let x = 0; x < canvas.width; x += 5) {
        const amp = Math.sin((x + step) * 0.05) * 16 * (0.4 + Math.random());
        const y = mid + amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      step += 4;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [isListening]);

  const handlePlayNative = () => {
    if (isPlayingNative) {
      stopSpeech();
      setIsPlayingNative(false);
      return;
    }
    playSoundEffect("click");
    setIsPlayingNative(true);
    speakText(currentSentence, {
      langCode: "en",
      rate: 0.92,
      onVoice: setVoiceLabel,
      onEnd: () => setIsPlayingNative(false),
    });
  };

  const handleStart = () => {
    stopSpeech();
    playSoundEffect("record_start");
    setRecordingSeconds(0);
    setEvaluation(null);
    resetTranscript();
    startListening("en");
  };

  const handleStop = () => {
    playSoundEffect("record_stop");
    const spoken = stopListening() || transcript;
    const result = evaluateSpeechAccuracy(spoken, currentSentence, Math.max(1, recordingSeconds));
    setEvaluation(result);
    playSoundEffect("chime");
    confetti({ particleCount: 55, spread: 55, origin: { y: 0.72 }, colors: ["#f97316", "#fb923c", "#fed7aa"] });
    onEvaluationComplete?.(result);
  };

  const handleNext = () => {
    stopSpeech();
    playSoundEffect("click");
    setSentenceIndex((i) => (i + 1) % sentences.length);
    setEvaluation(null);
    resetTranscript();
  };

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
            AI Speaking Lab · Class {classNumber}
          </span>
          <h2 className="mt-2 text-xl font-black md:text-2xl">Pronunciation & Fluency Assessment</h2>
          <p className="mt-1 text-sm text-orange-50">Clear adult English TTS · {voiceLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3.5 py-2 text-xs font-bold hover:bg-white/30"
          >
            <RefreshCw className="h-4 w-4" /> Change Sentence
          </button>
          <button
            onClick={handlePlayNative}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black text-orange-700 shadow"
          >
            {isPlayingNative ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isPlayingNative ? "Stop Voice" : "Listen Target Sentence"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Target sentence to speak (#{sentenceIndex + 1} of {sentences.length})
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <p className="text-lg font-black text-slate-900">"{currentSentence}"</p>
          <button
            onClick={handlePlayNative}
            className="shrink-0 rounded-xl bg-orange-100 p-2 text-orange-600 hover:bg-orange-200"
            title="Listen clear AI voice"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="relative mb-4 flex h-24 w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-inner">
          {isListening ? (
            <>
              <canvas ref={canvasRef} width={400} height={50} className="h-10 w-full" />
              <div className="max-w-xs truncate text-xs font-bold text-orange-700">
                {transcript ? `Spoken: "${transcript}"` : "Listening to microphone..."}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Mic className="h-4 w-4 text-slate-400" /> Click Start AI Recording and speak aloud...
            </div>
          )}
          {isListening && (
            <span className="absolute top-2 right-3 animate-pulse text-xs font-bold text-red-600">
              REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </span>
          )}
        </div>

        {!isSupported && (
          <p className="mb-3 text-center text-xs font-bold text-amber-700">
            Speech recognition needs Chrome/Edge. TTS listen still works.
          </p>
        )}

        <div className="flex gap-3">
          {!isListening ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:scale-[1.02] hover:bg-red-500"
            >
              <Mic className="h-5 w-5" /> Start AI Recording
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow"
            >
              <Square className="h-5 w-5 fill-red-400 text-red-400" /> Stop & Analyze Voice
            </button>
          )}
          {evaluation && (
            <button onClick={handleStart} className="rounded-2xl bg-slate-200 p-3 text-slate-700" title="Retake">
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {evaluation && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Overall", evaluation.overallScore, "bg-orange-50 border-orange-200"],
              ["Pronunciation", evaluation.pronunciationScore, "bg-white border-slate-200"],
              ["Fluency", evaluation.fluencyScore, "bg-white border-slate-200"],
              ["Speech Speed", `${evaluation.speechRateWpm} WPM`, "bg-white border-slate-200"],
            ].map(([label, value, cls]) => (
              <div key={String(label)} className={`rounded-xl border p-4 text-center ${cls}`}>
                <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">
                  {typeof value === "number" ? `${value}%` : value}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-orange-600" /> Phonetic Accuracy Breakdown
              </h3>
              <span className="text-xs text-slate-500">Click word for clear AI pronunciation</span>
            </div>
            <p className="mb-3 text-xs text-slate-500">Heard: "{evaluation.transcribedText}"</p>
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              {evaluation.wordAnalysis.map((item: WordAnalysis, idx: number) => (
                <button
                  key={`${item.word}-${idx}`}
                  onClick={() => {
                    setActiveWord(item.word);
                    speakText(item.word, {
                      rate: 0.85,
                      onVoice: setVoiceLabel,
                      onEnd: () => setActiveWord(null),
                    });
                  }}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    item.status === "correct"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : item.status === "mispronounced"
                        ? "border-red-300 bg-red-50 text-red-800"
                        : "border-amber-300 bg-amber-50 text-amber-800"
                  }`}
                >
                  {item.word}
                  <Volume2 className={`h-3.5 w-3.5 ${activeWord === item.word ? "animate-bounce text-orange-500" : "opacity-60"}`} />
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Analysis complete using {voiceLabel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
