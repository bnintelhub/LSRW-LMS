import type { Skill } from "../types/crm";
import type { Student } from "../types/student";
import { evaluateBadges } from "../data/badges";
import { todayISO } from "./aiTaskGenerator";

export type LabScoreResult = {
  student: Student;
  xpGained: number;
  newBadges: string[];
};

function yesterdayISO(today: string) {
  const d = new Date(`${today}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function applyLabScore(student: Student, skill: Skill, score: number, date = todayISO()): LabScoreResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const blended = Math.round(student.scores[skill] * 0.7 + clamped * 0.3);
  const xpGained = 20 + Math.round(clamped / 5);
  let streak = student.streak;
  if (student.lastActiveDate === date) {
    streak = student.streak;
  } else if (student.lastActiveDate === yesterdayISO(date) || !student.lastActiveDate) {
    streak = student.lastActiveDate === yesterdayISO(date) ? student.streak + 1 : Math.max(1, student.streak);
    if (!student.lastActiveDate) streak = Math.max(1, student.streak);
  } else {
    streak = 1;
  }

  const next: Student = {
    ...student,
    scores: { ...student.scores, [skill]: blended },
    xp: student.xp + xpGained,
    coins: student.coins + 5,
    streak,
    lastActiveDate: date,
  };
  const badges = evaluateBadges(next);
  const newBadges = badges.filter((id) => !student.badges.includes(id));
  return { student: { ...next, badges }, xpGained, newBadges };
}

export function classRank(students: Student[], studentId: string) {
  const me = students.find((s) => s.id === studentId);
  if (!me) return { rank: 0, total: 0 };
  const peers = students
    .filter((s) => s.classNumber === me.classNumber && s.section === me.section)
    .sort((a, b) => b.xp - a.xp);
  return { rank: peers.findIndex((s) => s.id === studentId) + 1, total: peers.length };
}

export function leaderboardFor(students: Student[], classNumber: number, section: "A" | "B", limit = 10) {
  return students
    .filter((s) => s.classNumber === classNumber && s.section === section)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

const SKILL_ORDER: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];

export function weakestSkill(scores: Student["scores"]): Skill {
  return SKILL_ORDER.reduce((lowest, skill) => (scores[skill] < scores[lowest] ? skill : lowest));
}
