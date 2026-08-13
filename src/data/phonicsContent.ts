export type PhonicsLetter = {
  letter: string;
  sound: string;
  example: string;
  emoji: string;
};

export type PhonicsBlend = {
  parts: string[];
  word: string;
  emoji: string;
};

export const PHONICS_LETTERS: PhonicsLetter[] = [
  { letter: "A", sound: "a as in apple", example: "apple", emoji: "🍎" },
  { letter: "B", sound: "b as in ball", example: "ball", emoji: "⚽" },
  { letter: "C", sound: "c as in cat", example: "cat", emoji: "🐱" },
  { letter: "D", sound: "d as in dog", example: "dog", emoji: "🐶" },
  { letter: "E", sound: "e as in egg", example: "egg", emoji: "🥚" },
  { letter: "F", sound: "f as in fish", example: "fish", emoji: "🐟" },
  { letter: "G", sound: "g as in goat", example: "goat", emoji: "🐐" },
  { letter: "H", sound: "h as in hat", example: "hat", emoji: "🎩" },
  { letter: "I", sound: "i as in ink", example: "ink", emoji: "🖋️" },
  { letter: "M", sound: "m as in moon", example: "moon", emoji: "🌙" },
  { letter: "S", sound: "s as in sun", example: "sun", emoji: "☀️" },
  { letter: "T", sound: "t as in tap", example: "tap", emoji: "🚰" },
];

export const PHONICS_BLENDS: PhonicsBlend[] = [
  { parts: ["c", "a", "t"], word: "cat", emoji: "🐱" },
  { parts: ["s", "u", "n"], word: "sun", emoji: "☀️" },
  { parts: ["d", "o", "g"], word: "dog", emoji: "🐶" },
  { parts: ["h", "a", "t"], word: "hat", emoji: "🎩" },
  { parts: ["b", "a", "t"], word: "bat", emoji: "🦇" },
  { parts: ["p", "e", "n"], word: "pen", emoji: "🖊️" },
];
