import { todayISO } from "./aiTaskGenerator";

export function encodeParentToken(studentId: string, date = todayISO()) {
  const raw = btoa(`${studentId}|${date}`);
  return raw.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeParentToken(token: string): { studentId: string; date: string } | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const withPad = padded + "=".repeat((4 - (padded.length % 4)) % 4);
    const [studentId, date] = atob(withPad).split("|");
    if (!studentId || !date) return null;
    return { studentId, date };
  } catch {
    return null;
  }
}

export function parentReportUrl(studentId: string) {
  const token = encodeParentToken(studentId);
  return `${window.location.origin}${window.location.pathname}#/report/share/${encodeURIComponent(studentId)}/${token}`;
}

export function parseParentShare(location: Pick<Location, "pathname" | "hash"> = window.location) {
  const hash = location.hash.replace(/^#/, "");
  const source = hash.includes("/report/share/") ? hash : location.pathname;
  const match = source.match(/\/report\/share\/([^/]+)\/([^/?#]+)/);
  if (!match) return null;
  return {
    studentId: decodeURIComponent(match[1]),
    token: decodeURIComponent(match[2]),
  };
}
