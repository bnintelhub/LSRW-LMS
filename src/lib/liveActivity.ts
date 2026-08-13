import type { Skill } from "../types/crm";
import type { LiveActivity } from "../types/progress";

const KEY = "lsrw-live-activity-v1";

export function loadLiveActivities(): LiveActivity[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LiveActivity[]) : [];
  } catch {
    return [];
  }
}

export function saveLiveActivities(items: LiveActivity[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function writeLiveActivity(studentId: string, skill: Skill | "Idle", progress: number): LiveActivity {
  const next: LiveActivity = {
    studentId,
    skill,
    progress: Math.max(0, Math.min(100, progress)),
    updatedAt: new Date().toISOString(),
  };
  const items = loadLiveActivities().filter((a) => a.studentId !== studentId);
  items.push(next);
  saveLiveActivities(items);
  return next;
}

export function getLiveActivity(studentId: string): LiveActivity | undefined {
  return loadLiveActivities().find((a) => a.studentId === studentId);
}

export function isStale(activity: LiveActivity | undefined, maxMs = 30_000) {
  if (!activity) return true;
  return Date.now() - new Date(activity.updatedAt).getTime() > maxMs;
}
