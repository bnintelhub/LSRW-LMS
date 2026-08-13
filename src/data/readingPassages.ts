import type { Profile } from "../types/student";
import { profileForClass } from "./classBands";

export type ReadingMcq = {
  q: string;
  options: string[];
  answer: string;
};

export type ReadingPassage = {
  id: string;
  title: string;
  cefr: string;
  wpmTarget: string;
  text: string;
  mcqs: ReadingMcq[];
  dictionary: Record<string, string>;
};

const BAND: Record<Profile, ReadingPassage> = {
  Foundational: {
    id: "read-found",
    title: "Sight Words & Picture Stories",
    cefr: "Pre-A1",
    wpmTarget: "40–70 WPM",
    text: "The sun is hot. The ball is red. The dog can run. I see a cat. Good morning teacher.",
    mcqs: [
      { q: "What colour is the ball?", options: ["Red", "Blue", "Green", "Black"], answer: "Red" },
      { q: "Who can run?", options: ["The dog", "The sun", "The ball", "The desk"], answer: "The dog" },
      { q: "Who do the children greet?", options: ["A visitor", "Teacher", "The cat only", "Nobody"], answer: "Teacher" },
    ],
    dictionary: { sun: "The bright star that gives Earth light and heat.", teacher: "A person who helps students learn." },
  },
  Elementary: {
    id: "read-elem",
    title: "The School Garden",
    cefr: "A2",
    wpmTarget: "90–120 WPM",
    text: "The school garden started with five small plants. Every student watered one plant and wrote a note about its growth. Soon the garden became a cheerful reading corner for the whole class. Birds visited in the morning, and the air smelled of wet soil after rain.",
    mcqs: [
      { q: "How many plants did the garden start with?", options: ["Two", "Five", "Twenty", "One hundred"], answer: "Five" },
      { q: "What did every student write?", options: ["A complaint", "A note about growth", "A shopping list", "A song"], answer: "A note about growth" },
      { q: "What did the garden become?", options: ["A parking lot", "A cheerful reading corner", "A canteen", "A sports field"], answer: "A cheerful reading corner" },
      { q: "When did birds visit?", options: ["At midnight", "In the morning", "During exams only", "Never"], answer: "In the morning" },
    ],
    dictionary: {
      garden: "A piece of land used to grow plants.",
      cheerful: "Happy and pleasant in mood.",
      soil: "The upper layer of earth in which plants grow.",
    },
  },
  "Exam-Track": {
    id: "read-exam",
    title: "Unseen Passage: Libraries and Focus",
    cefr: "B1+",
    wpmTarget: "120–150 WPM",
    text: "Technology helps students learn when it is used with discipline. Libraries still matter because they teach focus, research habits and careful reading. Board exams reward accuracy under timed conditions. A student who skims only headlines may miss the writer's tone, and tone often decides the correct inference in an unseen passage.",
    mcqs: [
      { q: "When does technology help students learn?", options: ["Always, without effort", "When used with discipline", "Only at night", "Never in school"], answer: "When used with discipline" },
      { q: "Why do libraries still matter?", options: ["They sell snacks", "They teach focus and research habits", "They replace teachers", "They are louder than classrooms"], answer: "They teach focus and research habits" },
      { q: "What do board exams reward?", options: ["Guesswork", "Accuracy under timed conditions", "Longest handwriting", "The most drawings"], answer: "Accuracy under timed conditions" },
      { q: "What may a student miss by skimming headlines?", options: ["The writer's tone", "The school bell", "The page number", "The index"], answer: "The writer's tone" },
    ],
    dictionary: {
      discipline: "Careful self-control and organised study habits.",
      libraries: "Places that store books and support focused research.",
      inference: "A conclusion reached from evidence in the text.",
      tone: "The writer's attitude toward the subject.",
    },
  },
  Advanced: {
    id: "read-adv",
    title: "Quantum Computing and Evidence",
    cefr: "B2",
    wpmTarget: "130–160 WPM",
    text: "Quantum computing leverages superposition and entanglement to solve complex mathematical problems faster than classical machines in some cases. Students must still analyse evidence, detect tone, and build a precise response. Hype is not the same as proof: a claim needs a method, a limitation, and a source before it belongs in an academic paragraph.",
    mcqs: [
      { q: "What two ideas are named as quantum features?", options: ["Gravity and friction", "Superposition and entanglement", "Melody and rhythm", "Paint and canvas"], answer: "Superposition and entanglement" },
      { q: "What must students still do?", options: ["Ignore evidence", "Analyse evidence and detect tone", "Copy slogans", "Avoid writing"], answer: "Analyse evidence and detect tone" },
      { q: "What is hype not the same as?", options: ["Proof", "A title", "A diagram", "A deadline"], answer: "Proof" },
      { q: "What does a claim need before it belongs in an academic paragraph?", options: ["Emojis", "A method, a limitation, and a source", "A celebrity quote only", "A longer font"], answer: "A method, a limitation, and a source" },
    ],
    dictionary: {
      quantum: "Related to physics at atomic scale; here used for advanced computing.",
      superposition: "A quantum state where a system can exist in multiple states at once.",
      entanglement: "A link between quantum particles that affects each other instantly.",
      evidence: "Facts or information that support a claim.",
      hype: "Exaggerated publicity that may not match the facts.",
    },
  },
};

const BY_CLASS: Partial<Record<number, ReadingPassage>> = {
  5: {
    id: "read-c5",
    title: "Children's News: The Broken Tap",
    cefr: "A2 entry",
    wpmTarget: "80–110 WPM",
    text: "A dripping tap in the corridor wasted a bucket of water every day. Class Five made a poster, spoke to the caretaker, and the tap was fixed by Friday. The class learnt that noticing a small problem and speaking politely can change a school habit.",
    mcqs: [
      { q: "What was wasting water?", options: ["A fountain", "A dripping tap", "The rain", "A river"], answer: "A dripping tap" },
      { q: "Who did the class speak to?", options: ["A film star", "The caretaker", "The bus driver", "A tourist"], answer: "The caretaker" },
      { q: "When was the tap fixed?", options: ["Never", "By Friday", "Next year", "During holidays only"], answer: "By Friday" },
      { q: "What did the class learn?", options: ["To ignore leaks", "That polite action can change a habit", "To waste more water", "To skip school"], answer: "That polite action can change a habit" },
    ],
    dictionary: {
      dripping: "Letting drops of liquid fall slowly.",
      caretaker: "A person who looks after a building.",
      politely: "In a respectful and kind way.",
    },
  },
  8: {
    id: "read-c8",
    title: "Literary Extract: The Notice",
    cefr: "B1",
    wpmTarget: "110–140 WPM",
    text: "The faded notice asked students to collect library cards before Friday. Mira read it twice and realised the date had passed. She explained the delay to the librarian and received a new card with a reminder to check the board every morning. The extract shows that careful reading of everyday texts still matters.",
    mcqs: [
      { q: "What did the notice ask students to collect?", options: ["Sports kits", "Library cards", "Fees", "Uniforms"], answer: "Library cards" },
      { q: "What had Mira realised?", options: ["The date had passed", "The library was closed forever", "She had two cards", "Friday was a holiday"], answer: "The date had passed" },
      { q: "What reminder came with the new card?", options: ["Never read notices", "Check the board every morning", "Run in the corridor", "Skip English"], answer: "Check the board every morning" },
      { q: "What does the extract emphasise?", options: ["Only novels matter", "Careful reading of everyday texts", "Ignoring dates", "Memorising poems only"], answer: "Careful reading of everyday texts" },
    ],
    dictionary: {
      faded: "Less bright or clear because of time.",
      extract: "A short piece taken from a longer text.",
      librarian: "A person who manages a library.",
    },
  },
  11: {
    id: "read-c11",
    title: "Editorial: Claims Need Limits",
    cefr: "B2",
    wpmTarget: "130–160 WPM",
    text: "An editorial is not a slogan. A responsible claim names a problem, cites one verifiable fact, and admits a limit. For example, digital labs expand practice time, yet they cannot replace a teacher who notices when a student is silent. Readers should ask who benefits, who is left out, and what evidence would change the writer's mind.",
    mcqs: [
      { q: "What is an editorial not?", options: ["An argument", "A slogan", "A newspaper piece", "A public text"], answer: "A slogan" },
      { q: "What should a responsible claim admit?", options: ["A limit", "A secret password", "A joke", "A ranking of students"], answer: "A limit" },
      { q: "What can digital labs not replace?", options: ["Practice time", "A teacher who notices a silent student", "Headphones", "A timetable"], answer: "A teacher who notices a silent student" },
      { q: "Which question should readers ask?", options: ["Who benefits and what evidence would change the writer's mind?", "What is the font?", "Who shouted loudest?", "When is lunch?"], answer: "Who benefits and what evidence would change the writer's mind?" },
    ],
    dictionary: {
      editorial: "An article that argues a newspaper's or writer's opinion.",
      verifiable: "Able to be checked against facts.",
      cites: "Mentions a source or fact in support of a claim.",
    },
  },
};

export function getReadingPassage(classNumber: number): ReadingPassage {
  return BY_CLASS[classNumber] ?? BAND[profileForClass(classNumber)];
}
