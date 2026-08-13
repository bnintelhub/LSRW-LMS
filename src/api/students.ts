import { apiGet, apiMutate } from "./client";
import type { Student } from "../types/student";
import { leaderboardFor } from "../lib/scoring";

let getStudentsFn: () => Student[] = () => [];

export function bindStudentStore(getStudents: () => Student[]) {
  getStudentsFn = getStudents;
}

export async function getStudents() {
  return apiGet(() => getStudentsFn());
}

export async function getLeaderboard(classNumber: number, section: "A" | "B") {
  return apiGet(() => leaderboardFor(getStudentsFn(), classNumber, section));
}

export async function updateStudent(student: Student) {
  return apiMutate(() => student);
}
