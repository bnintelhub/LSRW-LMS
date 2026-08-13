import { useState } from "react";
import { ChevronRight, Mic, Square } from "lucide-react";
import { INTERVIEW_DECK } from "../../../data/interviewQuestions";
import { useSpeechRecognition } from "../../../hooks/useSpeechRecognition";
import { useLiveActivity } from "../../../hooks/useLiveActivity";
import { playSoundEffect, tokenizeText } from "../../../lib/speech";

type Props = {
  studentId: string;
  onComplete: (score: number, transcript: string, title: string) => void;
};

export function MockInterview({ studentId, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const question = INTERVIEW_DECK[index];
  const { transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  useLiveActivity(studentId, "Speaking", recording);

  const start = () => {
    resetTranscript();
    setRecording(true);
    playSoundEffect("record_start");
    startListening("en");
  };

  const scoreAnswer = () => {
    if (!question) return 0;
    const spoken = tokenizeText(transcript);
    const hits = question.keywords.filter((word) => transcript.toLowerCase().includes(word)).length;
    return Math.max(50, Math.min(98, spoken.length * 3 + hits * 10));
  };

  const saveAnswer = () => {
    stopListening();
    setRecording(false);
    playSoundEffect("record_stop");
    const nextAnswers = [...answers, scoreAnswer()];
    setAnswers(nextAnswers);
    if (index + 1 >= INTERVIEW_DECK.length) {
      const avg = Math.round(nextAnswers.reduce((sum, n) => sum + n, 0) / nextAnswers.length);
      setDone(true);
      onComplete(avg, transcript, `Interview: ${question.prompt}`);
      return;
    }
    setIndex((n) => n + 1);
    resetTranscript();
  };

  return (
    <div className="space-y-5">
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wide text-orange-600">Mock interview · Class 11–12</p>
        <h1 className="mt-1 text-3xl font-black">Question deck</h1>
        <p className="mt-2 text-sm text-slate-600">Answer six common questions. Heuristic feedback, not a real interviewer.</p>
      </div>

      <div className="panel-card">
        {done ? (
          <p className="text-lg font-black text-emerald-700">
            Interview practice saved. Average score {answers.length ? Math.round(answers.reduce((a, b) => a + b, 0) / answers.length) : 0}%.
          </p>
        ) : (
          <>
            <p className="text-sm font-black uppercase text-slate-400">
              Question {index + 1} of {INTERVIEW_DECK.length}
            </p>
            <h2 className="mt-2 text-2xl font-black">{question.prompt}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Hint: {question.hint}</p>
            {!isSupported && <p className="mt-3 text-xs font-bold text-amber-700">Mic transcription needs Chrome/Edge.</p>}
            <p className="mt-4 min-h-24 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {transcript || "Speak your answer after you start recording."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {!recording ? (
                <button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={start}>
                  <Mic size={16} /> Record answer
                </button>
              ) : (
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-black text-white" onClick={saveAnswer}>
                  <Square size={16} /> Save & next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
