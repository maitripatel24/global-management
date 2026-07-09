"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HourlyEfficiencyPoint } from "@/lib/analytics";

export function EfficiencyChart({ data }: { data: HourlyEfficiencyPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="hours" tick={{ fontSize: 12 }} label={{ value: "Hours logged", angle: -90, position: "insideLeft", fontSize: 12 }} />
          <YAxis
            yAxisId="efficiency"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: "Efficiency %", angle: 90, position: "insideRight", fontSize: 12 }}
          />
          <Tooltip />
          <Legend />
          <Bar yAxisId="hours" dataKey="totalHours" name="Hours logged" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="efficiency"
            type="monotone"
            dataKey="efficiency"
            name="Efficiency %"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
