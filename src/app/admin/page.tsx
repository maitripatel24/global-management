import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { CreateCompanyForm } from "@/components/CreateCompanyForm";
import { ToggleCompanyActiveButton } from "@/components/ToggleCompanyActiveButton";
import { dueUrgency } from "@/lib/dueDate";
import {
  IconUsers,
  IconTasks,
  IconCheckCircle,
  IconInbox,
  IconArrowRight,
  IconBuilding,
} from "@/components/icons";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDashboard() {
  const user = await requireUser("ADMIN");
  const date = todayStart();

  const [employees, tasks, todaysUpdates, recentUpdates, companies] = await Promise.all([
    prisma.user.findMany({ where: { role: "EMPLOYEE", active: true } }),
    prisma.task.findMany(),
    prisma.dailyUpdate.count({ where: { date } }),
    prisma.dailyUpdate.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true },
    }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      include: { tasks: { select: { status: true, dueDate: true } } },
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
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome back, {user.name}</h1>
        <p className="text-sm text-slate-500">Here&apos;s how the team is doing today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Employees" value={employees.length} icon={<IconUsers />} color="purple" href="/admin/employees" />
        <StatCard
          label="Open tasks"
          value={statusCounts.PENDING + statusCounts.IN_PROGRESS}
          icon={<IconTasks />}
          color="blue"
          href="/admin/tasks?filter=open"
        />
        <StatCard
          label="Awaiting review"
          value={statusCounts.DONE}
          icon={<IconCheckCircle />}
          color="amber"
          href="/admin/tasks?filter=review"
        />
        <StatCard
          label="Updates submitted today"
          value={`${todaysUpdates}/${employees.length}`}
          icon={<IconInbox />}
          color="green"
          href="/admin/updates"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Tasks awaiting your review</h2>
            <Link
              href="/admin/tasks?filter=review"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
            >
              View all <IconArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {tasks
              .filter((t) => t.status === "DONE")
              .slice(0, 5)
              .map((t) => (
                <li key={t.id} className="px-4 py-3 transition-colors hover:bg-slate-50">
                  <Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                    {t.title}
                  </Link>
                </li>
              ))}
            {statusCounts.DONE === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-400">
                <IconCheckCircle className="h-6 w-6 text-slate-300" />
                Nothing awaiting review.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Recent daily updates</h2>
            <Link href="/admin/employees" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
              View employees <IconArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentUpdates.map((u) => (
              <li key={u.id} className="px-4 py-3 transition-colors hover:bg-slate-50">
                <Link href={`/admin/employees/${u.userId}`} className="text-sm font-medium text-slate-800 hover:underline">
                  {u.user.name}
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{u.summary}</p>
              </li>
            ))}
            {recentUpdates.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-400">
                <IconInbox className="h-6 w-6 text-slate-300" />
                No updates yet.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <IconBuilding className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">Companies</h2>
        </div>
        <div className="border-b border-slate-100 p-4">
          <CreateCompanyForm />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Open tasks</th>
                <th className="px-4 py-2">Overdue</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => {
                const open = c.tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
                const overdue = c.tasks.filter((t) => dueUrgency(t.dueDate, t.status) === "overdue").length;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/companies/${c.id}`} className="font-medium text-slate-800 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.code ?? "—"}</td>
                    <td className="px-4 py-3">{open}</td>
                    <td className="px-4 py-3">
                      {overdue > 0 ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {overdue} overdue
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleCompanyActiveButton companyId={c.id} active={c.active} />
                    </td>
                  </tr>
                );
              })}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    No companies yet. Add your first one above.
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
