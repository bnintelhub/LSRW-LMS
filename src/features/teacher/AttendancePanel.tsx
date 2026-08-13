import { useMemo, useState } from "react";
import { CheckCircle2, UserX, Clock } from "lucide-react";
import type { AttendanceRecord } from "../../types/progress";

type StudentLite = { id: string; name: string; roll: number };
type Status = AttendanceRecord["status"];

type Props = {
  classNumber: number;
  section: "A" | "B";
  date: string;
  teacherId: string;
  students: StudentLite[];
  existing?: AttendanceRecord[];
  onSave: (records: AttendanceRecord[]) => void;
  onCancel?: () => void;
  saveLabel?: string;
};

const OPTIONS: { id: Status; label: string; className: string }[] = [
  { id: "present", label: "Present", className: "bg-emerald-500 text-white" },
  { id: "late", label: "Late", className: "bg-amber-500 text-white" },
  { id: "absent", label: "Absent", className: "bg-rose-500 text-white" },
];

export function AttendancePanel({
  classNumber,
  section,
  date,
  teacherId,
  students,
  existing = [],
  saveLabel = "Save & Start Session",
  onSave,
  onCancel,
}: Props) {
  const initial = useMemo(() => {
    const map: Record<string, Status> = {};
    for (const student of students) {
      const found = existing.find((row) => row.studentId === student.id);
      map[student.id] = found?.status ?? "present";
    }
    return map;
  }, [students, existing]);
  const [marks, setMarks] = useState<Record<string, Status>>(initial);

  const counts = {
    present: Object.values(marks).filter((s) => s === "present").length,
    late: Object.values(marks).filter((s) => s === "late").length,
    absent: Object.values(marks).filter((s) => s === "absent").length,
  };

  const markAll = (status: Status) => {
    const next: Record<string, Status> = {};
    for (const student of students) next[student.id] = status;
    setMarks(next);
  };

  const save = () => {
    onSave(
      students.map((student) => ({
        date,
        classNumber,
        section,
        studentId: student.id,
        status: marks[student.id] ?? "present",
        markedBy: teacherId,
      })),
    );
  };

  return (
    <div className="panel-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-orange-600">Attendance</p>
          <h1 className="mt-1 text-2xl font-black">
            Class {classNumber}-{section} · {date}
          </h1>
          <p className="mt-1 text-sm text-slate-600">Mark Present, Late, or Absent before the lab starts.</p>
        </div>
        <div className="flex gap-2 text-xs font-black">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{counts.present} present</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{counts.late} late</span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">{counts.absent} absent</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700" onClick={() => markAll("present")}>
          All present
        </button>
        <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600" onClick={() => markAll("absent")}>
          All absent
        </button>
      </div>

      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
        {students.map((student) => (
          <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="font-black">{student.name}</p>
              <p className="text-xs font-semibold text-slate-500">Roll {student.roll}</p>
            </div>
            <div className="flex gap-2">
              {OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${
                    marks[student.id] === option.id ? option.className : "bg-white text-slate-500"
                  }`}
                  onClick={() => setMarks((prev) => ({ ...prev, [student.id]: option.id }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!students.length && <p className="empty-state">No students in this class-section.</p>}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={save}>
          <CheckCircle2 className="h-4 w-4" /> {saveLabel}
        </button>
        {onCancel && (
          <button className="rounded-xl border border-slate-200 px-5 py-2.5 font-black text-slate-700" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export function AttendanceIcon({ status }: { status: Status }) {
  if (status === "absent") return <UserX className="h-4 w-4 text-rose-500" />;
  if (status === "late") return <Clock className="h-4 w-4 text-amber-500" />;
  return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
}
