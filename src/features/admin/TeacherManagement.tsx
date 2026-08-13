import { useState } from "react";
import { PencilLine, Plus, UserRound } from "lucide-react";
import { useAppStore } from "../../context/AppStoreContext";
import { useCrm } from "../../context/CrmContext";
import { allotmentsFromTeachers } from "../../lib/persist";
import { randomPassword } from "../../data/seed";
import type { Profile, Teacher } from "../../types/student";

const BANDS: Profile[] = ["Foundational", "Elementary", "Exam-Track", "Advanced"];
const SLOTS = Array.from({ length: 12 }, (_, i) => i + 1).flatMap((classNumber) =>
  (["A", "B"] as const).map((section) => ({ classNumber, section })),
);

function slotKey(slot: { classNumber: number; section: "A" | "B" }) {
  return `${slot.classNumber}-${slot.section}`;
}

const blank = (): Teacher => ({
  id: `t-${Date.now()}`,
  name: "",
  userId: "",
  password: randomPassword(),
  band: "Elementary",
  allotted: [],
  active: true,
});

export function TeacherManagement() {
  const { teachers, upsertTeacher } = useAppStore();
  const { dispatch } = useCrm();
  const [editing, setEditing] = useState<Teacher | null>(null);

  const save = (teacher: Teacher) => {
    const next = { ...teacher, name: teacher.name.trim(), userId: teacher.userId.trim() };
    if (!next.name || !next.userId) return;
    upsertTeacher(next);
    const list = teachers.some((item) => item.id === next.id)
      ? teachers.map((item) => (item.id === next.id ? next : item))
      : [...teachers, next];
    dispatch({ type: "setAllotments", allotments: allotmentsFromTeachers(list) });
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="panel-card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-orange-600">School Admin</p>
          <h1 className="mt-1 text-3xl font-black">Teacher Management</h1>
          <p className="mt-1 text-sm text-slate-600">Add, edit, or deactivate teachers. Class allotments sync to CRM.</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-black text-white"
          onClick={() => setEditing(blank())}
        >
          <Plus size={16} /> Add teacher
        </button>
      </div>

      <div className="panel-card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Login</th>
              <th className="px-4 py-3">Band</th>
              <th className="px-4 py-3">Allotments</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-black">{teacher.name}</td>
                <td className="px-4 py-3 font-semibold text-slate-600">{teacher.userId}</td>
                <td className="px-4 py-3">{teacher.band}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {teacher.allotted.map((slot) => (
                      <span key={slotKey(slot)} className="stat-chip">
                        {slot.classNumber}-{slot.section}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      teacher.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {teacher.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="rounded-lg bg-orange-50 p-2 text-orange-700" onClick={() => setEditing(teacher)}>
                    <PencilLine size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <TeacherEditor
          teacher={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
          onDeactivate={() => save({ ...editing, active: false })}
        />
      )}
    </div>
  );
}

function TeacherEditor({
  teacher,
  onSave,
  onCancel,
  onDeactivate,
}: {
  teacher: Teacher;
  onSave: (teacher: Teacher) => void;
  onCancel: () => void;
  onDeactivate: () => void;
}) {
  const [draft, setDraft] = useState(teacher);
  const selected = new Set(draft.allotted.map(slotKey));

  const toggleSlot = (slot: { classNumber: number; section: "A" | "B" }) => {
    const key = slotKey(slot);
    const allotted = selected.has(key)
      ? draft.allotted.filter((item) => slotKey(item) !== key)
      : [...draft.allotted, slot];
    setDraft({ ...draft, allotted });
  };

  return (
    <div className="panel-card">
      <h2 className="flex items-center gap-2 text-lg font-black">
        <UserRound size={18} /> {teacher.name ? "Edit teacher" : "New teacher"}
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          placeholder="Full name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          placeholder="User ID"
          value={draft.userId}
          onChange={(e) => setDraft({ ...draft, userId: e.target.value })}
        />
        <input
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          placeholder="Password"
          value={draft.password}
          onChange={(e) => setDraft({ ...draft, password: e.target.value })}
        />
        <select
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          value={draft.band}
          onChange={(e) => setDraft({ ...draft, band: e.target.value as Profile })}
        >
          {BANDS.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-wide text-slate-500">Class allotments</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SLOTS.map((slot) => (
          <button
            key={slotKey(slot)}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-black ${
              selected.has(slotKey(slot)) ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
            onClick={() => toggleSlot(slot)}
          >
            {slot.classNumber}-{slot.section}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={() => onSave({ ...draft, active: true })}>
          Save teacher
        </button>
        {teacher.name && (
          <button className="rounded-xl border border-rose-200 px-5 py-2.5 font-black text-rose-600" onClick={onDeactivate}>
            Deactivate
          </button>
        )}
        <button className="rounded-xl border border-slate-200 px-5 py-2.5 font-black text-slate-700" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
