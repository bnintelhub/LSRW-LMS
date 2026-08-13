import type { ReactNode } from "react";
import { Sparkline } from "./PortalShell";

export function ChipBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">
      {icon}
      {text}
    </span>
  );
}

export function Metric({
  title,
  value,
  icon,
  accent = "orange",
}: {
  title: string;
  value: string;
  icon: ReactNode;
  accent?: "orange" | "amber" | "yellow" | "rose" | "purple" | "green" | "blue";
}) {
  const spark = {
    orange: "#f97316",
    purple: "#7c3aed",
    green: "#059669",
    blue: "#2563eb",
    amber: "#d97706",
    yellow: "#ca8a04",
    rose: "#e11d48",
  }[accent];
  return (
    <div className={`metric-card metric-card-${accent}`}>
      <div className="flex items-start justify-between">
        <div className="metric-icon">{icon}</div>
        <Sparkline color={spark} />
      </div>
      <p className="metric-label">{title}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}
