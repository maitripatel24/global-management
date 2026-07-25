import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { REPORT_PERIODS, resolveReportPeriod } from "@/lib/reportPeriod";

export default async function AdminEmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireUser("ADMIN");
  const { period } = await searchParams;
  const { activePeriod, fromDate, rangeEnd, totalDaysInRange } = resolveReportPeriod(period);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { name: "asc" },
    include: {
      tasksAssigned: true,
      dailyUpdates: {
        where: { date: { gte: fromDate, lte: rangeEnd } },
        include: { hourlyEntries: true },
      },
    },
  });

  const employeesWithReport = employees.map((emp) => {
    const submittedToday = emp.dailyUpdates.some((u) => u.date.toDateString() === today.toDateString());
    const openTasks = emp.tasksAssigned.filter(
      (t) => t.status === "PENDING" || t.status === "IN_PROGRESS",
    ).length;
    const completedInRange = emp.tasksAssigned.filter(
      (t) =>
        (t.status === "DONE" || t.status === "REVIEWED") &&
        t.updatedAt >= fromDate &&
        t.updatedAt <= rangeEnd,
    ).length;
    const reviewedInRange = emp.tasksAssigned.filter(
      (t) => t.status === "REVIEWED" && t.rating != null && t.reviewedAt && t.reviewedAt >= fromDate && t.reviewedAt <= rangeEnd,
    );
    const avgRating =
      reviewedInRange.length > 0
        ? (reviewedInRange.reduce((s, t) => s + (t.rating ?? 0), 0) / reviewedInRange.length).toFixed(1)
        : null;
    const hoursLogged = emp.dailyUpdates.reduce(
      (sum, u) => sum + u.hourlyEntries.reduce((s, e) => s + e.hoursSpent, 0),
      0,
    );
    return {
      ...emp,
      submittedToday,
      openTasks,
      completedInRange,
      avgRating,
      hoursLogged,
      daysUpdated: emp.dailyUpdates.length,
    };
  });

  const periodQuery = (p: keyof typeof REPORT_PERIODS) => `/admin/employees?period=${p}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Employees</h1>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(REPORT_PERIODS) as (keyof typeof REPORT_PERIODS)[]).map((p) => (
            <Link
              key={p}
              href={periodQuery(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activePeriod === p
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {REPORT_PERIODS[p].label}
            </Link>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Overview for {REPORT_PERIODS[activePeriod].label.toLowerCase()} &middot; {fromDate.toLocaleDateString()} &ndash;{" "}
        {rangeEnd.toLocaleDateString()}
      </p>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Open tasks</th>
              <th className="px-4 py-2">Today&apos;s update</th>
              <th className="px-4 py-2">Hours logged</th>
              <th className="px-4 py-2">Days updated</th>
              <th className="px-4 py-2">Tasks completed</th>
              <th className="px-4 py-2">Avg. rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employeesWithReport.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/employees/${emp.id}?period=${activePeriod}`} className="font-medium text-slate-800 hover:underline">
                    {emp.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{emp.email}</td>
                <td className="px-4 py-3">{emp.openTasks}</td>
                <td className="px-4 py-3">
                  {emp.submittedToday ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Submitted
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{emp.hoursLogged}h</td>
                <td className="px-4 py-3">
                  {emp.daysUpdated}/{totalDaysInRange}
                </td>
                <td className="px-4 py-3">{emp.completedInRange}</td>
                <td className="px-4 py-3">{emp.avgRating ? `${emp.avgRating}/5` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
