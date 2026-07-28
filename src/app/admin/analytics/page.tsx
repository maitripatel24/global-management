import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getHourlyLoad, getEmployeeWorkPatterns } from "@/lib/analytics";
import { EfficiencyChart } from "@/components/EfficiencyChart";
import { EmployeeFilterSelect } from "@/components/EmployeeFilterSelect";

const DAY_OPTIONS = [7, 30, 90] as const;

function utilizationStyle(percent: number | null) {
  if (percent === null) return "text-slate-400";
  if (percent >= 85) return "text-green-700 font-semibold";
  if (percent >= 60) return "text-amber-600 font-semibold";
  return "text-red-600 font-semibold";
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; days?: string }>;
}) {
  await requireUser("ADMIN");
  const { employeeId, days: daysRaw } = await searchParams;
  const days = DAY_OPTIONS.includes(Number(daysRaw) as (typeof DAY_OPTIONS)[number]) ? Number(daysRaw) : 30;

  const [employees, hourlyData, patterns] = await Promise.all([
    prisma.user.findMany({ where: { role: "EMPLOYEE" }, select: { id: true, name: true } }),
    getHourlyLoad(days, employeeId),
    getEmployeeWorkPatterns(days),
  ]);

  const totalHours = hourlyData.reduce((sum, d) => sum + d.totalHours, 0);
  const peakHour = hourlyData.reduce((best, d) => (d.totalHours > (best?.totalHours ?? 0) ? d : best), hourlyData[0]);
  const daysQuery = (d: number) => {
    const params = new URLSearchParams();
    if (employeeId) params.set("employeeId", employeeId);
    params.set("days", String(d));
    return `/admin/analytics?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Work Analytics</h1>
          <p className="text-sm text-slate-500">Based only on employees&apos; own daily-update submissions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {DAY_OPTIONS.map((d) => (
            <a
              key={d}
              href={daysQuery(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                days === d ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Last {d}d
            </a>
          ))}
          <EmployeeFilterSelect employees={employees} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total hours logged</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalHours}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Peak hour</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{peakHour?.label ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Employees with submissions</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {patterns.filter((p) => p.daysSubmitted > 0).length}/{patterns.length}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {totalHours === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">
            No hourly work log data yet. Data appears once employees submit daily updates with hourly breakdowns.
          </p>
        ) : (
          <EfficiencyChart data={hourlyData} />
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Employee work patterns</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Typical login window and time utilization &mdash; how much of that window was actually filled with logged
            work, not just whether tasks got marked done.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Typical window</th>
                <th className="px-4 py-2">Days submitted</th>
                <th className="px-4 py-2">Total hours</th>
                <th className="px-4 py-2">Avg hrs/day</th>
                <th className="px-4 py-2">Time utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patterns.map((p) => (
                <tr key={p.employeeId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.employeeName}</td>
                  <td className="px-4 py-3 text-slate-600">{p.windowLabel}</td>
                  <td className="px-4 py-3">{p.daysSubmitted}</td>
                  <td className="px-4 py-3">{p.totalHours}h</td>
                  <td className="px-4 py-3">{p.avgHoursPerDay}h</td>
                  <td className={`px-4 py-3 ${utilizationStyle(p.utilizationPercent)}`}>
                    {p.utilizationPercent !== null ? `${p.utilizationPercent}%` : "—"}
                  </td>
                </tr>
              ))}
              {patterns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No employees yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
