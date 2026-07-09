import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getHourlyEfficiency } from "@/lib/analytics";
import { EfficiencyChart } from "@/components/EfficiencyChart";
import { EmployeeFilterSelect } from "@/components/EmployeeFilterSelect";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>;
}) {
  await requireUser("ADMIN");
  const { employeeId } = await searchParams;

  const [employees, data] = await Promise.all([
    prisma.user.findMany({ where: { role: "EMPLOYEE" }, select: { id: true, name: true } }),
    getHourlyEfficiency(30, employeeId),
  ]);

  const totalHours = data.reduce((sum, d) => sum + d.totalHours, 0);
  const totalProductive = data.reduce((sum, d) => sum + d.productiveHours, 0);
  const overallEfficiency = totalHours > 0 ? Math.round((totalProductive / totalHours) * 1000) / 10 : 0;
  const peakHour = data.reduce((best, d) => (d.totalHours > (best?.totalHours ?? 0) ? d : best), data[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Work Efficiency Analytics</h1>
          <p className="text-sm text-slate-500">Hourly breakdown of logged work over the last 30 days</p>
        </div>
        <EmployeeFilterSelect employees={employees} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total hours logged</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalHours}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Overall efficiency</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{overallEfficiency}%</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Peak hour</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{peakHour?.label ?? "—"}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {totalHours === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">
            No hourly work log data yet. Data appears once employees submit daily updates with hourly breakdowns.
          </p>
        ) : (
          <EfficiencyChart data={data} />
        )}
      </div>
    </div>
  );
}
