import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardList, Sparkles, Trash2 } from "lucide-react";
import { useCrm } from "../../context/CrmContext";
import { generateAiDailyPack, todayISO } from "../../lib/aiTaskGenerator";
import type { DailyTask, Skill } from "../../types/crm";

type Allotment = { classNumber: number; section: "A" | "B" };

type Props = {
  teacherId: string;
  allotted: Allotment[];
  students: { id: string; classNumber: number; section: "A" | "B"; name: string }[];
};

const skills: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];

export function DailyTaskDesk({ teacherId, allotted, students }: Props) {
  const { draftsFor, publishedTasksFor, dispatch } = useCrm();
  const [active, setActive] = useState<Allotment>(allotted[0]);
  const [date, setDate] = useState(todayISO());
  const [sectionMode, setSectionMode] = useState<"A" | "B" | "ALL">(allotted[0]?.section ?? "A");
  const [generating, setGenerating] = useState(false);

  const scopeSection = sectionMode === "ALL" ? "ALL" : active.section;
  const drafts = draftsFor({
    date,
    classNumber: active.classNumber,
    section: scopeSection,
  });
  const published = publishedTasksFor({
    date,
    classNumber: active.classNumber,
    section: active.section,
  });

  const classStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          s.classNumber === active.classNumber &&
          (sectionMode === "ALL" || s.section === active.section),
      ),
    [students, active, sectionMode],
  );

  const completionPct = useMemo(() => {
    if (!published.length || !classStudents.length) return 0;
    const donePairs = published.reduce(
      (sum, t) => sum + t.completedBy.filter((id) => classStudents.some((s) => s.id === id)).length,
      0,
    );
    return Math.round((donePairs / (published.length * classStudents.length)) * 100);
  }, [published, classStudents]);

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      const pack = generateAiDailyPack({
        date,
        classNumber: active.classNumber,
        section: scopeSection,
      });
      dispatch({ type: "setDraftPack", tasks: pack });
      setGenerating(false);
    }, 700);
  };

  const publish = () => {
    dispatch({
      type: "publishPack",
      date,
      classNumber: active.classNumber,
      section: scopeSection,
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-orange-600">
              Teacher Daily Desk · AI Task Generator
            </p>
            <h1 className="mt-2 text-3xl font-black">Class-wise Daily Tasks</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Generate different LSRW packs per class. Class 1–4 get game tasks; Class 5–12 get AI lab tasks.
            </p>
          </div>
          <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center">
            <p className="text-xs font-bold text-slate-500">Today completion</p>
            <p className="text-3xl font-black text-orange-600">{completionPct}%</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {allotted.map((item) => (
            <button
              key={`${item.classNumber}-${item.section}`}
              className={`rounded-2xl px-4 py-3 font-black ${
                active.classNumber === item.classNumber && active.section === item.section
                  ? "bg-orange-500 text-white"
                  : "bg-orange-50 text-orange-700"
              }`}
              onClick={() => {
                setActive(item);
                setSectionMode(item.section);
              }}
            >
              Class {item.classNumber}-{item.section}
            </button>
          ))}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 font-bold"
          />
          <select
            value={sectionMode}
            onChange={(e) => setSectionMode(e.target.value as "A" | "B" | "ALL")}
            className="rounded-2xl border border-slate-200 px-4 py-3 font-bold"
          >
            <option value={active.section}>Section {active.section}</option>
            <option value="ALL">Whole class (A+B)</option>
          </select>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "AI generating pack..." : "Generate with AI"}
          </button>
          <button
            onClick={publish}
            disabled={!drafts.length}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-black text-white disabled:opacity-40"
          >
            <ClipboardList className="h-4 w-4" /> Publish to Class
          </button>
        </div>
      </div>

      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-orange-100 bg-orange-50 p-4 font-black text-orange-700"
        >
          Mock AI is selecting Class {active.classNumber} curriculum tasks for {date}...
        </motion.div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <TaskList
          title="Draft pack (editable)"
          empty="Generate an AI pack for this class."
          tasks={drafts}
          editable
          onPatch={(id, patch) => dispatch({ type: "updateDraftTask", taskId: id, patch })}
          onRemove={(id) => dispatch({ type: "removeDraftTask", taskId: id })}
        />
        <TaskList
          title="Published for students"
          empty="No published tasks for this class/date yet."
          tasks={published}
          editable={false}
          students={classStudents}
        />
      </div>

      <p className="text-xs text-slate-500">Teacher id: {teacherId} · Scoped students: {classStudents.length}</p>
    </div>
  );
}

function TaskList({
  title,
  empty,
  tasks,
  editable,
  onPatch,
  onRemove,
  students,
}: {
  title: string;
  empty: string;
  tasks: DailyTask[];
  editable: boolean;
  onPatch?: (id: string, patch: Partial<DailyTask>) => void;
  onRemove?: (id: string) => void;
  students?: { id: string; name: string }[];
}) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-3">
        {!tasks.length && <p className="text-sm text-slate-500">{empty}</p>}
        {tasks.map((task) => {
          const doneCount = students
            ? task.completedBy.filter((id) => students.some((s) => s.id === id)).length
            : task.completedBy.length;
          return (
            <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  {editable ? (
                    <>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-black"
                        value={task.title}
                        onChange={(e) => onPatch?.(task.id, { title: e.target.value })}
                      />
                      <textarea
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={task.prompt}
                        onChange={(e) => onPatch?.(task.id, { prompt: e.target.value })}
                      />
                      <select
                        className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
                        value={task.skill}
                        onChange={(e) => onPatch?.(task.id, { skill: e.target.value as Skill })}
                      >
                        {skills.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <p className="font-black">
                        {task.skill}: {task.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{task.prompt}</p>
                    </>
                  )}
                  <p className="mt-2 text-xs font-bold text-orange-700">
                    {task.mode.toUpperCase()} · {task.estimatedMinutes} min · +{task.xpReward} XP ·{" "}
                    {task.source}
                  </p>
                  {!editable && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {doneCount} students completed
                    </p>
                  )}
                </div>
                {editable && (
                  <button
                    onClick={() => onRemove?.(task.id)}
                    className="rounded-xl bg-red-50 p-2 text-red-600"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
