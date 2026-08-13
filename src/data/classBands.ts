import type { Profile } from "../types/student";

export function profileForClass(classNumber: number): Profile {
  if (classNumber <= 3) return "Foundational";
  if (classNumber <= 7) return "Elementary";
  if (classNumber <= 10) return "Exam-Track";
  return "Advanced";
}

export function estimateDurationSec(text: string, wpm = 140) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(18, Math.round((words / wpm) * 60));
}
