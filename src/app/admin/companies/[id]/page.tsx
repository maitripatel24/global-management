import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { IconPaperclip } from "@/components/icons";
import { dueUrgency, dueUrgencyStyles } from "@/lib/dueDate";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser("ADMIN");

  const [company, employees, companies] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: [{ status: "asc" }, { dueDate: "asc" }],
          include: { assignedTo: true, assignedBy: true, _count: { select: { attachments: true } } },
        },
      },
    }),
    prisma.user.findMany({ where: { role: "EMPLOYEE", active: true }, select: { id: true, name: true } }),
    prisma.company.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!company) {
    notFound();
  }

  const openCount = company.tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
  const overdueCount = company.tasks.filter((t) => dueUrgency(t.dueDate, t.status) === "overdue").length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/companies" className="text-xs text-slate-500 hover:text-slate-800">
          &larr; All companies
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          {company.name} {company.code && <span className="text-sm font-normal text-slate-400">({company.code})</span>}
        </h1>
        <p className="text-sm text-slate-500">
          {openCount} open task{openCount === 1 ? "" : "s"}
          {overdueCount > 0 && <span className="ml-2 font-medium text-red-600">{overdueCount} overdue</span>}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Assign a task for {company.name}</h2>
        <CreateTaskForm employees={employees} companies={companies} defaultCompanyId={company.id} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Assignee</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {company.tasks.map((task) => {
                const urgency = dueUrgency(task.dueDate, task.status);
                return (
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
                    <td className="px-4 py-3 text-slate-600">
                      {task.assignedTo.name}
                      <span className="block text-xs text-slate-400">by {task.assignedBy.name}</span>
                    </td>
                    <td className={`px-4 py-3 ${dueUrgencyStyles[urgency]}`}>
                      {task.dueDate
                        ? `${task.dueDate.toLocaleDateString()}${urgency === "overdue" ? " (overdue)" : urgency === "soon" ? " (soon)" : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {company.tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                    No tasks for this company yet.
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
