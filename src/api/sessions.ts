import { apiGet, apiMutate } from "./client";
import type { ActiveLabSession } from "../types/crm";

export async function getActiveSessions(items: ActiveLabSession[]) {
  return apiGet(() => items);
}

export async function startSession(session: ActiveLabSession) {
  return apiMutate(() => session);
}

export async function endSession(session: ActiveLabSession) {
  return apiMutate(() => session);
}
