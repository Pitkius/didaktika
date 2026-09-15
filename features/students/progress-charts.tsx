"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { lt } from "@/lib/i18n";

interface ProgressChartsProps {
  accuracyTrend: Array<{ date: string; accuracy: number }>;
  skillData: Array<{ name: string; accuracy: number; mastery: number }>;
}

export function ProgressCharts({ accuracyTrend, skillData }: ProgressChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-le border border-neutral-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-medium text-neutral-700">{lt.student.accuracyOverTime}</h3>
        {accuracyTrend.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">{lt.student.noAttemptData}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={accuracyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-le border border-neutral-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-medium text-neutral-700">{lt.student.skillAccuracy}</h3>
        {skillData.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">{lt.student.noLearningProfiles}</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={skillData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
