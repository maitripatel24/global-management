import { IconClock, IconArrowRight, IconCheckCircle, IconStar } from "@/components/icons";

const STATUS_CONFIG = {
  PENDING: { label: "To do", color: "bg-slate-100 text-slate-700", Icon: IconClock },
  IN_PROGRESS: { label: "In progress", color: "bg-blue-100 text-blue-700", Icon: IconArrowRight },
  DONE: { label: "Done", color: "bg-green-100 text-green-700", Icon: IconCheckCircle },
  REVIEWED: { label: "Reviewed", color: "bg-purple-100 text-purple-700", Icon: IconStar },
} as const;

export function StatusBadge({
  status,
  size = "md",
}: {
  status: keyof typeof STATUS_CONFIG | string;
  size?: "md" | "lg";
}) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const { label, color, Icon } = config;

  if (size === "lg") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ${color}`}>
        <Icon className="h-4 w-4" />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
