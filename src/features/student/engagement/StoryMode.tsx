import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { storiesForClass } from "../../../data/storyContent";
import { speakText, stopSpeech } from "../../../lib/speech";

type Props = {
  classNumber: number;
  onComplete: (score: number) => void;
};

export function StoryMode({ classNumber, onComplete }: Props) {
  const stories = useMemo(() => storiesForClass(classNumber), [classNumber]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [slide, setSlide] = useState(0);
  const [activeWord, setActiveWord] = useState(-1);
  const [finished, setFinished] = useState(false);
  const story = stories[storyIndex] ?? stories[0];
  const current = story?.slides[slide];
  const words = current?.text.split(" ") ?? [];

  useEffect(() => () => stopSpeech(), []);

  const readAlong = () => {
    if (!current) return;
    stopSpeech();
    setActiveWord(0);
    speakText(current.text, { rate: 0.9, onEnd: () => setActiveWord(-1) });
    words.forEach((_, index) => {
      window.setTimeout(() => setActiveWord(index), index * 380);
    });
    window.setTimeout(() => setActiveWord(-1), words.length * 380 + 200);
  };

  const next = () => {
    if (!story) return;
    if (slide + 1 < story.slides.length) {
      setSlide((n) => n + 1);
      setActiveWord(-1);
      return;
    }
    if (!finished) {
      setFinished(true);
      onComplete(88);
    }
  };

  if (!story || !current) {
    return <div className="empty-state">No story for this class yet.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border-4 border-orange-200 bg-white p-5 shadow-sm md:p-6">
        <div className="rounded-3xl bg-gradient-to-r from-sky-400 via-orange-300 to-amber-300 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-orange-950/70">Story mode · Class {classNumber}</p>
          <h2 className="mt-1 text-2xl font-black">{story.title}</h2>
          <p className="mt-1 text-sm font-semibold text-orange-950/80">Listen, follow the words, then tap next.</p>
        </div>
        {stories.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {stories.map((item, index) => (
              <button
                key={item.id}
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  index === storyIndex ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700"
                }`}
                onClick={() => {
                  stopSpeech();
                  setStoryIndex(index);
                  setSlide(0);
                  setFinished(false);
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel-card text-center">
        <p className="text-7xl">{current.emoji}</p>
        <p className="mt-6 text-xl font-black leading-relaxed md:text-2xl">
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className={`mx-0.5 rounded-md px-1 ${activeWord === index ? "bg-amber-200 text-orange-900" : ""}`}
            >
              {word}
            </span>
          ))}
        </p>
        <p className="mt-3 text-xs font-bold uppercase text-slate-400">
          Slide {slide + 1} / {story.slides.length}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2.5 font-black text-slate-700 disabled:opacity-40"
            disabled={slide === 0}
            onClick={() => {
              stopSpeech();
              setSlide((n) => Math.max(0, n - 1));
            }}
          >
            <span className="inline-flex items-center gap-1">
              <ChevronLeft size={16} /> Back
            </span>
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 font-black text-white"
            onClick={readAlong}
          >
            <Volume2 size={16} /> Read along
          </button>
          <button className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 font-black text-white" onClick={next}>
            {slide + 1 === story.slides.length ? (finished ? "Finished" : "Finish story") : "Next"} <ChevronRight size={16} />
          </button>
        </div>
        {finished && <p className="mt-4 font-black text-emerald-700">Story complete. Reading XP saved.</p>}
      </div>
    </div>
  );
}
