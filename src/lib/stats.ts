import { skills } from "../data/seed";
import type { Scores } from "../types/crm";
import type { Student } from "../types/student";

export function average(scores: Scores) {
  return Math.round(skills.reduce((sum, skill) => sum + scores[skill], 0) / skills.length);
}

export function classAverage(students: Student[], classNumber: number) {
  const classStudents = students.filter((student) => student.classNumber === classNumber);
  if (!classStudents.length) return 0;
  return Math.round(
    classStudents.reduce((sum, student) => sum + average(student.scores), 0) / classStudents.length,
  );
}

export function radarData(scores: Scores) {
  return skills.map((skill) => ({ skill, score: scores[skill] }));
}
