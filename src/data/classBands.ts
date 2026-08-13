import type { Profile } from "../types/student";

export function profileForClass(classNumber: number): Profile {
  if (classNumber <= 3) return "Foundational";
  if (classNumber <= 7) return "Elementary";
  if (classNumber <= 10) return "Exam-Track";
  return "Advanced";
}

/** Class 1–4: game labs. Class 5–12: AI Speaking/Listening/Reading/Writing labs. */
export function isGameBand(classNumber: number) {
  return classNumber < 5;
}

export type ClassMeta = {
  level: string;
  cefr: string;
  profile: Profile;
  ui: string;
  focus: string;
};

export const classMeta: Record<number, ClassMeta> = {
  1: { level: "Foundational / Pre-Reader", cefr: "Pre-A1", profile: "Foundational", ui: "AI teacher voice-first games", focus: "phonics, picture matching, tracing" },
  2: { level: "Early Reader", cefr: "Pre-A1 to A1", profile: "Foundational", ui: "High animation with labelled icons", focus: "rhymes, simple sentences, picture stories" },
  3: { level: "Beginner", cefr: "A1", profile: "Foundational", ui: "Reward animation with readable cards", focus: "short stories, routines, guided paragraphs" },
  4: { level: "Elementary", cefr: "A1+", profile: "Elementary", ui: "Card lessons with star ratings", focus: "dialogues, paragraph reading, informal letters" },
  5: { level: "Elementary+", cefr: "A2 entry", profile: "Elementary", ui: "Structured dashboard with charts", focus: "children's news, mini-presentations, tenses" },
  6: { level: "Pre-Intermediate", cefr: "A2", profile: "Elementary", ui: "Clean low-animation layout", focus: "note-taking, group discussion, essays" },
  7: { level: "Intermediate Entry", cefr: "A2+ / B1 entry", profile: "Elementary", ui: "Practice plus early exam style", focus: "summaries, debate, reports" },
  8: { level: "Intermediate", cefr: "B1", profile: "Exam-Track", ui: "Timed exam-oriented interface", focus: "academic listening, literary extracts, notices" },
  9: { level: "Intermediate+", cefr: "B1+", profile: "Exam-Track", ui: "Board-pattern analytics", focus: "note-making, JAM, unseen passages" },
  10: { level: "Upper-Intermediate", cefr: "B1+ / B2 entry", profile: "Exam-Track", ui: "Full exam simulation", focus: "interviews, public speaking, analytical writing" },
  11: { level: "Advanced Entry", cefr: "B2", profile: "Advanced", ui: "Professional career-ready workspace", focus: "GD, editorials, argumentative writing" },
  12: { level: "Advanced", cefr: "B2+", profile: "Advanced", ui: "Benchmarking and exam simulation", focus: "competitive listening, mock interviews, SOP writing" },
};

export function estimateDurationSec(text: string, wpm = 140) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(18, Math.round((words / wpm) * 60));
}
