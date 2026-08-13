import { useEffect, useRef } from "react";
import type { Skill } from "../types/crm";
import { writeLiveActivity } from "../lib/liveActivity";

export function useLiveActivity(studentId: string, skill: Skill, enabled: boolean) {
  const progress = useRef(18);
  useEffect(() => {
    if (!enabled) return;
    progress.current = 18;
    writeLiveActivity(studentId, skill, progress.current);
    const id = window.setInterval(() => {
      progress.current = Math.min(96, progress.current + 8);
      writeLiveActivity(studentId, skill, progress.current);
    }, 10000);
    return () => {
      window.clearInterval(id);
      writeLiveActivity(studentId, "Idle", progress.current);
    };
  }, [studentId, skill, enabled]);
}
