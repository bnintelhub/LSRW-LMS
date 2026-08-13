import { useState } from "react";
import { School } from "lucide-react";
import { useAppStore } from "../../context/AppStoreContext";
import { useToast } from "../../context/ToastContext";
import type { SchoolProfile } from "../../types/progress";
import { AcademicYearFields } from "./AcademicYear";

export function SchoolProfileForm() {
  const { school, setSchool } = useAppStore();
  const toast = useToast();
  const [draft, setDraft] = useState<SchoolProfile>(school);

  const save = () => {
    setSchool({
      ...draft,
      name: draft.name.trim() || "LSRW Language Lab",
      address: draft.address.trim(),
    });
    toast("School profile saved");
  };

  return (
    <div className="space-y-5">
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wide text-orange-600">School Admin</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-black">
          <School size={26} /> School Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600">This name appears on reports, CRM, and the student banner.</p>
      </div>
      <div className="panel-card space-y-4">
        <label className="block text-sm font-bold text-slate-600">
          School name
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-black text-slate-900"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <label className="block text-sm font-bold text-slate-600">
          Address
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-semibold"
            value={draft.address}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })}
          />
        </label>
        <label className="block text-sm font-bold text-slate-600">
          Logo URL (optional)
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-semibold"
            placeholder="https://..."
            value={draft.logoUrl ?? ""}
            onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })}
          />
        </label>
        {draft.logoUrl ? (
          <img src={draft.logoUrl} alt="School logo preview" className="h-16 w-16 rounded-xl object-cover" />
        ) : null}
        <AcademicYearFields value={draft} onChange={(next) => setDraft({ ...draft, ...next })} />
        <button className="rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={save}>
          Save profile
        </button>
      </div>
    </div>
  );
}
