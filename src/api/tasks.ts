import { apiGet, apiMutate } from "./client";
import type { DailyTask } from "../types/crm";

export async function getTasks(filter: DailyTask[]) {
  return apiGet(() => filter);
}

export async function completeTask(task: DailyTask) {
  return apiMutate(() => task);
}
