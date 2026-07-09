import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

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
        <h1 className="text-xl font-semibold text-slate-900">Welcome, {user.name}</h1>
        <p className="text-sm text-slate-500">Here&apos;s what&apos;s on your plate today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Open tasks</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{openTasks.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Completed tasks</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{doneCount}</p>
        </div>
        <div className={`rounded-lg border p-4 ${todaysUpdate ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-xs text-slate-500">Today&apos;s update</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {todaysUpdate ? "Submitted" : "Not submitted yet"}
          </p>
          <Link href="/employee/daily-update" className="mt-2 inline-block text-xs font-medium text-slate-900 underline">
            {todaysUpdate ? "Edit update" : "Submit now"}
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">My tasks</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {tasks.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-400">No tasks assigned yet.</li>
          )}
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/employee/tasks/${task.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                {task.title}
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}>
                {task.status.replace("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
