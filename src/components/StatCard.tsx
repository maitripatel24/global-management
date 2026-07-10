import type { ReactNode } from "react";

const colorMap = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  purple: "bg-purple-100 text-purple-700",
} as const;

export function StatCard({
  label,
  value,
  icon,
  color = "slate",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: keyof typeof colorMap;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`}>
        {icon}
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
