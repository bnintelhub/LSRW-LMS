import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnnouncementBanner } from "../admin/Announcements";
import { HomeworkBanner } from "../../components/HomeworkBanner";
import { Metric } from "../../components/Metric";
import { WelcomeBanner, RingProgress } from "../../components/PortalShell";
import { SkillIcon } from "../../components/SkillIcon";
import { useAppStore } from "../../context/AppStoreContext";
import { useCrm } from "../../context/CrmContext";
import { classMeta, isGameBand } from "../../data/classBands";
import { lessonCopy } from "../../data/lessonCopy";
import { getWordForDate } from "../../data/wordOfTheDay";
import { skills } from "../../data/seed";
import { todayISO } from "../../lib/aiTaskGenerator";
import { classAverage, radarData } from "../../lib/stats";
import type { Skill } from "../../types/crm";
import type { Profile, Student } from "../../types/student";
import { LearningPath } from "./engagement/LearningPath";

const GAME_COPY: Record<Skill, { title: string; prompt: string }> = {
  Listening: { title: "Pop the Sound Bubble", prompt: "Listen and tap the matching picture bubble." },
  Speaking: { title: "Echo Speak Game", prompt: "Hear clear AI voice, then speak into the mic." },
  Reading: { title: "Picture Word Match", prompt: "Match sight words with pictures." },
  Writing: { title: "Word Builder Game", prompt: "Build words with letter tiles." },
};

type Props = {
  student: Student;
  profile: Profile;
  students: Student[];
  setView: (view: Skill | "tasks") => void;
  avg: number;
};

export function StudentHome({ student, profile, students, setView, avg }: Props) {
  const { rankFor, showHindiHints } = useAppStore();
  const { publishedTasksFor } = useCrm();
  const meta = classMeta[student.classNumber];
  const chartData = skills.map((skill) => ({
    skill,
    score: student.scores[skill],
    classAvg: classAverage(students, student.classNumber),
  }));
  const gameMode = isGameBand(student.classNumber);
  const rank = rankFor(student.id);
  const date = todayISO();
  const tasks = publishedTasksFor({ date, classNumber: student.classNumber, section: student.section });
  const remaining = tasks.filter((t) => !t.completedBy.includes(student.id)).length;
  const wotd = getWordForDate(date);

  return (
    <div className="space-y-6">
      <AnnouncementBanner audience="student" />
      <WelcomeBanner
        badge={`Class ${student.classNumber} · ${meta.cefr} · ${gameMode ? "Game Mode" : "AI Lab Mode"}`}
        title={`Good day, ${student.name.split(" ")[0]}!`}
        text={
          gameMode
            ? "Play, listen, speak and win stars with today's LSRW games."
            : "Your communication labs, tasks, and progress are ready for today's session."
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Average" value={`${avg}%`} icon={<BarChart3 />} accent="orange" />
        <Metric title="Streak" value={`${student.streak} days`} icon={<Sparkles />} accent="purple" />
        <Metric title="Class Rank" value={`#${rank.rank}`} icon={<Star />} accent="green" />
        <Metric title="XP" value={String(student.xp)} icon={<Award />} accent="blue" />
      </div>

      <HomeworkBanner remaining={remaining} onOpenTasks={() => setView("tasks")} />
      {student.classNumber >= 5 && <LearningPath student={student} onOpenSkill={(skill) => setView(skill)} />}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="word-of-day-strip">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-500 text-2xl text-white shadow-lg shadow-orange-200">
              📖
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Word of the Day</p>
              <p className="text-xl font-black text-slate-900">{wotd.word}</p>
              <p className="text-sm text-slate-500">{wotd.meaning}</p>
              {showHindiHints && wotd.hindi && (
                <p className="mt-1 text-sm font-semibold text-orange-700">Hindi: {wotd.hindi}</p>
              )}
            </div>
          </div>
        </div>
        <div className="panel-card flex items-center justify-center">
          <RingProgress
            value={tasks.length ? Math.round(((tasks.length - remaining) / tasks.length) * 100) : 0}
            label="Today's tasks"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="content-card">
          <h2 className="mb-4 flex items-center justify-between text-xl font-black text-slate-900">
            <span>{gameMode ? "Today's Games" : "Today's AI Labs"}</span>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              {gameMode ? "Class 1–4 Games" : "Class 5+ AI Labs"}
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => (
              <motion.button
                whileHover={{ y: -4 }}
                key={skill}
                onClick={() => setView(skill)}
                className={`lesson-card ${profile.toLowerCase().replace("-", "")}`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <SkillIcon skill={skill} />
                </span>
                <span className="text-left">
                  <span className="block text-lg font-black">
                    {gameMode ? GAME_COPY[skill].title : lessonCopy[profile][skill].title}
                  </span>
                  <span className="text-sm text-slate-600">
                    {gameMode ? GAME_COPY[skill].prompt : lessonCopy[profile][skill].prompt}
                  </span>
                </span>
                {gameMode && <span className="gif-orbit" />}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="content-card">
          <h2 className="mb-3 text-xl font-black text-slate-900">{gameMode ? "Star Badges" : "Skill Radar"}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData(student.scores)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <Radar dataKey="score" fill="#f97316" fillOpacity={0.35} stroke="#f97316" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {(profile === "Exam-Track" || profile === "Advanced") && (
        <div className="panel-card">
          <h2 className="mb-4 text-xl font-black">Score vs Class Average</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#f97316" radius={[10, 10, 0, 0]} />
                <Bar dataKey="classAvg" fill="#fed7aa" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
