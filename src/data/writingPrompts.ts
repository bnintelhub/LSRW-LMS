import { profileForClass } from "./classBands";

export type WritingPrompt = {
  title: string;
  prompt: string;
  starter: string;
  target: string;
  words: number;
};

const BAND: Record<string, WritingPrompt> = {
  Foundational: {
    title: "Trace & Copy Checker",
    prompt: "Copy this sentence carefully: The sun is bright.",
    starter: "The sun is bright.",
    target: "Pre-A1",
    words: 20,
  },
  Elementary: {
    title: "Friendly Letter Builder",
    prompt: "Write a short letter to a friend about your favourite school activity.",
    starter: "Dear friend, I want to tell you about my favourite activity in school.",
    target: "A2",
    words: 80,
  },
  "Exam-Track": {
    title: "Analytical Paragraph",
    prompt: "Compare online learning and library reading in 120–150 words.",
    starter: "Online learning offers flexibility, but library reading builds deeper focus.",
    target: "B1+",
    words: 150,
  },
  Advanced: {
    title: "Structured Essay & AI Grammar Checker",
    prompt:
      "Write a persuasive essay examining how AI-driven digital language labs can bridge the urban-rural education divide across regional schools.",
    starter:
      "AI-driven language labs offers scalable practice for remote schools, but success lacks teacher mentoring and reliable connectivity.",
    target: "B2",
    words: 250,
  },
};

const BY_CLASS: Partial<Record<number, WritingPrompt>> = {
  5: {
    title: "Mini Presentation Script",
    prompt: "Write 60–80 words describing a school event you enjoyed. Use past tense.",
    starter: "Last week our class enjoyed a special event at school.",
    target: "A2 entry",
    words: 80,
  },
  6: {
    title: "Note-taking Paragraph",
    prompt: "Turn these notes into a paragraph: science fair / model of rainwater / prize for Class 6B.",
    starter: "Our science fair showed a model of rainwater harvesting.",
    target: "A2",
    words: 90,
  },
  8: {
    title: "Notice Writing",
    prompt: "Write a school notice (50–60 words) inviting students to a reading club on Friday.",
    starter: "NOTICE\nReading Club Meeting\n",
    target: "B1",
    words: 60,
  },
  10: {
    title: "Analytical Writing",
    prompt: "Write 120–150 words on why interviews need both confidence and preparation.",
    starter: "Interviews reward students who prepare examples, not those who only memorise slogans.",
    target: "B1+ / B2 entry",
    words: 150,
  },
  11: {
    title: "Argumentative Paragraph",
    prompt: "Argue for or against ranking students only by automated lab scores. Include one limitation.",
    starter: "Automated lab scores can track practice, but they should not be the only measure of a student.",
    target: "B2",
    words: 180,
  },
  12: {
    title: "SOP Draft",
    prompt: "Draft a 180–220 word statement of purpose opening: a classroom moment, a skill, and a future programme.",
    starter: "In Class 11 English lab I froze during a group discussion, then learnt to open with a definition.",
    target: "B2+",
    words: 200,
  },
};

export function getWritingPrompt(classNumber: number): WritingPrompt {
  return BY_CLASS[classNumber] ?? BAND[profileForClass(classNumber)];
}
