import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Mic, Square } from "lucide-react";
import { DemoBadge } from "../../../components/DemoBadge";
import { debateTopicsFor } from "../../../data/debateTopics";
import { useSpeechRecognition } from "../../../hooks/useSpeechRecognition";
import { useLiveActivity } from "../../../hooks/useLiveActivity";
import { playSoundEffect, tokenizeText } from "../../../lib/speech";

type Props = {
  studentId: string;
  classNumber: number;
  onComplete: (score: number, transcript: string, title: string) => void;
};

const LIMIT = 120;

export function DebatePractice({ studentId, classNumber, onComplete }: Props) {
  const topics = useMemo(() => debateTopicsFor(classNumber), [classNumber]);
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const topic = topics.find((item) => item.id === topicId) ?? topics[0];
  const [stance, setStance] = useState<"A" | "B">("A");
  const [remaining, setRemaining] = useState(LIMIT);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const remainingRef = useRef(LIMIT);
  const doneRef = useRef(false);
  const transcriptRef = useRef("");
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();
  useLiveActivity(studentId, "Speaking", running);
  transcriptRef.current = transcript;

  const finish = () => {
    if (doneRef.current || !topic) return;
    doneRef.current = true;
    stopListening();
    setRunning(false);
    playSoundEffect("record_stop");
    const spokenText = transcriptRef.current;
    const spoken = tokenizeText(spokenText);
    const hits = topic.keywords.filter((word) => spokenText.toLowerCase().includes(word)).length;
    const duration = LIMIT - remainingRef.current;
    const lengthScore = Math.min(40, spoken.length * 2);
    const keywordScore = Math.min(40, hits * 8);
    const timeScore = duration >= 40 ? 20 : Math.round((duration / 40) * 20);
    const next = Math.max(45, Math.min(98, lengthScore + keywordScore + timeScore));
    setScore(next);
    setDone(true);
    onComplete(next, spokenText, `GD: ${topic.title}`);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      remainingRef.current = Math.max(0, remainingRef.current - 1);
      setRemaining(remainingRef.current);
      if (remainingRef.current <= 0) finish();
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const start = () => {
    if (!topic || doneRef.current) return;
    resetTranscript();
    remainingRef.current = LIMIT;
    setRemaining(LIMIT);
    setRunning(true);
    setScore(null);
    playSoundEffect("record_start");
    startListening("en");
  };

  if (!topic) return <div className="empty-state">No debate topics for this class.</div>;

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="space-y-5">
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wide text-orange-600">
          Debate / GD · Class {classNumber} <DemoBadge />
        </p>
        <h1 className="mt-1 text-3xl font-black">Two-minute topic card</h1>
        <p className="mt-2 text-sm text-slate-600">Pick a side, speak for two minutes, and get a practice score.</p>
      </div>

      <div className="panel-card space-y-3">
        <select
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-bold"
          value={topic.id}
          disabled={running}
          onChange={(e) => {
            setTopicId(e.target.value);
            setDone(false);
            doneRef.current = false;
            setScore(null);
          }}
        >
          {topics.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <p className="text-sm font-semibold text-slate-600">{topic.prompt}</p>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-black ${stance === "A" ? "bg-orange-500 text-white" : "bg-slate-100"}`}
            onClick={() => setStance("A")}
            disabled={running}
          >
            {topic.stanceA}
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-black ${stance === "B" ? "bg-orange-500 text-white" : "bg-slate-100"}`}
            onClick={() => setStance("B")}
            disabled={running}
          >
            {topic.stanceB}
          </button>
        </div>
      </div>

      <div className="panel-card">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-black text-white">
            <Clock size={14} /> {mm}:{ss}
          </span>
          {!isSupported && <p className="text-xs font-bold text-amber-700">Mic transcription needs Chrome/Edge.</p>}
        </div>
        <p className="mt-4 min-h-24 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {transcript || "Your speech will appear here."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {!running && !done && (
            <button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={start}>
              <Mic size={16} /> Start 2 min
            </button>
          )}
          {running && (
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-black text-white" onClick={finish}>
              <Square size={16} /> Stop & score
            </button>
          )}
        </div>
        {isListening && <p className="mt-3 text-sm font-bold text-orange-600">Listening…</p>}
        {score !== null && (
          <p className="mt-4 font-black text-emerald-700">Practice score {score}%. Saved to speaking progress.</p>
        )}
      </div>
    </div>
  );
}
