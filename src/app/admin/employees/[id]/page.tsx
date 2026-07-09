import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

export default async function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser("ADMIN");

  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      tasksAssigned: { orderBy: { createdAt: "desc" } },
      dailyUpdates: {
        orderBy: { date: "desc" },
        take: 14,
        include: { hourlyEntries: { include: { task: true } } },
      },
    },
  });

  if (!employee || employee.role !== "EMPLOYEE") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{employee.name}</h1>
        <p className="text-sm text-slate-500">{employee.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">Tasks</h2>
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
            <h2 className="text-sm font-semibold text-slate-800">Daily updates</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {employee.dailyUpdates.map((update) => (
              <li key={update.id} className="px-4 py-3">
                <p className="text-xs font-medium text-slate-500">
                  {new Date(update.date).toLocaleDateString(undefined, {
                    weekday: "short",
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
              <li className="px-4 py-6 text-center text-sm text-slate-400">No updates submitted yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
