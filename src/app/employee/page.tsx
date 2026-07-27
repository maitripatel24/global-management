import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { IconTasks, IconCheckCircle, IconInbox, IconClock } from "@/components/icons";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function EmployeeDashboard() {
  const user = await requireUser("EMPLOYEE");

  const [tasks, todaysUpdate] = await Promise.all([
    prisma.task.findMany({
      where: { assignedToId: user.id },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    prisma.dailyUpdate.findUnique({
      where: { userId_date: { userId: user.id, date: todayStart() } },
    }),
  ]);

  const openTasks = tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS");
  const doneCount = tasks.filter((t) => t.status === "DONE" || t.status === "REVIEWED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
        <p className="mt-1 text-base text-slate-500">Here&apos;s what&apos;s on your plate today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Open tasks"
          value={openTasks.length}
          icon={<IconTasks className="h-7 w-7" />}
          color="blue"
          href="/employee/tasks"
          size="lg"
        />
        <StatCard
          label="Completed tasks"
          value={doneCount}
          icon={<IconCheckCircle className="h-7 w-7" />}
          color="green"
          href="/employee/tasks"
          size="lg"
        />
        <Link
          href="/employee/daily-update"
          className={`group flex items-center gap-3 rounded-lg border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
            todaysUpdate ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${
              todaysUpdate ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {todaysUpdate ? <IconCheckCircle className="h-7 w-7" /> : <IconClock className="h-7 w-7" />}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Today&apos;s update</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900">
              {todaysUpdate ? "Submitted" : "Not done yet"}
            </p>
            <span className="text-sm font-semibold text-slate-700 underline">
              {todaysUpdate ? "Edit update" : "Submit now"}
            </span>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-800">My tasks</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {tasks.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-4 py-10 text-center text-base text-slate-400">
              <IconInbox className="h-8 w-8 text-slate-300" />
              No tasks assigned yet.
            </li>
          )}
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/employee/tasks/${task.id}`}
                className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-slate-50"
              >
                <span className="text-base font-medium text-slate-800">{task.title}</span>
                <StatusBadge status={task.status} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
