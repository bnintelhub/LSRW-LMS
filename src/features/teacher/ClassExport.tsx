import * as XLSX from "xlsx";
import type { Student } from "../../types/student";
import type { DailyTask } from "../../types/crm";
import type { AttendanceRecord, Submission } from "../../types/progress";

function average(student: Student) {
  return Math.round(
    (student.scores.Listening + student.scores.Speaking + student.scores.Reading + student.scores.Writing) / 4,
  );
}

export function exportClassReport(options: {
  classNumber: number;
  section: "A" | "B";
  date: string;
  students: Student[];
  tasks: DailyTask[];
  attendance: AttendanceRecord[];
  submissions: Submission[];
}) {
  const { classNumber, section, date, students, tasks, attendance, submissions } = options;
  const rows = students.map((student) => {
    const mark = attendance.find((row) => row.studentId === student.id);
    const done = tasks.filter((task) => task.completedBy.includes(student.id)).length;
    const pending = submissions.filter((item) => item.studentId === student.id && item.status === "pending").length;
    return {
      Name: student.name,
      Roll: student.roll,
      Class: `${classNumber}-${section}`,
      Attendance: mark?.status ?? "—",
      Listening: student.scores.Listening,
      Speaking: student.scores.Speaking,
      Reading: student.scores.Reading,
      Writing: student.scores.Writing,
      Average: average(student),
      XP: student.xp,
      "Tasks done": `${done}/${tasks.length}`,
      "Pending reviews": pending,
    };
  });
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Class Report");
  XLSX.writeFile(workbook, `LSRW-Class-${classNumber}-${section}-${date}.xlsx`);
}
