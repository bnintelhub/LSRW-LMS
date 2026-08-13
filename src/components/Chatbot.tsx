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
        ? "Hello! I'm your LSRW Assistant. Ask me about today's word, your labs, or how to use the platform."
        : ctx.role === "teacher"
          ? "Hello, Teacher! I can help with session controls, daily tasks, and student monitoring."
          : "Hello! I'm the LSRW Language Lab assistant. How can I help you today?";
    return greeting;
  }

  if (q.includes("lsrw") || q.includes("what is lsrw")) {
    return [
      "📖 **LSRW** stands for:",
      "• **L**istening – hear and understand spoken English",
      "• **S**peaking – practice pronunciation and fluency",
      "• **R**eading – improve comprehension and speed (WPM)",
      "• **W**riting – learn grammar and structured writing",
      "",
      "This lab covers all four skills with AI-powered exercises!",
    ].join("\n");
  }

  if (q.includes("login") || q.includes("session") || q.includes("class start")) {
    if (ctx.role === "student" && ctx.studentClass) {
      if (ctx.isSessionActive) {
        return `✅ Your class (Class ${ctx.studentClass.classNumber}-${ctx.studentClass.section}) session is active. You can access all labs and tasks.`;
      }
      return `⏳ Your class has not been started by your teacher yet. Please wait until your teacher starts the lab session for Class ${ctx.studentClass.classNumber}-${ctx.studentClass.section}.`;
    }
    if (ctx.role === "teacher") {
      return "Go to **Teacher Dashboard → Start Lab Session** to begin your class. Once started, students in that class can log in.";
    }
    return "Students can log in only after their teacher starts the lab session for their class and section.";
  }

  if (q.includes("task") || q.includes("homework") || q.includes("assignment")) {
    return ctx.role === "student"
      ? "Open **Today's Tasks** from the sidebar to see your AI-generated daily tasks. Complete all four LSRW skills to earn XP!"
      : "Teachers can generate and publish daily task packs from the **Daily Task Desk** tab.";
  }

  if (q.includes("speaking") || q.includes("mic")) {
    return "🎤 **AI Speaking Lab**: Click 'AI Speaking Lab' in the sidebar. Read the prompt aloud into your microphone. The AI analyzes your pronunciation and fluency.";
  }

  if (q.includes("listening")) {
    return "🎧 **Listening Studio**: Play the audio passage, then answer comprehension questions. Great for exam-style listening practice!";
  }

  if (q.includes("reading") || q.includes("wpm")) {
    return "📚 **Reading & WPM Lab**: Read the passage, use the timer, then tap Finish & Save Score to record WPM and XP.";
  }

  if (q.includes("writing")) {
    return "✍️ **Writing AI Checker**: Write your paragraph in the text box. The AI checks grammar, structure, and vocabulary usage.";
  }

  if (q.includes("xp") || q.includes("streak") || q.includes("score")) {
    return "Earn XP by completing daily tasks and LSRW labs. Your streak counts consecutive days of practice. Check your dashboard for average scores and skill radar!";
  }

  if (q.includes("help") || q.includes("madad")) {
    return [
      "I can help with:",
      "• **Word of the day** – today's vocabulary",
      "• **LSRW skills** – Listening, Speaking, Reading, Writing",
      "• **Login & sessions** – when you can access the lab",
      "• **Leaderboard & badges** – class rank and achievements",
      "",
      "Try asking: *'What is today's word?'* or *'How do I use Speaking Lab?'*",
    ].join("\n");
  }

  if (q.includes("thank")) {
    return "You're welcome! Keep practicing your English every day. 📚✨";
  }

  return [
    "I'm not sure about that, but I can help with:",
    "• Word of the day",
    "• LSRW lab guides",
    "• Login & class sessions",
    "• Daily tasks & XP",
    "",
    "Try one of the quick buttons below!",
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
                  <p className="text-xs text-orange-100">Ask me anything!</p>
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
