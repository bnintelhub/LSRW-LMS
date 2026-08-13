import type { Scores } from "./crm";

export type Role = "admin" | "teacher" | "student";
export type Profile = "Foundational" | "Elementary" | "Exam-Track" | "Advanced";

export type Student = {
  id: string;
  name: string;
  classNumber: number;
  section: "A" | "B";
  roll: number;
  mobile: string;
  dob: string;
  userId: string;
  password: string;
  scores: Scores;
  xp: number;
  streak: number;
  coins: number;
  badges: string[];
  lastActiveDate: string;
};

export type Teacher = {
  id: string;
  name: string;
  userId: string;
  password: string;
  band: Profile;
  allotted: { classNumber: number; section: "A" | "B" }[];
  active: boolean;
};
