/** Clear adult TTS + Web Audio helpers. No novelty / child / "bunny" voices. */

export type SpeakOptions = {
  langCode?: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onVoice?: (voiceLabel: string) => void;
};

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  bn: "bn-IN",
};

const BLOCKED_VOICE = /bunny|junior|princess|novelty|child|kids|cartoon|samantha.?child|zarvox|bad.?news|boing|bubbles|cellos|good.?news|organ|whisper|trinoids|superstar|albert|bahh|bells|boing|pipe.?organ/i;

function scoreVoice(voice: SpeechSynthesisVoice, targetLang: string): number {
  const name = `${voice.name} ${voice.lang}`.toLowerCase();
  if (BLOCKED_VOICE.test(name)) return -1000;

  let score = 0;
  if (voice.lang === targetLang) score += 40;
  else if (voice.lang.toLowerCase().startsWith(targetLang.slice(0, 2))) score += 20;

  // Prefer clear adult cloud / system voices
  if (/google.*us|google us english/i.test(name)) score += 100;
  if (/google.*uk|google uk english/i.test(name)) score += 90;
  if (/microsoft.*(aria|guy|jenny|davis|ryan|sonia|natasha|ravi)/i.test(name)) score += 85;
  if (/samantha|alex|daniel|karen|moira|tessa|fiona|victoria|oliver|aaron|nicky/i.test(name)) score += 70;
  if (/english/i.test(name)) score += 10;
  if (voice.localService) score += 5;
  if (/female|male/i.test(name)) score += 3;

  return score;
}

export function pickClearEnglishVoice(targetLang = "en-US"): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const ranked = [...voices]
    .map((voice) => ({ voice, score: scoreVoice(voice, targetLang) }))
    .filter((item) => item.score > -500)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.voice ?? null;
}

export function getActiveVoiceLabel(): string {
  const voice = pickClearEnglishVoice("en-US");
  if (!voice) return "Google / Web Speech Synthesizer";
  return `${voice.name} · ${voice.lang}`;
}

export function speakText(text: string, options: SpeakOptions = {}) {
  const { langCode = "en", rate = 0.95, onStart, onEnd, onVoice } = options;

  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    console.warn("SpeechSynthesis not supported");
    onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  const targetLang = LANG_MAP[langCode] ?? "en-US";

  const run = () => {
    const voice = pickClearEnglishVoice(targetLang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang ?? targetLang;
    if (voice) utterance.voice = voice;
    // Adult clear settings — never raise pitch (that creates "bunny" cartoon feel)
    utterance.rate = Math.max(0.7, Math.min(1.4, rate));
    utterance.pitch = 1;
    utterance.volume = 1;

    const label = voice ? `${voice.name} · ${voice.lang}` : "System English voice";
    onVoice?.(label);

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    synth.cancel();
    // Chrome sometimes needs a tick after cancel
    window.setTimeout(() => {
      try {
        synth.resume();
      } catch {
        /* ignore */
      }
      synth.speak(utterance);
    }, 40);
  };

  if (synth.getVoices().length === 0) {
    const once = () => {
      synth.removeEventListener("voiceschanged", once);
      run();
    };
    synth.addEventListener("voiceschanged", once);
    window.setTimeout(run, 400);
    return;
  }

  run();
}

export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function playSoundEffect(type: "record_start" | "record_stop" | "success" | "click" | "chime") {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    void ctx.resume();
    const now = ctx.currentTime;

    if (type === "success" || type === "chime") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        const t = now + index * 0.08;
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      });
      window.setTimeout(() => void ctx.close(), 700);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type === "click" ? "triangle" : "sine";
    const start = type === "record_stop" ? 880 : type === "click" ? 600 : 440;
    const end = type === "record_stop" ? 440 : 880;
    osc.frequency.setValueAtTime(start, now);
    if (type !== "click") osc.frequency.exponentialRampToValueAtTime(end, now + 0.14);
    gain.gain.setValueAtTime(type === "click" ? 0.08 : 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc.start(now);
    osc.stop(now + 0.15);
    window.setTimeout(() => void ctx.close(), 280);
  } catch (error) {
    console.warn("Web Audio effect failed", error);
  }
}

export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export type WordStatus = "correct" | "mispronounced" | "stress_error";

export type WordAnalysis = {
  word: string;
  status: WordStatus;
  phonetic: string;
};

export type EvaluationResult = {
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  accentScore: number;
  sentenceStressScore: number;
  grammarScore: number;
  vocabularyScore: number;
  speechRateWpm: number;
  transcribedText: string;
  wordAnalysis: WordAnalysis[];
};

export function evaluateSpeechAccuracy(
  spokenText: string,
  targetSentence: string,
  durationSeconds = 5,
): EvaluationResult {
  const targetWords = tokenizeText(targetSentence);
  const spokenWords = tokenizeText(spokenText);
  let matchCount = 0;

  const wordAnalysis: WordAnalysis[] = targetWords.map((word, index) => {
    const isExactMatch = spokenWords.includes(word);
    if (isExactMatch) {
      matchCount++;
      if (word.length > 8 && index % 3 === 0) {
        return { word, status: "stress_error", phonetic: `/${word}/` };
      }
      return { word, status: "correct", phonetic: `/${word}/` };
    }
    return { word, status: "mispronounced", phonetic: `/${word}/` };
  });

  const matchRatio =
    targetWords.length > 0 ? Math.max(0.45, Math.min(1, matchCount / targetWords.length)) : spokenWords.length ? 0.7 : 0.5;

  const durationMins = Math.max(0.05, durationSeconds / 60);
  const calculatedWpm = Math.round(spokenWords.length / durationMins) || 110;
  const speechRateWpm = Math.min(180, Math.max(70, calculatedWpm));

  return {
    overallScore: Math.round(matchRatio * 95),
    pronunciationScore: Math.round(matchRatio * 96),
    fluencyScore: Math.round(matchRatio * 90),
    accentScore: Math.round(matchRatio * 88),
    sentenceStressScore: Math.round(matchRatio * 92),
    grammarScore: Math.round(matchRatio * 97),
    vocabularyScore: Math.round(matchRatio * 91),
    speechRateWpm,
    transcribedText: spokenText || "(no clear transcript — try Chrome + allow mic)",
    wordAnalysis,
  };
}
