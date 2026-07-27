import Link from "next/link";
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
  href,
  size = "md",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: keyof typeof colorMap;
  href?: string;
  size?: "md" | "lg";
}) {
  const large = size === "lg";

  const content = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg ${colorMap[color]} ${
          large ? "h-14 w-14" : "h-10 w-10"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className={large ? "text-sm font-medium text-slate-500" : "text-xs text-slate-500"}>{label}</p>
        <p className={`mt-0.5 font-semibold text-slate-900 ${large ? "text-3xl" : "text-2xl"}`}>{value}</p>
      </div>
    </>
  );

  const className = `group flex items-center gap-3 rounded-lg border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 ${
    large ? "p-5" : "p-4"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
