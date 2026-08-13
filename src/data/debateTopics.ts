export type DebateTopic = {
  id: string;
  title: string;
  classNumbers: number[];
  stanceA: string;
  stanceB: string;
  keywords: string[];
  prompt: string;
};

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: "phones-class",
    title: "Should mobile phones be allowed in class?",
    classNumbers: [9, 10],
    stanceA: "For",
    stanceB: "Against",
    keywords: ["focus", "research", "distraction", "responsibility", "learning", "rules"],
    prompt: "Take a side. Give two reasons and one example from school life.",
  },
  {
    id: "homework",
    title: "Is daily homework necessary after class 8?",
    classNumbers: [9, 10, 11],
    stanceA: "Necessary",
    stanceB: "Reduce it",
    keywords: ["practice", "revision", "stress", "time", "habit", "independent"],
    prompt: "State your view, support it with evidence, and answer one likely counter-point.",
  },
  {
    id: "ai-exams",
    title: "Can AI tools help students prepare for board exams fairly?",
    classNumbers: [10, 11, 12],
    stanceA: "Yes, with rules",
    stanceB: "They harm integrity",
    keywords: ["practice", "feedback", "cheating", "original", "teacher", "ethics"],
    prompt: "Argue for two minutes. Mention both opportunity and risk.",
  },
  {
    id: "online-vs-lab",
    title: "Is a school language lab better than only watching videos at home?",
    classNumbers: [9, 10, 11, 12],
    stanceA: "Lab is better",
    stanceB: "Home videos are enough",
    keywords: ["speaking", "feedback", "practice", "teacher", "confidence", "listening"],
    prompt: "Compare both. End with a clear recommendation for your school.",
  },
  {
    id: "gd-jobs",
    title: "Group discussion skills matter more than marks for first jobs.",
    classNumbers: [11, 12],
    stanceA: "Agree",
    stanceB: "Disagree",
    keywords: ["communication", "interview", "teamwork", "knowledge", "marks", "confidence"],
    prompt: "Speak as if you are in a campus GD. Keep a calm, professional tone.",
  },
];

export function debateTopicsFor(classNumber: number) {
  return DEBATE_TOPICS.filter((topic) => topic.classNumbers.includes(classNumber));
}
