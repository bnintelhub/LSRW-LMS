import { useAppStore } from "../../context/AppStoreContext";
import type { SchoolProfile } from "../../types/progress";

const YEARS = ["2024-25", "2025-26", "2026-27"];

export function dateInTerm(date: string, term: SchoolProfile["term"]) {
  const month = Number(date.slice(5, 7));
  if (term === "1") return month >= 4 && month <= 9;
  if (term === "2") return month >= 10 || month <= 1;
  return month >= 2 && month <= 3;
}

export function AcademicYearFields({
  value,
  onChange,
}: {
  value: Pick<SchoolProfile, "academicYear" | "term">;
  onChange: (next: Pick<SchoolProfile, "academicYear" | "term">) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm font-bold text-slate-600">
        Academic year
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-black"
          value={value.academicYear}
          onChange={(e) => onChange({ ...value, academicYear: e.target.value })}
        >
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-bold text-slate-600">
        Term
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-black"
          value={value.term}
          onChange={(e) => onChange({ ...value, term: e.target.value as SchoolProfile["term"] })}
        >
          <option value="1">Term 1 (Apr–Sep)</option>
          <option value="2">Term 2 (Oct–Jan)</option>
          <option value="3">Term 3 (Feb–Mar)</option>
        </select>
      </label>
    </div>
  );
}

export function AcademicYear() {
  const { school, setSchool } = useAppStore();
  return (
    <div className="panel-card space-y-4">
      <h1 className="text-2xl font-black">Academic Year</h1>
      <p className="text-sm text-slate-600">CRM session history and reports filter to the selected term.</p>
      <AcademicYearFields value={school} onChange={(next) => setSchool({ ...school, ...next })} />
    </div>
  );
}
