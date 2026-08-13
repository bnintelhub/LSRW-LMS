import { useState } from "react";
import { Inbox, Star } from "lucide-react";
import { useAppStore } from "../../context/AppStoreContext";

export function SubmissionInbox({
  allotted,
  pendingOnly = false,
}: {
  allotted: { classNumber: number; section: "A" | "B" }[];
  pendingOnly?: boolean;
}) {
  const { submissions, reviewSubmission } = useAppStore();
  const scoped = submissions.filter(
    (item) =>
      allotted.some((slot) => slot.classNumber === item.classNumber && slot.section === item.section) &&
      (!pendingOnly || item.status === "pending"),
  );
  const [comment, setComment] = useState("");
  const [stars, setStars] = useState(4);
  const [selectedId, setSelectedId] = useState<string | null>(scoped[0]?.id ?? null);
  const selected = scoped.find((item) => item.id === selectedId) ?? scoped[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="content-card">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <Inbox size={18} /> {pendingOnly ? "Pending Reviews" : "Submissions"}
        </h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {scoped.length} {pendingOnly ? "waiting" : "in your classes"}
        </p>
        <div className="mt-4 space-y-2">
          {scoped.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              {pendingOnly
                ? "No pending writing or speaking reviews."
                : "No writing/speaking submissions yet. Students submit from the labs."}
            </p>
          )}
          {scoped.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setStars(item.teacherScore ? Math.round(item.teacherScore / 20) : 4);
                setComment(item.teacherComment ?? "");
              }}
              className={`w-full rounded-2xl px-3 py-3 text-left ${
                selected?.id === item.id ? "bg-orange-50 ring-1 ring-orange-200" : "bg-slate-50"
              }`}
            >
              <p className="font-black">{item.studentName}</p>
              <p className="text-xs text-slate-500">
                {item.skill} · Class {item.classNumber}-{item.section} · {item.status}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="content-card">
        {!selected ? (
          <p className="text-slate-500">Select a submission to review.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase text-orange-600">{selected.skill}</p>
              <h3 className="text-2xl font-black">{selected.title}</h3>
              <p className="text-sm text-slate-500">
                {selected.studentName} · auto score {selected.score ?? "—"}%
              </p>
            </div>
            <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              {selected.content}
            </pre>
            {selected.status === "reviewed" ? (
              <p className="rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">
                Reviewed · {selected.teacherScore}% · {selected.teacherComment}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-600">Teacher score (1–5)</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStars(value)}
                      className="rounded-lg p-1"
                      aria-label={`${value} stars`}
                    >
                      <Star
                        size={22}
                        className={value <= stars ? "fill-orange-500 text-orange-500" : "text-slate-300"}
                      />
                    </button>
                  ))}
                  <span className="ml-2 self-center text-sm font-black text-orange-600">{stars * 20}%</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Feedback for the student"
                  className="h-24 w-full rounded-2xl border border-slate-200 p-3"
                />
                <button
                  onClick={() => {
                    reviewSubmission(selected.id, stars * 20, comment.trim() || "Reviewed");
                    setComment("");
                  }}
                  className="rounded-2xl bg-orange-500 px-5 py-3 font-black text-white"
                >
                  Mark Reviewed
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
