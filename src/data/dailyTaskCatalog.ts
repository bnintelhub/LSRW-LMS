import type { Skill, TaskTemplate } from "../types/crm";

function isGame(classNumber: number) {
  return classNumber < 5;
}

function modeFor(classNumber: number) {
  return isGame(classNumber) ? ("game" as const) : ("lab" as const);
}

/** Class-wise daily task templates — different content per class (1–12). */
export const dailyTaskCatalog: Record<number, TaskTemplate[]> = {
  1: [
    { skill: "Listening", title: "Pop the Ball Sound", prompt: "Listen and tap the ball picture.", mode: "game", xpReward: 40, estimatedMinutes: 8 },
    { skill: "Speaking", title: "Say SUN", prompt: "Hear the AI voice and say the word SUN.", mode: "game", xpReward: 45, estimatedMinutes: 8 },
    { skill: "Reading", title: "Match Dog Picture", prompt: "Match sight words with pictures.", mode: "game", xpReward: 40, estimatedMinutes: 10 },
    { skill: "Writing", title: "Build SUN", prompt: "Use letter tiles to build SUN.", mode: "game", xpReward: 40, estimatedMinutes: 10 },
  ],
  2: [
    { skill: "Listening", title: "Cat on the Mat", prompt: "Listen to the rhyme and pick the cat.", mode: "game", xpReward: 45, estimatedMinutes: 8 },
    { skill: "Speaking", title: "Say a Sentence", prompt: "Repeat: This is a ball.", mode: "game", xpReward: 50, estimatedMinutes: 10 },
    { skill: "Reading", title: "Tree & Book Match", prompt: "Match early reader words with pictures.", mode: "game", xpReward: 45, estimatedMinutes: 10 },
    { skill: "Writing", title: "Build CAT", prompt: "Build the word CAT with tiles.", mode: "game", xpReward: 45, estimatedMinutes: 10 },
  ],
  3: [
    { skill: "Listening", title: "Morning Routine Audio", prompt: "Listen and choose what happens in the morning.", mode: "game", xpReward: 50, estimatedMinutes: 10 },
    { skill: "Speaking", title: "My Daily Routine", prompt: "Say 2–3 sentences about your morning.", mode: "game", xpReward: 55, estimatedMinutes: 12 },
    { skill: "Reading", title: "School Word Match", prompt: "Match SCHOOL, FRIEND, WATER, APPLE.", mode: "game", xpReward: 50, estimatedMinutes: 12 },
    { skill: "Writing", title: "Build BOOK", prompt: "Build BOOK and copy it once.", mode: "game", xpReward: 50, estimatedMinutes: 12 },
  ],
  4: [
    { skill: "Listening", title: "Friday Club Announcement", prompt: "Listen for the day the science club meets.", mode: "game", xpReward: 55, estimatedMinutes: 12 },
    { skill: "Speaking", title: "Self Introduction", prompt: "Introduce yourself in 3 clear sentences.", mode: "game", xpReward: 60, estimatedMinutes: 12 },
    { skill: "Reading", title: "Library Word Match", prompt: "Match LIBRARY, GARDEN, TEACHER, PENCIL.", mode: "game", xpReward: 55, estimatedMinutes: 12 },
    { skill: "Writing", title: "I LIKE SCHOOL", prompt: "Build the sentence with word tiles.", mode: "game", xpReward: 55, estimatedMinutes: 12 },
  ],
  5: [
    { skill: "Listening", title: "Children's News Notes", prompt: "Note key details from the listening studio clip.", mode: "lab", xpReward: 70, estimatedMinutes: 15 },
    { skill: "Speaking", title: "1-Minute Mini Talk", prompt: "Record a 1-minute talk on a familiar topic.", mode: "lab", xpReward: 75, estimatedMinutes: 15 },
    { skill: "Reading", title: "150-Word Passage", prompt: "Read and answer comprehension in Reading & WPM.", mode: "lab", xpReward: 70, estimatedMinutes: 15 },
    { skill: "Writing", title: "Tense Focus Letter", prompt: "Write an informal letter focusing on tenses.", mode: "lab", xpReward: 70, estimatedMinutes: 18 },
  ],
  6: [
    { skill: "Listening", title: "Podcast Note-Taking", prompt: "Take notes from the Listening Studio podcast.", mode: "lab", xpReward: 80, estimatedMinutes: 16 },
    { skill: "Speaking", title: "Group Discussion Opener", prompt: "Record an opening statement for a simple debate.", mode: "lab", xpReward: 85, estimatedMinutes: 15 },
    { skill: "Reading", title: "Skim & Scan Drill", prompt: "Complete Reading & WPM skim/scan practice.", mode: "lab", xpReward: 80, estimatedMinutes: 16 },
    { skill: "Writing", title: "100-Word Essay Start", prompt: "Draft an introductory essay in Writing AI Checker.", mode: "lab", xpReward: 80, estimatedMinutes: 20 },
  ],
  7: [
    { skill: "Listening", title: "Summarise the Interview", prompt: "Summarise what you heard in 2–3 sentences.", mode: "lab", xpReward: 85, estimatedMinutes: 18 },
    { skill: "Speaking", title: "Extempore Practice", prompt: "Speak for 1–2 minutes on today's topic.", mode: "lab", xpReward: 90, estimatedMinutes: 16 },
    { skill: "Reading", title: "Critical Questions", prompt: "Answer analytical questions in Reading & WPM.", mode: "lab", xpReward: 85, estimatedMinutes: 18 },
    { skill: "Writing", title: "Article Intro", prompt: "Write an article opening with clear structure.", mode: "lab", xpReward: 85, estimatedMinutes: 20 },
  ],
  8: [
    { skill: "Listening", title: "Timed Lecture Gap-Fill", prompt: "Complete timed listening comprehension.", mode: "lab", xpReward: 90, estimatedMinutes: 20 },
    { skill: "Speaking", title: "Formal Presentation", prompt: "Practice a short formal presentation.", mode: "lab", xpReward: 95, estimatedMinutes: 18 },
    { skill: "Reading", title: "Literary Extract", prompt: "Analyse a short literary extract.", mode: "lab", xpReward: 90, estimatedMinutes: 20 },
    { skill: "Writing", title: "Notice Writing", prompt: "Write a formal notice/message.", mode: "lab", xpReward: 90, estimatedMinutes: 18 },
  ],
  9: [
    { skill: "Listening", title: "Board-Pattern Listening", prompt: "Complete board-exam style listening notes.", mode: "lab", xpReward: 95, estimatedMinutes: 22 },
    { skill: "Speaking", title: "JAM Session", prompt: "Just-A-Minute speaking on today's topic.", mode: "lab", xpReward: 100, estimatedMinutes: 15 },
    { skill: "Reading", title: "Unseen Passage Pack", prompt: "Finish unseen passage drill with timer.", mode: "lab", xpReward: 95, estimatedMinutes: 22 },
    { skill: "Writing", title: "Analytical Paragraph", prompt: "Write an analytical paragraph from data points.", mode: "lab", xpReward: 95, estimatedMinutes: 22 },
  ],
  10: [
    { skill: "Listening", title: "Full Exam Listening", prompt: "Simulate board listening with class-average compare.", mode: "lab", xpReward: 100, estimatedMinutes: 25 },
    { skill: "Speaking", title: "Mock Interview", prompt: "Answer interview-style prompts in AI Speaking Lab.", mode: "lab", xpReward: 105, estimatedMinutes: 20 },
    { skill: "Reading", title: "Board Unseen Combo", prompt: "Comprehension + vocabulary + inference pack.", mode: "lab", xpReward: 100, estimatedMinutes: 25 },
    { skill: "Writing", title: "Report Writing", prompt: "Draft a formal report with recommendations.", mode: "lab", xpReward: 100, estimatedMinutes: 25 },
  ],
  11: [
    { skill: "Listening", title: "Lecture Summary Benchmark", prompt: "Summarise professional lecture audio.", mode: "lab", xpReward: 110, estimatedMinutes: 25 },
    { skill: "Speaking", title: "GD Opening Statement", prompt: "Prepare GD opening for competitive exams.", mode: "lab", xpReward: 115, estimatedMinutes: 20 },
    { skill: "Reading", title: "Editorial Analysis", prompt: "Separate argument, evidence and tone.", mode: "lab", xpReward: 110, estimatedMinutes: 25 },
    { skill: "Writing", title: "Argumentative Essay", prompt: "Write a persuasive argumentative essay.", mode: "lab", xpReward: 110, estimatedMinutes: 30 },
  ],
  12: [
    { skill: "Listening", title: "Competitive Listening", prompt: "Native-pace interview/lecture comprehension.", mode: "lab", xpReward: 120, estimatedMinutes: 25 },
    { skill: "Speaking", title: "College Interview Mock", prompt: "Mock PI practice for admissions.", mode: "lab", xpReward: 125, estimatedMinutes: 22 },
    { skill: "Reading", title: "Critical Reasoning Passages", prompt: "Advanced editorial + reasoning set.", mode: "lab", xpReward: 120, estimatedMinutes: 25 },
    { skill: "Writing", title: "SOP-Style Draft", prompt: "Write a structured long-form response.", mode: "lab", xpReward: 120, estimatedMinutes: 30 },
  ],
};

export function ensureMode(classNumber: number, template: TaskTemplate): TaskTemplate {
  return { ...template, mode: modeFor(classNumber) };
}

export const ALL_SKILLS: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];
