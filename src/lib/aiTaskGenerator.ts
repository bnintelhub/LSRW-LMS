import { dailyTaskCatalog, ensureMode } from "../data/dailyTaskCatalog";
import type { DailyTask } from "../types/crm";

function hashSeed(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function pickCount(seed: number) {
  return 3 + (seed % 2); // 3 or 4 tasks
}

export function todayISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function generateAiDailyPack(options: {
  date: string;
  classNumber: number;
  section: "A" | "B" | "ALL";
}): DailyTask[] {
  const { date, classNumber, section } = options;
  const catalog = (dailyTaskCatalog[classNumber] ?? dailyTaskCatalog[6]).map((t) =>
    ensureMode(classNumber, t),
  );
  const seed = hashSeed(`${date}-${classNumber}-${section}`);
  const count = Math.min(catalog.length, pickCount(seed));

  // Rotate start index by date so Class 2 vs Class 9 packs differ and day-to-day varies
  const start = seed % catalog.length;
  const ordered = [...catalog.slice(start), ...catalog.slice(0, start)].slice(0, count);

  return ordered.map((template, index) => ({
    id: `task-${date}-c${classNumber}-${section}-${template.skill}-${index}-${seed % 997}`,
    date,
    classNumber,
    section,
    skill: template.skill,
    title: template.title,
    prompt: template.prompt,
    mode: template.mode,
    status: "draft" as const,
    source: "ai" as const,
    xpReward: template.xpReward,
    estimatedMinutes: template.estimatedMinutes,
    completedBy: [],
  }));
}
