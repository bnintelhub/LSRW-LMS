export function DemoBadge({ label = "Demo mode" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
      {label}
    </span>
  );
}
