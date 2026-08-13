import type { Skill } from "../types/crm";
import type { BadgeDef } from "../types/progress";
import type { Student } from "../types/student";

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first_lab",
    title: "First Practice",
    description: "Complete any LSRW lab or game",
    icon: "🌟",
    rule: "first_lab",
  },
  {
    id: "streak_7",
    title: "7-Day Streak",
    description: "Practice on 7 consecutive days",
    icon: "🔥",
    rule: "streak_7",
  },
  {
    id: "speaking_80",
    title: "Speaking Star",
    description: "Reach 80%+ in Speaking",
    icon: "🎤",
    rule: "speaking_80",
  },
  {
    id: "wpm_100",
    title: "100 WPM Reader",
    description: "Score 80%+ in Reading",
    icon: "📚",
    rule: "wpm_100",
  },
  {
    id: "xp_2000",
    title: "XP Champion",
    description: "Earn 2000 XP",
    icon: "🏆",
    rule: "xp_2000",
  },
  {
    id: "all_tasks_day",
    title: "Task Completer",
    description: "Finish all four skills at 70%+",
    icon: "✅",
    rule: "all_tasks_day",
  },
];

export function evaluateBadges(student: Student): string[] {
  const earned = new Set(student.badges);
  if (student.lastActiveDate) earned.add("first_lab");
  if (student.streak >= 7) earned.add("streak_7");
  if (student.scores.Speaking >= 80) earned.add("speaking_80");
  if (student.scores.Reading >= 80) earned.add("wpm_100");
  if (student.xp >= 2000) earned.add("xp_2000");
  const skills: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];
  if (skills.every((s) => student.scores[s] >= 70)) earned.add("all_tasks_day");
  return [...earned];
}
