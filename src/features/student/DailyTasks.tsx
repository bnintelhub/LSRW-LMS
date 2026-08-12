import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Play } from "lucide-react";
import { useCrm } from "../../context/CrmContext";
import { todayISO } from "../../lib/aiTaskGenerator";
import type { DailyTask, Scores, Skill } from "../../types/crm";

type Props = {
  studentId: string;
  classNumber: number;
  section: "A" | "B";
  scores: Scores;
  onStartSkill: (skill: Skill) => void;
};

export function StudentDailyTasks({ studentId, classNumber, section, scores, onStartSkill }: Props) {
  const { publishedTasksFor, dispatch, reportFor } = useCrm();
  const date = todayISO();
  const tasks = publishedTasksFor({ date, classNumber, section });
  const completed = tasks.filter((t) => t.completedBy.includes(studentId)).length;

  const markDone = (task: DailyTask) => {
    const already = task.completedBy.includes(studentId);
    dispatch({ type: "completeTask", taskId: task.id, studentId, minutes: task.estimatedMinutes });
    const nextCompleted = completed + (already ? 0 : 1);
    const existing = reportFor(studentId, date);
    dispatch({
      type: "upsertReport",
      report: {
        studentId,
        date,
        skills: scores,
        tasksCompleted: Math.max(existing?.tasksCompleted ?? 0, nextCompleted),
        tasksTotal: tasks.length,
        timeSpentMin: (existing?.timeSpentMin ?? 0) + (already ? 0 : task.estimatedMinutes),
        attendance: nextCompleted > 0 ? "present" : "partial",
        teacherRemarks: existing?.teacherRemarks ?? [],
        sessionSummary: existing?.sessionSummary,
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-orange-100 bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-orange-50">Today · {date}</p>
        <h1 className="mt-2 text-3xl font-black">Today's Tasks</h1>
        <p className="mt-2 text-orange-50">
          Class {classNumber}-{section} · {completed}/{tasks.length || 0} completed
        </p>
      </div>

      {!tasks.length ? (
        <div className="rounded-[1.75rem] border border-orange-100 bg-white p-8 text-center shadow-sm">
          <p className="font-black text-slate-800">No tasks published yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Ask your teacher to generate and publish today's AI task pack for this class.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const done = task.completedBy.includes(studentId);
            return (
              <div
                key={task.id}
                className={`rounded-[1.5rem] border bg-white p-5 shadow-sm ${
                  done ? "border-emerald-200" : "border-orange-100"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-orange-600">
                      {task.skill} · {task.mode} · +{task.xpReward} XP
                    </p>
                    <h2 className="mt-1 text-xl font-black">{task.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{task.prompt}</p>
                    <p className="mt-2 text-xs font-bold text-slate-500">~{task.estimatedMinutes} min</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onStartSkill(task.skill)}
                      className="flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 font-black text-white"
                    >
                      <Play className="h-4 w-4" /> Start
                    </button>
                    <button
                      onClick={() => markDone(task)}
                      disabled={done}
                      className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 font-black text-white disabled:opacity-50"
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      {done ? "Done" : "Mark Done"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
