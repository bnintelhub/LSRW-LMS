import { MonitorDot, PencilLine, School, Users } from "lucide-react";
import { useState } from "react";
import { AnnouncementBanner } from "../admin/Announcements";
import { ChipBadge, Metric } from "../../components/Metric";
import { WelcomeBanner, RingProgress } from "../../components/PortalShell";
import { useAppStore } from "../../context/AppStoreContext";
import { useCrm } from "../../context/CrmContext";
import { getWordForDate } from "../../data/wordOfTheDay";
import { todayISO } from "../../lib/aiTaskGenerator";
import type { Student, Teacher } from "../../types/student";
import { AttendancePanel } from "./AttendancePanel";
import { ClassSnapshot } from "./ClassSnapshot";

export type TeacherTab =
  | "dashboard"
  | "tasks"
  | "live"
  | "roster"
  | "reviews"
  | "submissions"
  | "reports"
  | "settings"
  | "help"
  | "attendance";

type Slot = { classNumber: number; section: "A" | "B" };

type Props = {
  teacher: Teacher;
  students: Student[];
  activeClass: Slot;
  setActiveClass: (value: Slot) => void;
  setTab: (tab: TeacherTab) => void;
};

export function TeacherHome({ teacher, students, activeClass, setActiveClass, setTab }: Props) {
  const { dispatch, isClassSessionActive, publishedTasksFor } = useCrm();
  const { submissions, attendance, markAttendance } = useAppStore();
  const [showAttendance, setShowAttendance] = useState(false);
  const date = todayISO();
  const wotd = getWordForDate(date);
  const scoped = students.filter((student) =>
    teacher.allotted.some((item) => item.classNumber === student.classNumber && item.section === student.section),
  );
  const pending = submissions.filter(
    (item) =>
      item.status === "pending" &&
      teacher.allotted.some((slot) => slot.classNumber === item.classNumber && slot.section === item.section),
  ).length;
  const sessionLive = isClassSessionActive(activeClass.classNumber, activeClass.section, date);
  const classStudents = scoped.filter(
    (student) => student.classNumber === activeClass.classNumber && student.section === activeClass.section,
  );
  const published = publishedTasksFor({
    date,
    classNumber: activeClass.classNumber,
    section: activeClass.section,
  });
  const completionPct =
    published.length && classStudents.length
      ? Math.round(
          (published.reduce(
            (sum, task) => sum + task.completedBy.filter((id) => classStudents.some((s) => s.id === id)).length,
            0,
          ) /
            (published.length * classStudents.length)) *
            100,
        )
      : 0;

  const startSession = () => {
    if (sessionLive) {
      setTab("live");
      return;
    }
    setShowAttendance(true);
  };

  const confirmAttendance = (records: typeof attendance) => {
    markAttendance(records);
    dispatch({
      type: "startLabSession",
      session: {
        classNumber: activeClass.classNumber,
        section: activeClass.section,
        teacherId: teacher.id,
        teacherName: teacher.name,
        startedAt: new Date().toISOString(),
        date,
      },
    });
    setShowAttendance(false);
    setTab("live");
  };

  if (showAttendance) {
    return (
      <AttendancePanel
        key={`${activeClass.classNumber}-${activeClass.section}-home`}
        classNumber={activeClass.classNumber}
        section={activeClass.section}
        date={date}
        teacherId={teacher.id}
        students={classStudents}
        existing={attendance.filter(
          (row) =>
            row.date === date &&
            row.classNumber === activeClass.classNumber &&
            row.section === activeClass.section,
        )}
        onSave={confirmAttendance}
        onCancel={() => setShowAttendance(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AnnouncementBanner audience="teacher" />
      <WelcomeBanner
        badge={`${teacher.band} Teacher`}
        title={`Good morning, ${teacher.name.split(" ")[0]}!`}
        text="Assign AI daily tasks, start lab sessions, review submissions, and track class completion."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Students" value={String(scoped.length)} icon={<Users />} accent="orange" />
        <Metric title="Classes" value={String(teacher.allotted.length)} icon={<School />} accent="purple" />
        <Metric title="Pending Reviews" value={String(pending)} icon={<PencilLine />} accent="green" />
        <Metric title="Session" value={sessionLive ? "Live" : "Idle"} icon={<MonitorDot />} accent="blue" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="panel-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black">Start Lab Session</h2>
            {sessionLive && (
              <ChipBadge
                icon={<MonitorDot size={17} />}
                text={`Class ${activeClass.classNumber}-${activeClass.section} is LIVE`}
              />
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">Students can log in only after you start the session for their class.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {teacher.allotted.map((item) => (
              <button
                key={`${item.classNumber}-${item.section}`}
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  activeClass.classNumber === item.classNumber && activeClass.section === item.section
                    ? "bg-orange-500 text-white"
                    : "bg-violet-50 text-violet-700"
                }`}
                onClick={() => setActiveClass(item)}
              >
                Class {item.classNumber}-{item.section}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={startSession}>
              {sessionLive ? "Open Live Monitoring" : "Start Lab Session"}
            </button>
            <button className="rounded-xl border border-slate-200 px-5 py-2.5 font-black text-slate-700" onClick={() => setTab("tasks")}>
              Open Daily Tasks
            </button>
          </div>
        </div>
        <div className="space-y-5">
          <ClassSnapshot
            classNumber={activeClass.classNumber}
            section={activeClass.section}
            students={classStudents}
            published={published}
          />
          <div className="panel-card">
            <p className="text-xs font-black uppercase tracking-wide text-orange-600">Word of the Day</p>
            <p className="mt-1 text-2xl font-black">{wotd.word}</p>
            <p className="text-sm text-slate-500">{wotd.pronunciation}</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">{wotd.meaning}</p>
          </div>
          <div className="panel-card flex justify-center py-6">
            <RingProgress value={completionPct} label="Today's Progress" />
          </div>
          <div className="panel-card">
            <h2 className="mb-3 text-lg font-black">Today's Schedule</h2>
            {teacher.allotted.map((item, index) => (
              <div key={`${item.classNumber}-${item.section}`} className="schedule-row">
                <span className="schedule-dot" style={{ background: ["#f97316", "#22c55e", "#8b5cf6"][index % 3] }} />
                <div className="flex-1">
                  <p className="text-sm font-black">
                    Class {item.classNumber}-{item.section}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">{8 + index}:30 AM · LSRW Lab</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
