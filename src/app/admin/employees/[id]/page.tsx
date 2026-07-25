import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { IconInbox, IconClock, IconCheckCircle, IconTasks } from "@/components/icons";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

const PERIODS = {
  week: { label: "This week", days: 6 },
  month: { label: "This month", days: 29 },
  year: { label: "This year", days: 364 },
} as const;

export default async function AdminEmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string; period?: string }>;
}) {
  const { id } = await params;
  const { from: fromRaw, to: toRaw, period } = await searchParams;
  await requireUser("ADMIN");

  const today = startOfDay(new Date());
  const activePeriod = period && period in PERIODS ? (period as keyof typeof PERIODS) : null;

  let fromDate: Date;
  let toDate: Date;
  if (activePeriod) {
    fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - PERIODS[activePeriod].days);
    toDate = today;
  } else if (fromRaw || toRaw) {
    fromDate = fromRaw ? new Date(fromRaw + "T00:00:00") : new Date(new Date(today).setDate(today.getDate() - 13));
    toDate = toRaw ? new Date(toRaw + "T23:59:59") : today;
  } else {
    fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - 13);
    toDate = today;
  }
  const rangeEnd = new Date(toDate);
  rangeEnd.setHours(23, 59, 59, 999);

  const hasCustomRange = Boolean(fromRaw || toRaw || activePeriod);

  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      tasksAssigned: { orderBy: { createdAt: "desc" } },
      dailyUpdates: {
        where: { date: { gte: fromDate, lte: rangeEnd } },
        orderBy: { date: "desc" },
        include: { hourlyEntries: { include: { task: true } } },
      },
    },
  });

  if (!employee || employee.role !== "EMPLOYEE") {
    notFound();
  }

  const totalHours = employee.dailyUpdates.reduce(
    (sum, u) => sum + u.hourlyEntries.reduce((s, e) => s + e.hoursSpent, 0),
    0,
  );
  const daysSubmitted = employee.dailyUpdates.length;
  const totalDaysInRange = Math.max(1, Math.round((rangeEnd.getTime() - fromDate.getTime()) / 86_400_000) + 1);
  const tasksCompletedInRange = employee.tasksAssigned.filter(
    (t) =>
      (t.status === "DONE" || t.status === "REVIEWED") &&
      t.updatedAt >= fromDate &&
      t.updatedAt <= rangeEnd,
  ).length;
  const reviewedInRange = employee.tasksAssigned.filter(
    (t) => t.status === "REVIEWED" && t.rating != null && t.reviewedAt && t.reviewedAt >= fromDate && t.reviewedAt <= rangeEnd,
  );
  const avgRating =
    reviewedInRange.length > 0
      ? (reviewedInRange.reduce((s, t) => s + (t.rating ?? 0), 0) / reviewedInRange.length).toFixed(1)
      : null;

  const periodQuery = (p: keyof typeof PERIODS) => `/admin/employees/${employee.id}?period=${p}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{employee.name}</h1>
        <p className="text-sm text-slate-500">{employee.email}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Work report</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((p) => (
              <Link
                key={p}
                href={periodQuery(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activePeriod === p
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {PERIODS[p].label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <IconClock className="h-3.5 w-3.5" /> Hours logged
            </div>
            <p className="mt-1 text-xl font-semibold text-slate-900">{totalHours}h</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <IconInbox className="h-3.5 w-3.5" /> Days updated
            </div>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {daysSubmitted}/{totalDaysInRange}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <IconCheckCircle className="h-3.5 w-3.5" /> Tasks completed
            </div>
            <p className="mt-1 text-xl font-semibold text-slate-900">{tasksCompletedInRange}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <IconTasks className="h-3.5 w-3.5" /> Avg. review rating
            </div>
            <p className="mt-1 text-xl font-semibold text-slate-900">{avgRating ? `${avgRating}/5` : "—"}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {fromDate.toLocaleDateString()} &ndash; {toDate.toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Tasks (all time)</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {employee.tasksAssigned.map((task) => (
              <li key={task.id} className="flex items-center justify-between px-4 py-3">
                <Link href={`/admin/tasks/${task.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                  {task.title}
                </Link>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}>
                  {task.status.replace("_", " ")}
                </span>
              </li>
            ))}
            {employee.tasksAssigned.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">No tasks yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Daily updates history</h2>
            <form className="flex flex-wrap items-end gap-2 text-xs">
              <div>
                <label className="block text-slate-500">From</label>
                <input
                  type="date"
                  name="from"
                  defaultValue={toDateInputValue(fromDate)}
                  className="mt-1 rounded-md border border-slate-300 px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-slate-500">To</label>
                <input
                  type="date"
                  name="to"
                  defaultValue={toDateInputValue(toDate)}
                  className="mt-1 rounded-md border border-slate-300 px-2 py-1"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white transition-colors hover:bg-slate-700"
              >
                View
              </button>
              {hasCustomRange && (
                <Link
                  href={`/admin/employees/${employee.id}`}
                  className="rounded-md border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Reset to last 14 days
                </Link>
              )}
            </form>
          </div>
          <ul className="divide-y divide-slate-100">
            {employee.dailyUpdates.map((update) => (
              <li key={update.id} className="px-4 py-3">
                <p className="text-xs font-medium text-slate-500">
                  {new Date(update.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{update.summary}</p>
                {update.hourlyEntries.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {update.hourlyEntries.map((entry) => (
                      <span
                        key={entry.id}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                        title={entry.note ?? undefined}
                      >
                        {entry.hour}:00 · {entry.hoursSpent}h{entry.task ? ` · ${entry.task.title}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
            {employee.dailyUpdates.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-400">
                <IconInbox className="h-6 w-6 text-slate-300" />
                No updates in this date range.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
