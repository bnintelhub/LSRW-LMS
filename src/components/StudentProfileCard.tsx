import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { radarData } from "../lib/stats";
import type { Student } from "../types/student";

export function StudentProfileCard({ student }: { student: Student }) {
  return (
    <div>
      <h3 className="text-xl font-black">{student.name}</h3>
      <p className="text-slate-500">
        Class {student.classNumber}-{student.section} · User ID {student.userId}
      </p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData(student.scores)}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <Radar dataKey="score" fill="#f97316" fillOpacity={0.35} stroke="#f97316" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
