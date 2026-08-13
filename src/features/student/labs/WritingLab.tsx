import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PencilLine, Sparkles } from "lucide-react";
import { playSoundEffect } from "../../../lib/speech";
import { getWritingPrompt } from "../../../data/writingPrompts";

type Alert = {
  id: string;
  type: "grammar" | "vocabulary";
  from: string;
  to: string;
  note: string;
};

function buildAlerts(text: string): Alert[] {
  const alerts: Alert[] = [];
  if (/\boffers\b/i.test(text) && /\blabs?\b/i.test(text)) {
    alerts.push({
      id: "sv1",
      type: "grammar",
      from: "offers",
      to: "offer",
      note: "Subject-verb agreement: plural subject needs base verb form.",
    });
  }
  if (/\blacks\b/i.test(text)) {
    alerts.push({
      id: "sv2",
      type: "grammar",
      from: "lacks",
      to: "lack",
      note: "Agreement issue with plural ideas / compound subject.",
    });
  }
  if (/\butilizing\b/i.test(text)) {
    alerts.push({
      id: "vocab1",
      type: "vocabulary",
      from: "utilizing",
      to: "leveraging",
      note: "Stronger academic tone for CEFR B2 writing.",
    });
  }
  if (!/[.!?]$/.test(text.trim())) {
    alerts.push({
      id: "punct",
      type: "grammar",
      from: "missing end punctuation",
      to: "add . ! or ?",
      note: "End the paragraph with clear punctuation.",
    });
  }
  if (text.split(/\s+/).filter(Boolean).length < 12) {
    alerts.push({
      id: "length",
      type: "vocabulary",
      from: "short draft",
      to: "expand with example",
      note: "Add one concrete example to strengthen structure.",
    });
  }
  return alerts.slice(0, 4);
}

type Props = {
  profile: string;
  classNumber: number;
  onComplete?: (score: number) => void;
  onSubmitWriting?: (payload: { title: string; content: string; score: number }) => void;
};

export function WritingLab({ classNumber, onComplete, onSubmitWriting }: Props) {
  const meta = useMemo(() => getWritingPrompt(classNumber), [classNumber]);
  const [text, setText] = useState(meta.starter);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setText(meta.starter);
    setAlerts([]);
    setAccepted([]);
    setSubmitted(false);
  }, [meta.starter]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const runCheck = () => {
    playSoundEffect("click");
    setAlerts(buildAlerts(text));
    setAccepted([]);
  };

  const acceptFix = (alert: Alert) => {
    if (alert.from === "missing end punctuation") {
      setText((t) => `${t.trim()}.`);
    } else if (alert.from !== "short draft") {
      setText((t) => t.replace(new RegExp(`\\b${alert.from}\\b`, "i"), alert.to));
    }
    setAccepted((ids) => [...ids, alert.id]);
    playSoundEffect("chime");
  };

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-orange-50 to-amber-50 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-bold uppercase text-orange-700">
            Writing AI Checker · Class {classNumber} · Target {meta.target}
          </span>
          <h2 className="mt-1 text-xl font-black text-slate-900 md:text-2xl">{meta.title}</h2>
        </div>
        <button
          onClick={runCheck}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow hover:bg-orange-600"
        >
          <Sparkles className="h-4 w-4" /> Run AI Grammar Check
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            Essay prompt: {meta.prompt}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>
                {wordCount} / {meta.words} words
              </span>
              <span>Target: CEFR {meta.target}</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-56 w-full rounded-xl border border-orange-100 bg-slate-50 p-4 text-sm outline-orange-400"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">Auto-saved just now (session only)</span>
              <button
                onClick={() => {
                  const openAlerts = alerts.filter((a) => !accepted.includes(a.id)).length;
                  const lengthScore = Math.min(70, Math.round((wordCount / meta.words) * 70));
                  const score = Math.max(45, Math.min(96, lengthScore + Math.max(0, 26 - openAlerts * 8)));
                  setSubmitted(true);
                  playSoundEffect("success");
                  onComplete?.(score);
                  onSubmitWriting?.({ title: meta.title, content: text, score });
                }}
                className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white"
              >
                Submit to Teacher Queue
              </button>
            </div>
            {submitted && (
              <p className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Queued for teacher review in Pending Reviews.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
              <PencilLine className="h-4 w-4 text-orange-600" /> AI Real-time Grammar Suggestions
            </h3>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-black text-orange-700">
              {alerts.filter((a) => !accepted.includes(a.id)).length} Alerts
            </span>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-500">Click “Run AI Grammar Check” to analyse this draft.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const done = accepted.includes(alert.id);
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-3 ${
                      alert.type === "grammar" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
                    } ${done ? "opacity-50" : ""}`}
                  >
                    <div className="text-xs font-black uppercase text-slate-600">
                      {alert.type === "grammar" ? "Grammar Alert" : "Vocabulary Alert"}
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {alert.from} → {alert.to}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{alert.note}</p>
                    {!done && (
                      <button
                        onClick={() => acceptFix(alert)}
                        className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Accept Fix
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
