import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import {
  formatWordMessage,
  getWordForDate,
  type WordEntry,
} from "../data/wordOfTheDay";
import { todayISO } from "../lib/aiTaskGenerator";

type Role = "admin" | "teacher" | "student" | "guest";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
};

type ChatbotProps = {
  role?: Role;
  studentClass?: { classNumber: number; section: "A" | "B" };
  isSessionActive?: boolean;
};

const QUICK_PROMPTS = [
  "Word of the day",
  "What is LSRW?",
  "How to use the lab?",
  "Help",
];

function getBotReply(
  input: string,
  ctx: { role: Role; word: WordEntry; date: string; isSessionActive?: boolean; studentClass?: { classNumber: number; section: "A" | "B" } },
): string {
  const q = input.toLowerCase().trim();

  if (q.includes("word of the day") || q.includes("wotd") || q.includes("today's word") || q.includes("aaj ka shabd")) {
    return formatWordMessage(ctx.word, ctx.date);
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("namaste") || q.includes("hey")) {
    const greeting =
      ctx.role === "student"
        ? "Hello! I can explain Word of the Day, today's tasks, labs, badges, and login."
        : ctx.role === "teacher"
          ? "Hello, Teacher. I can help with starting a lab session, daily tasks, attendance, and the submissions inbox."
          : "Hello. I can explain login, onboarding, teacher allotments, and parent report links.";
    return greeting;
  }

  if (q.includes("lsrw") || q.includes("what is lsrw")) {
    return [
      "LSRW stands for Listening, Speaking, Reading, and Writing.",
      "This demo covers all four skills with class-adaptive games (1–4) and labs (5–12).",
    ].join("\n");
  }

  if (q.includes("login") || q.includes("session") || q.includes("class start")) {
    if (ctx.role === "student" && ctx.studentClass) {
      if (ctx.isSessionActive) {
        return `Your class (Class ${ctx.studentClass.classNumber}-${ctx.studentClass.section}) session is active. You can open labs and tasks.`;
      }
      return `Wait until your teacher starts the lab session for Class ${ctx.studentClass.classNumber}-${ctx.studentClass.section}.`;
    }
    if (ctx.role === "teacher") {
      return "Teacher Dashboard → Start Lab Session. Students in that class-section can log in after you start.";
    }
    return "Students log in only after their teacher starts the lab session for their class and section.";
  }

  if (q.includes("task") || q.includes("homework") || q.includes("assignment")) {
    return ctx.role === "student"
      ? "Open Today's Tasks in the sidebar. Your teacher must publish a pack first."
      : "Daily Task Desk: generate a pack (template, not a live LLM), edit, then publish.";
  }

  if (q.includes("speaking") || q.includes("mic")) {
    return "Speaking Lab uses the browser microphone and a word-match score. It is not a cloud pronunciation API. Chrome or Edge works best.";
  }

  if (q.includes("listening")) {
    return "Listening Studio plays browser text-to-speech (not MP3 files), then an MCQ or dictation quiz.";
  }

  if (q.includes("reading") || q.includes("wpm")) {
    return "Reading lab: timed passage, then comprehension MCQ. Combined WPM/quiz score saves to your dashboard.";
  }

  if (q.includes("writing")) {
    return "Writing checker uses simple grammar rules, then you can submit the piece to the teacher inbox.";
  }

  if (q.includes("phonics") || q.includes("story") || q.includes("spelling")) {
    return "Class 1–2: Phonics. Class 1–4: Story mode. Class 3–6: weekly Spelling bee. These sit in the student sidebar for those classes.";
  }

  if (q.includes("debate") || q.includes("interview") || q.includes("gd")) {
    return "Class 9–12: Debate/GD with a 2-minute timer. Class 11–12: Mock interview deck. Both use the browser mic.";
  }

  if (q.includes("parent") || q.includes("report link")) {
    return "Teachers and School Admin can copy a parent link. It is a demo hash token in this browser — not a signed login.";
  }

  if (q.includes("xp") || q.includes("streak") || q.includes("score") || q.includes("badge") || q.includes("leaderboard")) {
    return "Completing a lab updates score, XP, and streak on this device. Leaderboard is class-section by XP. Badges unlock from those scores.";
  }

  if (q.includes("help") || q.includes("madad")) {
    return [
      "I only answer features that exist in this demo:",
      "• Word of the Day",
      "• Login after teacher starts session",
      "• Today's tasks, labs/games, XP, badges, leaderboard",
      "• Phonics / story / spelling / debate / interview (by class)",
      "• Teacher inbox, attendance, live grid (same-browser heartbeat)",
      "• Parent report link (demo token)",
    ].join("\n");
  }

  if (q.includes("thank")) {
    return "You're welcome. Practise a little every day.";
  }

  return [
    "I don't have that answer. Try:",
    "• Word of the day",
    "• How do I log in?",
    "• How do Speaking / Listening labs work?",
    "• Parent report link",
  ].join("\n");
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function Chatbot({ role = "guest", studentClass, isSessionActive }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const date = todayISO();
  const word = getWordForDate(date);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          text: getBotReply("hello", { role, word, date, isSessionActive, studentClass }),
        },
      ]);
    }
  }, [open, messages.length, role, word, date, isSessionActive, studentClass]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      role: "bot",
      text: getBotReply(trimmed, { role, word, date, isSessionActive, studentClass }),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  useEffect(() => {
    const onOpen = (event: Event) => {
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      setOpen(true);
      if (prompt) {
        window.setTimeout(() => send(prompt), 120);
      }
    };
    window.addEventListener("lsrw-open-chatbot", onOpen);
    return () => window.removeEventListener("lsrw-open-chatbot", onOpen);
  }, [role, word, date, isSessionActive, studentClass]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="chatbot-panel"
          >
            <div className="chatbot-header">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                  <Bot size={22} />
                </div>
                <div>
                  <p className="font-black">LSRW Assistant</p>
                  <p className="text-xs text-orange-100">Demo helper · real features only</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/20 p-2 hover:bg-white/30"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chatbot-bubble ${msg.role === "user" ? "chatbot-bubble-user" : "chatbot-bubble-bot"}`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {renderMarkdown(msg.text)}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="chatbot-quick">
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => send(prompt)} className="chatbot-quick-btn">
                  {prompt}
                </button>
              ))}
            </div>

            <div className="chatbot-input-row">
              <input
                className="chatbot-input"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
              />
              <button onClick={() => send(input)} className="chatbot-send" aria-label="Send">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="chatbot-fab"
        aria-label="Open LSRW Assistant"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </>
  );
}
