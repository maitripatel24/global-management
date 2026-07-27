import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateSelfTaskForm } from "@/components/CreateSelfTaskForm";
import { StatusBadge } from "@/components/StatusBadge";
import { IconPaperclip, IconUsers, IconClock, IconInbox } from "@/components/icons";
import { dueUrgency, dueUrgencyStyles } from "@/lib/dueDate";

export default async function EmployeeCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("EMPLOYEE");

  const [company, companies] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        tasks: {
          where: { assignedToId: user.id },
          orderBy: [{ status: "asc" }, { dueDate: "asc" }],
          include: { assignedBy: true, _count: { select: { attachments: true } } },
        },
      },
    }),
    prisma.company.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/employee/companies" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          &larr; All companies
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {company.name} {company.code && <span className="text-base font-normal text-slate-400">({company.code})</span>}
        </h1>
        <p className="mt-1 text-base text-slate-500">Your tasks for this company</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Create a task for yourself</h2>
        <CreateSelfTaskForm companies={companies} defaultCompanyId={company.id} />
      </div>

      {company.tasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white py-14 text-center text-base text-slate-400">
          <IconInbox className="h-8 w-8 text-slate-300" />
          You have no tasks for this company yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {company.tasks.map((task) => {
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
              <StatusBadge status={task.status} size="lg" />
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <IconUsers className="h-4 w-4" />
                  {task.assignedBy.name}
                </span>
                {task.dueDate && (
                  <span className={`flex items-center gap-1 font-medium ${dueUrgencyStyles[urgency]}`}>
                    <IconClock className="h-4 w-4" />
                    {task.dueDate.toLocaleDateString()}
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
