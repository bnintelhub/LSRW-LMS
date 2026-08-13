import { Headphones, Mic, BookOpen, PencilLine, type LucideIcon } from "lucide-react";
import type { Skill } from "../types/crm";

const ICONS: Record<Skill, LucideIcon> = {
  Listening: Headphones,
  Speaking: Mic,
  Reading: BookOpen,
  Writing: PencilLine,
};

export function SkillIcon({ skill, size = 20 }: { skill: Skill; size?: number }) {
  const Icon = ICONS[skill];
  return <Icon size={size} />;
}
