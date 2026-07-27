import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { IconPaperclip, IconBuilding, IconClock, IconInbox } from "@/components/icons";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { dueUrgency, dueUrgencyStyles } from "@/lib/dueDate";

export default async function EmployeeTasksPage() {
  const user = await requireUser("EMPLOYEE");

  const tasks = await prisma.task.findMany({
    where: { assignedToId: user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: { company: true, _count: { select: { attachments: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white py-14 text-center text-base text-slate-400">
          <IconInbox className="h-8 w-8 text-slate-300" />
          No tasks assigned yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tasks.map((task) => {
          const urgency = dueUrgency(task.dueDate, task.status);
          return (
            <Link
              key={task.id}
              href={`/employee/tasks/${task.id}`}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg font-semibold text-slate-900">{task.title}</span>
                {task._count.attachments > 0 && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                    <IconPaperclip className="h-3.5 w-3.5" />
                    {task._count.attachments}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} size="lg" />
                <PriorityBadge priority={task.priority} size="lg" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                {task.company && (
                  <span className="flex items-center gap-1">
                    <IconBuilding className="h-4 w-4" />
                    {task.company.name}
                  </span>
                )}
                {task.dueDate && (
                  <span className={`flex items-center gap-1 font-medium ${dueUrgencyStyles[urgency]}`}>
                    <IconClock className="h-4 w-4" />
                    Due {new Date(task.dueDate).toLocaleDateString()}
                    {urgency === "overdue" ? " (overdue)" : urgency === "soon" ? " (soon)" : ""}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
