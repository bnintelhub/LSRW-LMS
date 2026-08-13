import type { Skill } from "../types/crm";
import type { Profile } from "../types/student";

export const lessonCopy: Record<
  Profile,
  Record<Skill, { title: string; prompt: string; task: string; metric: string }>
> = {
  Foundational: {
    Listening: { title: "Listening Studio", prompt: "Clear adult AI voice playback with picture comprehension.", task: "Junior listening clip", metric: "engagement" },
    Speaking: { title: "AI Speaking Lab", prompt: "Listen target sentence, record, and get pronunciation scores.", task: "Repeat practice", metric: "pronunciation" },
    Reading: { title: "Reading & WPM", prompt: "Tap words for pronunciation and dictionary.", task: "Sight-word passage", metric: "sight words" },
    Writing: { title: "Writing AI Checker", prompt: "Copy and check with live grammar suggestions.", task: "Trace & copy", metric: "letter formation" },
  },
  Elementary: {
    Listening: { title: "Listening Studio", prompt: "School announcements with MCQ and dictation quiz.", task: "Announcement drill", metric: "detail capture" },
    Speaking: { title: "AI Speaking Lab", prompt: "Record classroom sentences for fluency scoring.", task: "Guided speaking", metric: "fluency" },
    Reading: { title: "Reading & WPM", prompt: "Timed reading with click-to-speak dictionary.", task: "Garden paragraph", metric: "comprehension" },
    Writing: { title: "Writing AI Checker", prompt: "Friendly letter with AI grammar alerts.", task: "Letter writing", metric: "grammar" },
  },
  "Exam-Track": {
    Listening: { title: "Listening Studio", prompt: "Board-pattern podcast with speed control and quiz.", task: "Climate podcast", metric: "accuracy under time" },
    Speaking: { title: "AI Speaking Lab", prompt: "Exam-style sentence drills with phonetic breakdown.", task: "JAM / fluency", metric: "confidence" },
    Reading: { title: "Reading & WPM", prompt: "Unseen passage, timer, and CEFR speed benchmark.", task: "Unseen drill", metric: "speed and accuracy" },
    Writing: { title: "Writing AI Checker", prompt: "Analytical paragraph with accept-fix suggestions.", task: "Analytical writing", metric: "structure" },
  },
  Advanced: {
    Listening: { title: "Listening Studio", prompt: "Professional lecture excerpt with comprehension quiz.", task: "Ethical AI talk", metric: "summarization" },
    Speaking: { title: "AI Speaking Lab", prompt: "Interview/GD sentences with live mic analysis.", task: "GD / interview", metric: "executive presence" },
    Reading: { title: "Reading & WPM", prompt: "Advanced passage, WPM timer, instant word pronunciation.", task: "Editorial reading", metric: "critical reasoning" },
    Writing: { title: "Writing AI Checker", prompt: "Persuasive essay with real-time grammar panel.", task: "Formal essay", metric: "professional writing" },
  },
};
