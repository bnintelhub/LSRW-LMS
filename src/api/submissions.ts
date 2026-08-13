import { apiGet, apiMutate } from "./client";
import type { Submission } from "../types/progress";

export async function getSubmissions(items: Submission[]) {
  return apiGet(() => items);
}

export async function createSubmission(item: Submission) {
  return apiMutate(() => item);
}

export async function reviewSubmission(item: Submission) {
  return apiMutate(() => item);
}
