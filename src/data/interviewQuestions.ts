export type InterviewQuestion = {
  id: string;
  prompt: string;
  hint: string;
  keywords: string[];
};

export const INTERVIEW_DECK: InterviewQuestion[] = [
  {
    id: "intro",
    prompt: "Tell me about yourself in one minute.",
    hint: "Name, class, one strength, one interest.",
    keywords: ["student", "class", "school", "interest", "strength"],
  },
  {
    id: "why-english",
    prompt: "Why is English important for your future plans?",
    hint: "College, career, or clear communication.",
    keywords: ["college", "career", "communicate", "confidence", "opportunity"],
  },
  {
    id: "challenge",
    prompt: "Describe a school challenge and how you handled it.",
    hint: "Situation, action, result.",
    keywords: ["problem", "tried", "help", "learn", "result"],
  },
  {
    id: "team",
    prompt: "How do you work in a group discussion or team project?",
    hint: "Listen first, then add a point.",
    keywords: ["listen", "team", "idea", "respect", "share"],
  },
  {
    id: "weak-skill",
    prompt: "Which LSRW skill do you want to improve, and how?",
    hint: "Pick one skill and one daily habit.",
    keywords: ["listening", "speaking", "reading", "writing", "practice"],
  },
  {
    id: "five-years",
    prompt: "Where do you see yourself after school?",
    hint: "Course, city, or kind of work — keep it honest.",
    keywords: ["college", "study", "work", "goal", "learn"],
  },
];
