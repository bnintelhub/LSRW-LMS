import type { Scores, Skill } from "../types/crm";
import type { Profile, Student, Teacher } from "../types/student";

export const skills: Skill[] = ["Listening", "Speaking", "Reading", "Writing"];

const names = [
  "Aarav Sharma",
  "Diya Patel",
  "Vivaan Singh",
  "Anaya Gupta",
  "Kabir Mehta",
  "Ira Nair",
  "Arjun Reddy",
  "Myra Iyer",
  "Reyansh Khan",
  "Saanvi Rao",
  "Rohan Verma",
  "Kiara Das",
  "Advik Jain",
  "Simran Kaur",
  "Vihaan Joshi",
  "Nisha Menon",
  "Dev Malhotra",
  "Tara Bose",
  "Atharv Kulkarni",
  "Mira Chatterjee",
  "Yash Bansal",
  "Avni Saxena",
];

export const defaultTeachers: Teacher[] = [
  {
    id: "t-foundation",
    name: "Meera Kapoor",
    userId: "teacher13",
    password: "teach123",
    active: true,
    band: "Foundational",
    allotted: [
      { classNumber: 1, section: "A" },
      { classNumber: 2, section: "A" },
      { classNumber: 3, section: "A" },
    ],
  },
  {
    id: "t-elementary",
    name: "Rahul Menon",
    userId: "teacher47",
    password: "teach123",
    active: true,
    band: "Elementary",
    allotted: [
      { classNumber: 4, section: "A" },
      { classNumber: 5, section: "A" },
      { classNumber: 6, section: "A" },
      { classNumber: 7, section: "A" },
    ],
  },
  {
    id: "t-exam",
    name: "Nandita Rao",
    userId: "teacher810",
    password: "teach123",
    active: true,
    band: "Exam-Track",
    allotted: [
      { classNumber: 8, section: "A" },
      { classNumber: 9, section: "A" },
      { classNumber: 10, section: "A" },
    ],
  },
  {
    id: "t-advanced",
    name: "Arvind Iyer",
    userId: "teacher1112",
    password: "teach123",
    active: true,
    band: "Advanced",
    allotted: [
      { classNumber: 11, section: "A" },
      { classNumber: 12, section: "A" },
    ],
  },
  {
    id: "t-lab-a",
    name: "Fatima Sheikh",
    userId: "teacherlab",
    password: "teach123",
    active: true,
    band: "Elementary",
    allotted: [
      { classNumber: 2, section: "B" },
      { classNumber: 6, section: "B" },
      { classNumber: 9, section: "B" },
    ],
  },
  {
    id: "t-lab-b",
    name: "Joseph Dsouza",
    userId: "teacherpro",
    password: "teach123",
    active: true,
    band: "Advanced",
    allotted: [
      { classNumber: 10, section: "B" },
      { classNumber: 11, section: "B" },
      { classNumber: 12, section: "B" },
    ],
  },
];

export function scoreFor(classNumber: number, roll: number, skill: Skill) {
  const index = skills.indexOf(skill) + 1;
  return Math.min(96, 54 + classNumber * 2 + ((roll * index * 7) % 28));
}

export function credentialUserId(classNumber: number, section: string, roll: number) {
  return `DPS${String(classNumber).padStart(2, "0")}${section}${String(roll).padStart(2, "0")}`;
}

export function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function generateStudents(): Student[] {
  return Array.from({ length: 12 }, (_, classIndex) => {
    const classNumber = classIndex + 1;
    return names.map((name, idx) => {
      const roll = idx + 1;
      const section: "A" | "B" = roll <= 11 ? "A" : "B";
      const scores = skills.reduce(
        (acc, skill) => ({ ...acc, [skill]: scoreFor(classNumber, roll, skill) }),
        {} as Scores,
      );
      return {
        id: `stu-${classNumber}-${roll}`,
        name,
        classNumber,
        section,
        roll,
        mobile: `98XXXX${String(classNumber).padStart(2, "0")}${String(roll).padStart(2, "0")}`,
        dob: `${String((roll % 27) + 1).padStart(2, "0")}-04-${2018 - classNumber}`,
        userId: credentialUserId(classNumber, section, roll),
        password: `Lab${classNumber}@${String(roll).padStart(2, "0")}`,
        scores,
        xp: 700 + classNumber * 90 + roll * 13,
        streak: (roll % 8) + 1,
        coins: 40 + classNumber * 5 + roll,
        badges: [],
        lastActiveDate: "",
      };
    });
  }).flat();
}

export type { Profile };
