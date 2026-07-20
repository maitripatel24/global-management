export type DueUrgency = "overdue" | "soon" | "normal" | "none";

const DUE_SOON_DAYS = 3;

export function dueUrgency(dueDate: Date | null, status: string): DueUrgency {
  if (!dueDate || status === "DONE" || status === "REVIEWED") return "none";

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate);
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / 86_400_000);

  if (diffDays < 0) return "overdue";
  if (diffDays <= DUE_SOON_DAYS) return "soon";
  return "normal";
}

export const dueUrgencyStyles: Record<DueUrgency, string> = {
  overdue: "text-red-600 font-medium",
  soon: "text-amber-600 font-medium",
  normal: "text-slate-500",
  none: "text-slate-400",
};

export const dueUrgencyBadge: Record<DueUrgency, string> = {
  overdue: "bg-red-100 text-red-700",
  soon: "bg-amber-100 text-amber-700",
  normal: "bg-slate-100 text-slate-600",
  none: "",
};
