import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Mic, Volume2 } from "lucide-react";
import { playSoundEffect, speakText, stopSpeech } from "../../../lib/speech";
import { useSpeechRecognition } from "../../../hooks/useSpeechRecognition";
import { evaluateSpeechAccuracy } from "../../../lib/speech";

type Props = { classNumber: number };

function celebrate() {
  playSoundEffect("chime");
  confetti({
    particleCount: 70,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#f97316", "#fb923c", "#fbbf24", "#34d399"],
  });
}

function GameShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 rounded-[1.75rem] border-4 border-orange-200 bg-white p-5 shadow-sm md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 p-5 text-slate-900">
        <p className="text-xs font-black uppercase tracking-wide text-orange-950/70">Game Lab · Classes 1–4</p>
        <h2 className="mt-1 text-2xl font-black md:text-3xl">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-orange-950/80">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

const LISTEN_SETS: Record<number, { prompt: string; answer: string; options: { label: string; emoji: string }[] }> = {
  1: {
    prompt: "This is a red ball.",
    answer: "Ball",
    options: [
      { label: "Ball", emoji: "⚽" },
      { label: "Elephant", emoji: "🐘" },
      { label: "Sun", emoji: "🌞" },
      { label: "Dog", emoji: "🐶" },
    ],
  },
  2: {
    prompt: "The cat is on the mat.",
    answer: "Cat",
    options: [
      { label: "Cat", emoji: "🐱" },
      { label: "Bus", emoji: "🚌" },
      { label: "Tree", emoji: "🌳" },
      { label: "Fish", emoji: "🐟" },
    ],
  },
  3: {
    prompt: "I brush my teeth every morning.",
    answer: "Brush",
    options: [
      { label: "Brush", emoji: "🪥" },
      { label: "Book", emoji: "📖" },
      { label: "Ball", emoji: "⚽" },
      { label: "Bike", emoji: "🚲" },
    ],
  },
  4: {
    prompt: "The science club meets on Friday after lunch.",
    answer: "Friday",
    options: [
      { label: "Friday", emoji: "📅" },
      { label: "Monday", emoji: "🗓" },
      { label: "Sunday", emoji: "☀️" },
      { label: "Holiday", emoji: "🎉" },
    ],
  },
};

export function ListeningGame({ classNumber }: Props) {
  const set = LISTEN_SETS[classNumber] ?? LISTEN_SETS[1];
  const [choice, setChoice] = useState("");
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState("Tap speaker, then pop the correct bubble.");

  const play = () => {
    stopSpeech();
    playSoundEffect("click");
    setStatus("Playing clear AI voice...");
    speakText(set.prompt, {
      rate: 0.9,
      onEnd: () => setStatus("Now pop the matching bubble!"),
    });
  };

  const pick = (label: string) => {
    setChoice(label);
    if (label === set.answer) {
      setDone(true);
      celebrate();
      setStatus("Correct! Great listening.");
    } else {
      playSoundEffect("click");
      setStatus("Try again — listen once more.");
    }
  };

  return (
    <GameShell title="Pop the Sound Bubble" subtitle="Listen carefully and tap the matching picture.">
      <div className="flex items-center gap-4 rounded-3xl bg-orange-50 p-4">
        <button
          onClick={play}
          className="grid h-16 w-16 place-items-center rounded-full bg-orange-500 text-white shadow-lg"
        >
          <Volume2 className="h-7 w-7" />
        </button>
        <div>
          <p className="font-black">Clear AI voice instruction</p>
          <p className="text-sm font-semibold text-orange-700">{status}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {set.options.map((opt) => (
          <motion.button
            key={opt.label}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -6 }}
            onClick={() => pick(opt.label)}
            className={`min-h-36 rounded-[2rem] border-4 text-2xl font-black ${
              choice === opt.label
                ? opt.label === set.answer
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-red-300 bg-red-50"
                : "border-orange-100 bg-white"
            }`}
          >
            <div className="text-5xl">{opt.emoji}</div>
            <div className="mt-2">{opt.label}</div>
          </motion.button>
        ))}
      </div>

      {done && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 font-black text-emerald-700">
          <CheckCircle2 /> Listening star unlocked!
        </div>
      )}
    </GameShell>
  );
}

const SPEAK_SETS: Record<number, string[]> = {
  1: ["Ball", "Sun", "Dog", "Cat"],
  2: ["This is a ball.", "I see a cat.", "Good morning."],
  3: ["I wake up early.", "I go to school.", "I like my friends."],
  4: ["My name is Aarav.", "I study in class four.", "I like reading stories."],
};

export function SpeakingGame({ classNumber }: Props) {
  const sentences = SPEAK_SETS[classNumber] ?? SPEAK_SETS[1];
  const [index, setIndex] = useState(0);
  const target = sentences[index];
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } =
    useSpeechRecognition();
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState("Listen first, then speak into the mic.");

  const listenModel = () => {
    stopSpeech();
    playSoundEffect("click");
    speakText(target, { rate: 0.88, onEnd: () => setStatus("Now your turn — press Speak.") });
    setStatus("Playing model sentence...");
  };

  const start = () => {
    stopSpeech();
    playSoundEffect("record_start");
    resetTranscript();
    setScore(null);
    startListening("en");
    setStatus("Listening... speak clearly.");
  };

  const stop = () => {
    playSoundEffect("record_stop");
    const spoken = stopListening() || transcript;
    const result = evaluateSpeechAccuracy(spoken, target, 4);
    setScore(result.overallScore);
    if (result.overallScore >= 70) {
      celebrate();
      setStatus(`Nice! Score ${result.overallScore}%`);
    } else {
      setStatus(`Try again. Heard: "${spoken || "nothing clear"}"`);
    }
  };

  return (
    <GameShell title="Echo Speak Game" subtitle="Hear the clear AI voice, then repeat the same words.">
      <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5 text-center">
        <p className="text-xs font-black uppercase text-orange-600">Say this</p>
        <p className="mt-2 text-2xl font-black md:text-3xl">"{target}"</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={listenModel}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-orange-700 shadow"
          >
            <Volume2 className="h-5 w-5" /> Listen Model
          </button>
          {!isListening ? (
            <button
              onClick={start}
              className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-black text-white shadow"
            >
              <Mic className="h-5 w-5" /> Speak
            </button>
          ) : (
            <button onClick={stop} className="rounded-2xl bg-slate-900 px-4 py-3 font-black text-white">
              Stop & Check
            </button>
          )}
          <button
            onClick={() => {
              setIndex((i) => (i + 1) % sentences.length);
              setScore(null);
              resetTranscript();
              setStatus("New sentence ready.");
            }}
            className="rounded-2xl bg-orange-500 px-4 py-3 font-black text-white"
          >
            Next Word
          </button>
        </div>
        <p className="mt-3 text-sm font-bold text-orange-800">{status}</p>
        {!isSupported && (
          <p className="mt-2 text-xs font-bold text-amber-700">Mic transcription needs Chrome/Edge.</p>
        )}
        {transcript && <p className="mt-2 text-sm text-slate-600">Heard: "{transcript}"</p>}
        {score !== null && (
          <p className="mt-3 text-3xl font-black text-emerald-600">{score}%</p>
        )}
      </div>
    </GameShell>
  );
}

type Pair = { id: string; word: string; emoji: string };

const READ_SETS: Record<number, Pair[]> = {
  1: [
    { id: "1", word: "SUN", emoji: "🌞" },
    { id: "2", word: "BALL", emoji: "⚽" },
    { id: "3", word: "DOG", emoji: "🐶" },
    { id: "4", word: "CAT", emoji: "🐱" },
  ],
  2: [
    { id: "1", word: "TREE", emoji: "🌳" },
    { id: "2", word: "BOOK", emoji: "📖" },
    { id: "3", word: "FISH", emoji: "🐟" },
    { id: "4", word: "BIRD", emoji: "🐦" },
  ],
  3: [
    { id: "1", word: "SCHOOL", emoji: "🏫" },
    { id: "2", word: "FRIEND", emoji: "🤝" },
    { id: "3", word: "WATER", emoji: "💧" },
    { id: "4", word: "APPLE", emoji: "🍎" },
  ],
  4: [
    { id: "1", word: "LIBRARY", emoji: "📚" },
    { id: "2", word: "GARDEN", emoji: "🌿" },
    { id: "3", word: "TEACHER", emoji: "👩‍🏫" },
    { id: "4", word: "PENCIL", emoji: "✏️" },
  ],
};

export function ReadingGame({ classNumber }: Props) {
  const pairs = READ_SETS[classNumber] ?? READ_SETS[1];
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [message, setMessage] = useState("Match the word with the picture.");

  const words = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);
  const emojis = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);

  const tryMatch = (wordId: string | null, emojiId: string | null) => {
    if (!wordId || !emojiId) return;
    if (wordId === emojiId) {
      setMatched((m) => [...m, wordId]);
      celebrate();
      setMessage("Match!");
      const pair = pairs.find((p) => p.id === wordId);
      if (pair) speakText(pair.word, { rate: 0.9 });
    } else {
      playSoundEffect("click");
      setMessage("Not a match — try again.");
    }
    setSelectedWord(null);
    setSelectedEmoji(null);
  };

  const done = matched.length === pairs.length;

  return (
    <GameShell title="Picture Word Match" subtitle="Tap a word, then tap its picture. Memory + reading game.">
      <p className="text-center text-sm font-black text-orange-700">{message}</p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {words.map((item) => {
            const locked = matched.includes(item.id);
            return (
              <button
                key={`w-${item.id}`}
                disabled={locked}
                onClick={() => {
                  const next = item.id;
                  setSelectedWord(next);
                  speakText(item.word, { rate: 0.9 });
                  tryMatch(next, selectedEmoji);
                }}
                className={`rounded-3xl border-4 p-5 text-xl font-black ${
                  locked
                    ? "border-emerald-300 bg-emerald-50 opacity-70"
                    : selectedWord === item.id
                      ? "border-orange-400 bg-orange-100"
                      : "border-orange-100 bg-white"
                }`}
              >
                {item.word}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {emojis.map((item) => {
            const locked = matched.includes(item.id);
            return (
              <button
                key={`e-${item.id}`}
                disabled={locked}
                onClick={() => {
                  const next = item.id;
                  setSelectedEmoji(next);
                  tryMatch(selectedWord, next);
                }}
                className={`rounded-3xl border-4 p-5 text-5xl ${
                  locked
                    ? "border-emerald-300 bg-emerald-50 opacity-70"
                    : selectedEmoji === item.id
                      ? "border-orange-400 bg-orange-100"
                      : "border-orange-100 bg-white"
                }`}
              >
                {item.emoji}
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-emerald-50 p-4 text-center font-black text-emerald-700"
          >
            All pairs matched — reading champion!
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}

const WRITE_SETS: Record<number, { target: string; tiles: string[]; hint: string }> = {
  1: { target: "SUN", tiles: ["S", "U", "N", "A", "T"], hint: "Build the word for 🌞" },
  2: { target: "CAT", tiles: ["C", "A", "T", "D", "O"], hint: "Build the word for 🐱" },
  3: { target: "BOOK", tiles: ["B", "O", "O", "K", "M", "P"], hint: "Build the classroom word" },
  4: {
    target: "I LIKE SCHOOL",
    tiles: ["I", "LIKE", "SCHOOL", "PLAY", "RUN"],
    hint: "Make a short sentence with the tiles",
  },
};

export function WritingGame({ classNumber }: Props) {
  const set = WRITE_SETS[classNumber] ?? WRITE_SETS[1];
  const [built, setBuilt] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const joined = classNumber >= 4 ? built.join(" ") : built.join("");
  const correct = joined === set.target || typed.trim().toUpperCase() === set.target;

  const addTile = (tile: string) => {
    playSoundEffect("click");
    speakText(tile, { rate: 1 });
    setBuilt((b) => [...b, tile]);
  };

  const check = () => {
    if (correct) {
      celebrate();
    } else {
      playSoundEffect("click");
      speakText(`Try again. The answer is ${set.target}`, { rate: 0.9 });
    }
  };

  return (
    <GameShell title="Word Builder Game" subtitle="Tap letter tiles to build the word, then copy it.">
      <div className="rounded-3xl bg-orange-50 p-5 text-center">
        <p className="font-black text-orange-800">{set.hint}</p>
        <p className="mt-3 min-h-14 rounded-2xl bg-white p-4 text-3xl font-black tracking-widest text-slate-900">
          {joined || "—"}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {set.tiles.map((tile, idx) => (
            <button
              key={`${tile}-${idx}`}
              onClick={() => addTile(tile)}
              className="min-w-14 rounded-2xl border-4 border-orange-200 bg-white px-4 py-3 text-xl font-black"
            >
              {tile}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setBuilt([]);
              setTyped("");
            }}
            className="rounded-2xl bg-slate-200 px-4 py-2 font-black"
          >
            Clear
          </button>
          <button
            onClick={() => speakText(set.target, { rate: 0.85 })}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 font-black text-orange-700"
          >
            <Volume2 className="h-4 w-4" /> Hear Word
          </button>
          <button onClick={check} className="rounded-2xl bg-orange-500 px-4 py-2 font-black text-white">
            Check Answer
          </button>
        </div>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value.toUpperCase())}
          placeholder="Or type the word here"
          className="mt-4 w-full rounded-2xl border border-orange-200 bg-white p-3 text-center text-lg font-black outline-orange-400"
        />
        {correct && (
          <div className="mt-4 flex items-center justify-center gap-2 font-black text-emerald-700">
            <CheckCircle2 /> Perfect writing!
          </div>
        )}
      </div>
    </GameShell>
  );
}
