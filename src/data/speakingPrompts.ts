import { profileForClass } from "./classBands";

const BAND: Record<string, string[]> = {
  Foundational: [
    "This is a ball.",
    "I see a red sun.",
    "The dog is happy.",
    "Good morning teacher.",
    "I like my school.",
  ],
  Elementary: [
    "The science club meets on Friday after lunch.",
    "Our classroom is bright and friendly.",
    "I introduce myself clearly and politely.",
    "Reading every day improves vocabulary.",
    "We write short paragraphs with correct punctuation.",
  ],
  "Exam-Track": [
    "Technology helps students learn when used with discipline.",
    "Water conservation needs planning and citizen participation.",
    "Effective communication requires active listening and clear speech.",
    "Board exam success depends on accuracy under timed conditions.",
    "Unseen passages test both vocabulary and inference skills.",
  ],
  Advanced: [
    "Artificial intelligence is transforming digital education across Indian language labs.",
    "Internships should build communication skills and professional confidence.",
    "Ethical AI in education requires transparency, consent and measurable outcomes.",
    "Group discussion practice prepares students for competitive interviews.",
    "Formal reports must present evidence before recommendations.",
  ],
};

const BY_CLASS: Partial<Record<number, string[]>> = {
  5: [
    "I can describe my favourite school activity in clear sentences.",
    "Please close the tap so we do not waste water.",
    "Our class planted a sapling near the playground.",
    "I listen first, then I speak slowly.",
    "Good morning, I am ready for today's presentation.",
  ],
  8: [
    "Please read the notice twice before you ask a question.",
    "Academic listening means catching keywords, not every filler word.",
    "I would like to add a point about library cards.",
    "A polite explanation can still solve a missed deadline.",
    "Everyday texts deserve the same care as a poem.",
  ],
  11: [
    "A claim without evidence is only an opinion.",
    "May I add a point before we close this discussion?",
    "Digital labs expand practice, yet teachers still notice silent students.",
    "I will concede one limitation and then return to my position.",
    "Public speaking is a civic skill, not a talent contest.",
  ],
};

export function getSpeakingSentences(classNumber: number): string[] {
  return BY_CLASS[classNumber] ?? BAND[profileForClass(classNumber)];
}
