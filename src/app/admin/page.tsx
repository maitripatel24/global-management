import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboard() {
  await requireUser("ADMIN");
  const date = todayStart();

  const [employees, tasks, todaysUpdates, recentUpdates] = await Promise.all([
    prisma.user.findMany({ where: { role: "EMPLOYEE", active: true } }),
    prisma.task.findMany(),
    prisma.dailyUpdate.count({ where: { date } }),
    prisma.dailyUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true },
    }),
  ]);

  const statusCounts = {
    PENDING: tasks.filter((t) => t.status === "PENDING").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
    REVIEWED: tasks.filter((t) => t.status === "REVIEWED").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Employees" value={employees.length} />
        <StatCard label="Open tasks" value={statusCounts.PENDING + statusCounts.IN_PROGRESS} />
        <StatCard label="Awaiting review" value={statusCounts.DONE} />
        <StatCard
          label="Updates submitted today"
          value={`${todaysUpdates}/${employees.length}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Tasks awaiting your review</h2>
            <Link href="/admin/tasks" className="text-xs text-slate-500 underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {tasks
              .filter((t) => t.status === "DONE")
              .slice(0, 5)
              .map((t) => (
                <li key={t.id} className="px-4 py-3">
                  <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                    {t.title}
                  </Link>
                </li>
              ))}
            {statusCounts.DONE === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">Nothing awaiting review.</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Recent daily updates</h2>
            <Link href="/admin/employees" className="text-xs text-slate-500 underline">
              View employees
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentUpdates.map((u) => (
              <li key={u.id} className="px-4 py-3">
                <Link href={`/admin/employees/${u.userId}`} className="text-sm font-medium text-slate-800 hover:underline">
                  {u.user.name}
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{u.summary}</p>
              </li>
            ))}
            {recentUpdates.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">No updates yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
