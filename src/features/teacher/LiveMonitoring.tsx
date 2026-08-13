import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Clock, Flag, MonitorDot } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { ChipBadge, Metric } from "../../components/Metric";
import { DemoBadge } from "../../components/DemoBadge";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { SessionTimer, elapsedMinutes } from "../../components/SessionTimer";
import { useAppStore } from "../../context/AppStoreContext";
import { useCrm } from "../../context/CrmContext";
import { todayISO } from "../../lib/aiTaskGenerator";
import { getLiveActivity, isStale } from "../../lib/liveActivity";
import { radarData } from "../../lib/stats";
import type { Skill } from "../../types/crm";
import type { Student, Teacher } from "../../types/student";
import { AttendancePanel } from "./AttendancePanel";

type SessionStudent = {
  student: Student;
  activity: Skill | "Idle";
  progress: number;
  flag: "ok" | "idle" | "low-score";
  currentScore: number;
};

type Props = {
  activeClass: { classNumber: number; section: "A" | "B" };
  students: Student[];
  teacher: Teacher;
};

export function LiveMonitoring({ activeClass, students, teacher }: Props) {
  const { dispatch, getActiveSession } = useCrm();
  const { attendance, markAttendance } = useAppStore();
  const date = todayISO();
  const roster = students.filter(
    (student) => student.classNumber === activeClass.classNumber && student.section === activeClass.section,
  );
  const session = getActiveSession(activeClass.classNumber, activeClass.section);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<SessionStudent | null>(null);
  const [ended, setEnded] = useState(false);
  const [lastMinutes, setLastMinutes] = useState(1);

  useEffect(() => {
    if (ended || !session) return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 2500);
    return () => window.clearInterval(interval);
  }, [ended, session]);

  const sessionStudents = roster.map<SessionStudent>((student) => {
    void tick;
    const live = getLiveActivity(student.id);
    const stale = isStale(live, 30_000);
    const activity = !live || stale ? "Idle" : live.skill;
    const progress = !live || stale ? 0 : live.progress;
    const skillForScore: Skill = activity === "Idle" ? "Listening" : activity;
    const currentScore = student.scores[skillForScore];
    const flag = activity === "Idle" ? "idle" : currentScore < 68 ? "low-score" : "ok";
    return { student, activity, progress, flag, currentScore };
  });

  const startFromAttendance = (records: typeof attendance) => {
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
  };

  if (!ended && !session) {
    return (
      <AttendancePanel
        key={`${activeClass.classNumber}-${activeClass.section}-live`}
        classNumber={activeClass.classNumber}
        section={activeClass.section}
        date={date}
        teacherId={teacher.id}
        students={roster}
        existing={attendance.filter(
          (row) =>
            row.date === date &&
            row.classNumber === activeClass.classNumber &&
            row.section === activeClass.section,
        )}
        saveLabel="Save attendance & go live"
        onSave={startFromAttendance}
      />
    );
  }

  if (ended) {
    const completion = Math.round(
      sessionStudents.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, sessionStudents.length),
    );
    const averageScore = Math.round(
      sessionStudents.reduce((sum, item) => sum + item.currentScore, 0) / Math.max(1, sessionStudents.length),
    );
    const flags = sessionStudents.filter((item) => item.flag !== "ok").length;
    return (
      <div className="panel-card p-8">
        <ChipBadge icon={<CheckCircle2 size={17} />} text="Session Summary" />
        <h1 className="mt-4 text-4xl font-black">
          Class {activeClass.classNumber}-{activeClass.section} lab period completed
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric title="Completion" value={`${completion}%`} icon={<CheckCircle2 />} />
          <Metric title="Average Score" value={`${averageScore}%`} icon={<BarChart3 />} />
          <Metric title="Time Spent" value={`${lastMinutes} min`} icon={<Clock />} />
          <Metric title="Flags" value={String(flags)} icon={<Flag />} />
        </div>
        <button className="mt-6 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white" onClick={() => setEnded(false)}>
          Start New Session
        </button>
      </div>
    );
  }

  const endSession = () => {
    const completion = Math.round(
      sessionStudents.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, sessionStudents.length),
    );
    const averageScore = Math.round(
      sessionStudents.reduce((sum, item) => sum + item.currentScore, 0) / Math.max(1, sessionStudents.length),
    );
    const flags = sessionStudents.filter((item) => item.flag !== "ok").length;
    const minutes = elapsedMinutes(session?.startedAt ?? new Date().toISOString());
    setLastMinutes(minutes);
    dispatch({
      type: "addSession",
      session: {
        id: `sess-${Date.now()}`,
        date: todayISO(),
        classNumber: activeClass.classNumber,
        section: activeClass.section,
        teacherId: teacher.id,
        teacherName: teacher.name,
        completionPct: completion,
        averageScore,
        timeSpentMin: minutes,
        flags,
      },
    });
    dispatch({
      type: "endLabSession",
      classNumber: activeClass.classNumber,
      section: activeClass.section,
    });
    setEnded(true);
  };

  return (
    <div className="space-y-5">
      <div className="panel-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ChipBadge icon={<MonitorDot size={17} />} text="Live session running" />
            <DemoBadge label="Same-browser heartbeat" />
          </div>
          <h1 className="mt-2 text-3xl font-black">
            Class {activeClass.classNumber}-{activeClass.section} Monitoring Grid
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">Heartbeat from student labs · Idle if no update in 30s</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {session && <SessionTimer startedAt={session.startedAt} />}
          <button className="rounded-2xl bg-slate-900 px-5 py-3 font-black text-white" onClick={endSession}>
            End Session
          </button>
        </div>
      </div>
      {!sessionStudents.length ? (
        <EmptyState title="No students in this class" text="Check allotments or bulk onboarding for this section." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessionStudents.map((item) => (
            <button
              key={item.student.id}
              className="nested-card w-full text-left transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => setSelected(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 font-black text-orange-700">
                    {item.student.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-black">{item.student.name}</p>
                    <p className="text-sm text-slate-500">Roll {item.student.roll}</p>
                  </div>
                </div>
                <StatusFlag flag={item.flag} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm font-bold">
                <span>{item.activity}</span>
                <span>{item.progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-orange-100">
                <motion.div animate={{ width: `${item.progress}%` }} className="h-2 rounded-full bg-orange-500" />
              </div>
            </button>
          ))}
        </div>
      )}
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Student Live Detail">
        {selected && <StudentDrawer item={selected} />}
      </Modal>
    </div>
  );
}

function StudentDrawer({ item }: { item: SessionStudent }) {
  return (
    <div>
      <h3 className="text-xl font-black">{item.student.name}</h3>
      <p className="text-slate-500">
        Class {item.student.classNumber}-{item.student.section} · User ID {item.student.userId}
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData(item.student.scores)}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <Radar dataKey="score" fill="#f97316" fillOpacity={0.35} stroke="#f97316" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 rounded-3xl bg-orange-50 p-4">
        <p className="font-black">Current Exercise: {item.activity}</p>
        <p className="text-sm text-slate-600">Progress {item.progress}% · Score {item.currentScore}%</p>
      </div>
    </div>
  );
}

function StatusFlag({ flag }: { flag: SessionStudent["flag"] }) {
  const style =
    flag === "ok" ? "bg-green-100 text-green-700" : flag === "idle" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${style}`}>
      {flag === "ok" ? "Active" : flag === "idle" ? "Idle flag" : "Low score"}
    </span>
  );
}
