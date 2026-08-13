import type { Profile } from "../types/student";
import { estimateDurationSec, profileForClass } from "./classBands";

export type ListeningMcq = {
  q: string;
  options: string[];
  answer: string;
};

export type ListeningClip = {
  id: string;
  title: string;
  fileLabel: string;
  durationSec: number;
  band: Profile;
  classNumbers: number[];
  transcript: string;
  mcqs: ListeningMcq[];
  blank: { prompt: string; answer: string };
};

function clip(
  partial: Omit<ListeningClip, "durationSec"> & { durationSec?: number },
): ListeningClip {
  return {
    ...partial,
    durationSec: partial.durationSec ?? estimateDurationSec(partial.transcript),
  };
}

const ELEMENTARY: ListeningClip[] = [
  clip({
    id: "el-garden",
    title: "School Garden Announcement",
    fileLabel: "School_Garden_A2.mp3",
    band: "Elementary",
    classNumbers: [5, 6, 7],
    transcript:
      "Good morning students. The science club will meet on Friday after lunch in the school library. Please bring a notebook and a pencil. Parents may collect progress reports from the office between three and four o'clock.",
    mcqs: [
      {
        q: "Where does the science club meet?",
        options: ["Playground", "School library", "Canteen", "Computer lab"],
        answer: "School library",
      },
      {
        q: "When is the meeting?",
        options: ["Monday morning", "Friday after lunch", "Sunday evening", "Saturday before school"],
        answer: "Friday after lunch",
      },
      {
        q: "What should students bring?",
        options: ["A cricket bat", "A notebook and a pencil", "Lunch boxes only", "Paint and brushes"],
        answer: "A notebook and a pencil",
      },
    ],
    blank: { prompt: "Type the missing word: Bring your notebook and a ______.", answer: "pencil" },
  }),
  clip({
    id: "el-weather",
    title: "Morning Weather Brief",
    fileLabel: "Weather_Brief_A2.mp3",
    band: "Elementary",
    classNumbers: [5, 6, 7],
    transcript:
      "Today will be cloudy in the morning and sunny after noon. Carry a water bottle to school. The football match is postponed because the field is wet. Indoor games will be held in the hall.",
    mcqs: [
      {
        q: "What will the weather be after noon?",
        options: ["Snowy", "Sunny", "Stormy", "Foggy"],
        answer: "Sunny",
      },
      {
        q: "Why is the football match postponed?",
        options: ["No referee", "The field is wet", "Too many students", "A holiday"],
        answer: "The field is wet",
      },
      {
        q: "Where will indoor games be held?",
        options: ["In the hall", "On the roof", "At the bus stop", "In the canteen"],
        answer: "In the hall",
      },
    ],
    blank: { prompt: "Type the missing word: Carry a water ______ to school.", answer: "bottle" },
  }),
  clip({
    id: "el-library",
    title: "Library Rules Talk",
    fileLabel: "Library_Rules_A2.mp3",
    band: "Elementary",
    classNumbers: [5, 6, 7],
    transcript:
      "Please keep silent in the library. Return books within seven days. You may borrow two storybooks at a time. Eating is not allowed near the shelves. Ask the librarian if you need a dictionary.",
    mcqs: [
      {
        q: "How many storybooks can a student borrow?",
        options: ["One", "Two", "Five", "Ten"],
        answer: "Two",
      },
      {
        q: "When should books be returned?",
        options: ["The same day", "Within seven days", "After a month", "Never"],
        answer: "Within seven days",
      },
      {
        q: "Who should students ask for a dictionary?",
        options: ["The principal", "The librarian", "The sports coach", "A visitor"],
        answer: "The librarian",
      },
    ],
    blank: { prompt: "Type the missing word: Keep ______ in the library.", answer: "silent" },
  }),
  clip({
    id: "el-assembly",
    title: "Assembly Message",
    fileLabel: "Assembly_Message_A2.mp3",
    band: "Elementary",
    classNumbers: [5, 6, 7],
    transcript:
      "Tomorrow is Environment Day. Each class will plant one sapling near the playground. Wear your house T-shirt. After assembly, Class Five will present a short play about saving water.",
    mcqs: [
      {
        q: "What special day is tomorrow?",
        options: ["Sports Day", "Environment Day", "Teachers' Day", "Independence Day"],
        answer: "Environment Day",
      },
      {
        q: "What will each class plant?",
        options: ["A sapling", "A flag", "A poster", "A flower pot only"],
        answer: "A sapling",
      },
      {
        q: "Which class will present a play?",
        options: ["Class Eight", "Class Five", "Class Twelve", "Class One"],
        answer: "Class Five",
      },
    ],
    blank: { prompt: "Type the missing word: Wear your house ______.", answer: "T-shirt" },
  }),
];

const EXAM: ListeningClip[] = [
  clip({
    id: "ex-climate",
    title: "Climate Summit Podcast",
    fileLabel: "Climate_Summit_B1.mp3",
    band: "Exam-Track",
    classNumbers: [8, 9, 10],
    transcript:
      "Welcome to the Global Climate Summit podcast. Today we discuss offshore solar energy, wind power, and achieving net-zero carbon emissions by 2045. Experts argue that schools can reduce waste by using digital worksheets and rainwater harvesting.",
    mcqs: [
      {
        q: "Which energy sources are discussed?",
        options: ["Coal and oil", "Offshore solar and wind", "Nuclear only", "Hydro only"],
        answer: "Offshore solar and wind",
      },
      {
        q: "What is the net-zero target year mentioned?",
        options: ["2015", "2030", "2045", "2100"],
        answer: "2045",
      },
      {
        q: "How can schools reduce waste, according to the clip?",
        options: ["Longer exams", "Digital worksheets and rainwater harvesting", "More plastic bottles", "Cancelling science"],
        answer: "Digital worksheets and rainwater harvesting",
      },
    ],
    blank: { prompt: "Type the missing word: Achieving net-zero carbon ______ by 2045.", answer: "emissions" },
  }),
  clip({
    id: "ex-exam",
    title: "Board Exam Briefing",
    fileLabel: "Board_Briefing_B1.mp3",
    band: "Exam-Track",
    classNumbers: [8, 9, 10],
    transcript:
      "For the English paper, read the unseen passage twice before answering. Spend no more than twelve minutes on the notice-writing question. Underline keywords in the question paper. Submit your answer booklet when the bell rings. Late work will not be accepted.",
    mcqs: [
      {
        q: "How many times should students read the unseen passage?",
        options: ["Once", "Twice", "Five times", "Not at all"],
        answer: "Twice",
      },
      {
        q: "What is the time limit for notice writing?",
        options: ["Two minutes", "Twelve minutes", "One hour", "The whole paper"],
        answer: "Twelve minutes",
      },
      {
        q: "When should the answer booklet be submitted?",
        options: ["After lunch", "When the bell rings", "The next day", "Whenever students finish chatting"],
        answer: "When the bell rings",
      },
    ],
    blank: { prompt: "Type the missing word: Underline ______ in the question paper.", answer: "keywords" },
  }),
  clip({
    id: "ex-news",
    title: "Student News Bulletin",
    fileLabel: "News_Bulletin_B1.mp3",
    band: "Exam-Track",
    classNumbers: [8, 9, 10],
    transcript:
      "The city library will host a debate on plastic-free campuses next Saturday at ten in the morning. Teams of three speakers may register by Thursday. The winning team receives book vouchers. Listeners are welcome, but phones must stay on silent.",
    mcqs: [
      {
        q: "What is the debate topic?",
        options: ["Sports uniforms", "Plastic-free campuses", "School fees", "Video games"],
        answer: "Plastic-free campuses",
      },
      {
        q: "When is the debate?",
        options: ["Next Saturday at 10 a.m.", "Tonight", "Sunday at midnight", "During exams only"],
        answer: "Next Saturday at 10 a.m.",
      },
      {
        q: "What must phones stay on?",
        options: ["Loudspeaker", "Silent", "Video mode", "Flash"],
        answer: "Silent",
      },
    ],
    blank: { prompt: "Type the missing word: Teams of three speakers may register by ______.", answer: "Thursday" },
  }),
  clip({
    id: "ex-interview",
    title: "Career Talk: Interviews",
    fileLabel: "Interview_Talk_B1.mp3",
    band: "Exam-Track",
    classNumbers: [8, 9, 10],
    transcript:
      "In a school interview, greet the panel, sit only when invited, and keep answers specific. Give one example from class projects rather than speaking in general. Thank the interviewers at the end. Confidence comes from practice, not from memorising long speeches.",
    mcqs: [
      {
        q: "When should a student sit down?",
        options: ["Immediately", "Only when invited", "Never", "After shouting hello"],
        answer: "Only when invited",
      },
      {
        q: "What kind of answers are recommended?",
        options: ["Vague slogans", "Specific examples from class projects", "Jokes only", "One-word replies"],
        answer: "Specific examples from class projects",
      },
      {
        q: "Where does confidence come from?",
        options: ["Luck", "Practice", "Expensive clothes", "Memorising long speeches"],
        answer: "Practice",
      },
    ],
    blank: { prompt: "Type the missing word: Thank the ______ at the end.", answer: "interviewers" },
  }),
];

const ADVANCED: ListeningClip[] = [
  clip({
    id: "ad-ai",
    title: "Ethical AI Lecture",
    fileLabel: "Ethical_AI_B2.mp3",
    band: "Advanced",
    classNumbers: [11, 12],
    transcript:
      "Ethical artificial intelligence in education requires transparency, consent and measurable learning outcomes. Schools must protect student data while using adaptive tools responsibly. Bias in training data can unfairly rank learners, so teachers should review automated scores before they affect report cards.",
    mcqs: [
      {
        q: "What must schools protect while using adaptive tools?",
        options: ["Student data", "Only textbooks", "Furniture", "Cafeteria menus"],
        answer: "Student data",
      },
      {
        q: "Why can training data be a problem?",
        options: ["It is always perfect", "Bias can unfairly rank learners", "It is written in pencil", "It replaces sports"],
        answer: "Bias can unfairly rank learners",
      },
      {
        q: "What should teachers do before automated scores affect report cards?",
        options: ["Ignore them", "Review them", "Delete the class", "Publish them on social media"],
        answer: "Review them",
      },
    ],
    blank: { prompt: "Type the missing word: Ethical AI requires transparency, consent and measurable ______ outcomes.", answer: "learning" },
  }),
  clip({
    id: "ad-gd",
    title: "Group Discussion Sample",
    fileLabel: "GD_Sample_B2.mp3",
    band: "Advanced",
    classNumbers: [11, 12],
    transcript:
      "A strong group discussion opens with a definition, then one argument with evidence, then a counterpoint. Interrupt politely by saying 'May I add a point?' rather than raising your voice. Summarise the group's common ground in the last thirty seconds.",
    mcqs: [
      {
        q: "How should a strong GD open?",
        options: ["With a joke only", "With a definition", "With silence", "With a personal attack"],
        answer: "With a definition",
      },
      {
        q: "What polite phrase is suggested for interrupting?",
        options: ["Be quiet", "May I add a point?", "You are wrong", "Next topic now"],
        answer: "May I add a point?",
      },
      {
        q: "What should happen in the last thirty seconds?",
        options: ["A new argument", "A summary of common ground", "A phone call", "Leaving the room"],
        answer: "A summary of common ground",
      },
    ],
    blank: { prompt: "Type the missing word: Then one argument with ______, then a counterpoint.", answer: "evidence" },
  }),
  clip({
    id: "ad-sop",
    title: "SOP Writing Podcast",
    fileLabel: "SOP_Podcast_B2.mp3",
    band: "Advanced",
    classNumbers: [11, 12],
    transcript:
      "A statement of purpose should show trajectory, not a list of prizes. Begin with a specific classroom moment, connect it to a skill you built, then explain why the next programme fits. Avoid clichés such as 'since childhood I have dreamed'. End with a concrete contribution you hope to make.",
    mcqs: [
      {
        q: "What should an SOP show?",
        options: ["A list of prizes only", "Trajectory", "Family income", "Favourite films"],
        answer: "Trajectory",
      },
      {
        q: "How should it begin?",
        options: ["With a specific classroom moment", "With the school logo", "With a quote from a movie", "With exam ranks only"],
        answer: "With a specific classroom moment",
      },
      {
        q: "Which cliché should students avoid?",
        options: ["A concrete contribution", "Since childhood I have dreamed", "A skill you built", "Why the programme fits"],
        answer: "Since childhood I have dreamed",
      },
    ],
    blank: { prompt: "Type the missing word: End with a concrete ______ you hope to make.", answer: "contribution" },
  }),
  clip({
    id: "ad-news",
    title: "Editorial Audio: Public Speaking",
    fileLabel: "Public_Speaking_B2.mp3",
    band: "Advanced",
    classNumbers: [11, 12],
    transcript:
      "Public speaking is a civic skill, not a talent contest. Slow your pace, pause after a key number, and look at three points in the room. If you lose a word, rephrase instead of apologising twice. Audiences remember structure more than decoration.",
    mcqs: [
      {
        q: "How is public speaking described?",
        options: ["A talent contest", "A civic skill", "A singing exam", "A memory test only"],
        answer: "A civic skill",
      },
      {
        q: "What should you do after a key number?",
        options: ["Speak faster", "Pause", "Sit down", "Change the topic"],
        answer: "Pause",
      },
      {
        q: "What do audiences remember more?",
        options: ["Decoration", "Structure", "Font size", "Background music"],
        answer: "Structure",
      },
    ],
    blank: { prompt: "Type the missing word: If you lose a word, ______ instead of apologising twice.", answer: "rephrase" },
  }),
];

const CLASS_EXTRA: Partial<Record<number, ListeningClip[]>> = {
  5: [
    clip({
      id: "c5-news",
      title: "Children's News: Saving Water",
      fileLabel: "Class5_Water_News.mp3",
      band: "Elementary",
      classNumbers: [5],
      transcript:
        "Here is today's children's news. A town repaired leaking pipes and saved enough water to fill two school tanks. Students can help by closing taps tightly and reporting drips to a teacher. Small habits add up when a whole class joins in.",
      mcqs: [
        {
          q: "What did the town repair?",
          options: ["Playground slides", "Leaking pipes", "School buses", "Computers"],
          answer: "Leaking pipes",
        },
        {
          q: "How can students help?",
          options: ["Leave taps open", "Close taps tightly and report drips", "Waste more water", "Ignore leaks"],
          answer: "Close taps tightly and report drips",
        },
        {
          q: "When do small habits add up?",
          options: ["Never", "When a whole class joins in", "Only in winter", "Only for teachers"],
          answer: "When a whole class joins in",
        },
      ],
      blank: { prompt: "Type the missing word: Report drips to a ______.", answer: "teacher" },
    }),
  ],
  8: [
    clip({
      id: "c8-literature",
      title: "Literary Extract: The Notice Board",
      fileLabel: "Class8_Notice_Extract.mp3",
      band: "Exam-Track",
      classNumbers: [8],
      transcript:
        "The faded notice on the corridor wall asked students to collect their library cards before Friday. Mira read it twice, then realised the date had already passed. She walked to the librarian, explained politely, and received a new card with a reminder to check notices every morning.",
      mcqs: [
        {
          q: "What did the notice ask students to collect?",
          options: ["Sports kits", "Library cards", "Report cards", "Uniforms"],
          answer: "Library cards",
        },
        {
          q: "What had already passed?",
          options: ["The date", "The school year", "Lunch break", "The exam"],
          answer: "The date",
        },
        {
          q: "How did Mira speak to the librarian?",
          options: ["Rudely", "Politely", "Silently", "In a song"],
          answer: "Politely",
        },
      ],
      blank: { prompt: "Type the missing word: Check notices every ______.", answer: "morning" },
    }),
  ],
  11: [
    clip({
      id: "c11-editorial",
      title: "Editorial: Argument and Evidence",
      fileLabel: "Class11_Editorial.mp3",
      band: "Advanced",
      classNumbers: [11],
      transcript:
        "An argumentative paragraph should open with a claim, support it with a statistic or a case, and concede one limitation. Readers trust writers who show both sides without abandoning a position. End with a sentence that answers 'so what' for the community, not only for the writer.",
      mcqs: [
        {
          q: "How should the paragraph open?",
          options: ["With a claim", "With a joke", "With a bibliography", "With an apology"],
          answer: "With a claim",
        },
        {
          q: "What makes readers trust a writer?",
          options: ["Showing both sides without abandoning a position", "Using only slogans", "Hiding limitations", "Writing in all caps"],
          answer: "Showing both sides without abandoning a position",
        },
        {
          q: "What question should the ending answer?",
          options: ["Who is famous?", "So what, for the community?", "What is the lunch menu?", "How long is the essay?"],
          answer: "So what, for the community?",
        },
      ],
      blank: { prompt: "Type the missing word: Support it with a statistic or a ______.", answer: "case" },
    }),
  ],
};

const BY_BAND: Record<Profile, ListeningClip[]> = {
  Foundational: ELEMENTARY,
  Elementary: ELEMENTARY,
  "Exam-Track": EXAM,
  Advanced: ADVANCED,
};

export function getListeningClips(classNumber: number): ListeningClip[] {
  const extras = CLASS_EXTRA[classNumber] ?? [];
  const band = BY_BAND[profileForClass(classNumber)];
  const merged = [...extras, ...band.filter((item) => !extras.some((extra) => extra.id === item.id))];
  return merged.slice(0, 4);
}

export function formatClipDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
