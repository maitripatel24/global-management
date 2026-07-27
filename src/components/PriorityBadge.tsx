import { IconAlert } from "@/components/icons";

const PRIORITY_CONFIG = {
  LOW: { label: "Low priority", color: "bg-slate-100 text-slate-600", showIcon: false },
  MEDIUM: { label: "Medium priority", color: "bg-amber-100 text-amber-700", showIcon: true },
  HIGH: { label: "High priority", color: "bg-red-100 text-red-700", showIcon: true },
} as const;

export function PriorityBadge({
  priority,
  size = "md",
}: {
  priority: keyof typeof PRIORITY_CONFIG | string;
  size?: "md" | "lg";
}) {
  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.LOW;
  const { label, color, showIcon } = config;

  if (size === "lg") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ${color}`}>
        {showIcon && <IconAlert className="h-4 w-4" />}
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      {showIcon && <IconAlert className="h-3 w-3" />}
      {label}
    </span>
  );
}
