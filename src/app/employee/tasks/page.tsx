import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

const priorityStyles: Record<string, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-600",
};

export default async function EmployeeTasksPage() {
  const user = await requireUser("EMPLOYEE");

  const tasks = await prisma.task.findMany({
    where: { assignedToId: user.id },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">My Tasks</h1>
      <div className="rounded-lg border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {tasks.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-400">No tasks assigned yet.</li>
          )}
          {tasks.map((task) => (
            <li key={task.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <Link href={`/employee/tasks/${task.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                  {task.title}
                </Link>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}>
                  {task.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span className={priorityStyles[task.priority]}>{task.priority} priority</span>
                {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
