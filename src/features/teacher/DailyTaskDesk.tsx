import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Plus, Sparkles, Trash2 } from "lucide-react";
import { RingProgress } from "../../components/PortalShell";
import { DemoBadge } from "../../components/DemoBadge";
import { SkeletonCards } from "../../components/Skeleton";
import { useCrm } from "../../context/CrmContext";
import { generateAiDailyPack, todayISO } from "../../lib/aiTaskGenerator";
import { ensureMode } from "../../data/dailyTaskCatalog";
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
  const [customTitle, setCustomTitle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [customSkill, setCustomSkill] = useState<Skill>("Writing");
  const [customMinutes, setCustomMinutes] = useState(15);

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

  const addCustom = () => {
    const title = customTitle.trim();
    const prompt = customPrompt.trim();
    if (!title || !prompt) return;
    const template = ensureMode(active.classNumber, {
      skill: customSkill,
      title,
      prompt,
      mode: "lab",
      xpReward: 60,
      estimatedMinutes: customMinutes,
    });
    dispatch({
      type: "addDraftTask",
      task: {
        id: `task-custom-${Date.now()}`,
        date,
        classNumber: active.classNumber,
        section: scopeSection,
        skill: template.skill,
        title: template.title,
        prompt: template.prompt,
        mode: template.mode,
        status: "draft",
        source: "teacher",
        xpReward: template.xpReward,
        estimatedMinutes: template.estimatedMinutes,
        completedBy: [],
      },
    });
    setCustomTitle("");
    setCustomPrompt("");
  };

  return (
    <div className="space-y-5">
      <div className="panel-card">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.7fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-orange-600">
              Teacher Daily Desk · <DemoBadge label="Template pack" />
            </p>
            <h1 className="mt-2 text-3xl font-black">Class-wise Daily Tasks</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Generate different LSRW packs per class. Class 1–4 get game tasks; Class 5–12 get AI lab tasks.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {allotted.map((item) => (
                <button
                  key={`${item.classNumber}-${item.section}`}
                  className={`rounded-full px-4 py-2 text-sm font-black ${
                    active.classNumber === item.classNumber && active.section === item.section
                      ? "bg-orange-500 text-white"
                      : "bg-violet-50 text-violet-700"
                  }`}
                  onClick={() => {
                    setActive(item);
                    setSectionMode(item.section);
                  }}
                >
                  Class {item.classNumber}-{item.section}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold"
              />
              <select
                value={sectionMode}
                onChange={(e) => setSectionMode(e.target.value as "A" | "B" | "ALL")}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold"
              >
                <option value={active.section}>Section {active.section}</option>
                <option value="ALL">Whole class (A+B)</option>
              </select>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={generate}
                disabled={generating}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? "AI generating pack..." : "Generate with AI"}
              </button>
              <button
                onClick={publish}
                disabled={!drafts.length}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-black text-slate-800 disabled:opacity-40"
              >
                <ClipboardList className="h-4 w-4" /> Publish to Class
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-50 p-5">
            <RingProgress value={completionPct} label="Today completed" />
            <div className="w-full space-y-2 text-sm font-bold text-slate-600">
              {["Reading", "Writing", "Speaking", "Listening"].map((skill) => (
                <p key={skill} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {skill} task
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {generating && <SkeletonCards count={4} />}

      <div className="panel-card">
        <h2 className="text-lg font-black">Add custom task</h2>
        <p className="mt-1 text-sm text-slate-500">Teacher-authored tasks join the draft pack for this class and date.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Task title"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          />
          <select
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value as Skill)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          >
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Prompt / instructions"
            className="h-20 rounded-xl border border-slate-200 px-4 py-2.5 text-sm md:col-span-2"
          />
          <input
            type="number"
            min={5}
            max={60}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          />
          <button
            onClick={addCustom}
            disabled={!customTitle.trim() || !customPrompt.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-black text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Add to draft pack
          </button>
        </div>
      </div>

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
    <div className="panel-card overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-black">{title}</h2>
        {!editable && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Published</span>
        )}
      </div>
      <div className="space-y-3 px-5 pb-3">
        {!tasks.length && <div className="empty-state">{empty}</div>}
        {tasks.map((task) => {
          const doneCount = students
            ? task.completedBy.filter((id) => students.some((s) => s.id === id)).length
            : task.completedBy.length;
          return (
            <div key={task.id} className="nested-card">
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
      <button className="w-full border-t border-slate-100 px-5 py-3 text-left text-sm font-black text-orange-600">
        View all {editable ? "drafts" : "published tasks"}
      </button>
    </div>
  );
}
