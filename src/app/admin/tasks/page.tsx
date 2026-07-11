import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { IconPaperclip } from "@/components/icons";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

export default async function AdminTasksPage() {
  await requireUser("ADMIN");

  const [tasks, employees] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { assignedTo: true, _count: { select: { attachments: true } } },
    }),
    prisma.user.findMany({ where: { role: "EMPLOYEE", active: true }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Assign a new task</h2>
        <CreateTaskForm employees={employees} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Assignee</th>
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/tasks/${task.id}`}
                    className="inline-flex items-center gap-1.5 font-medium text-slate-800 hover:underline"
                  >
                    {task.title}
                    {task._count.attachments > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-normal text-slate-400">
                        <IconPaperclip className="h-3 w-3" />
                        {task._count.attachments}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{task.assignedTo.name}</td>
                <td className="px-4 py-3 text-slate-500">{task.priority}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                  No tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
