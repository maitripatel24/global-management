import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ReviewTaskForm } from "@/components/ReviewTaskForm";
import { AttachmentsList } from "@/components/AttachmentsList";
import { EditTaskForm } from "@/components/EditTaskForm";
import { toDateInputValue } from "@/lib/dueDate";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser("ADMIN");

  const [task, employees, companies] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        assignedBy: true,
        company: true,
        attachments: { select: { id: true, fileName: true, size: true, mimeType: true } },
      },
    }),
    prisma.user.findMany({ where: { role: "EMPLOYEE", active: true }, select: { id: true, name: true } }),
    prisma.company.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{task.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Assigned to {task.assignedTo?.name ?? "no one yet"} by {task.assignedBy.name}
            {task.company && (
              <>
                {" · "}
                <Link href={`/admin/companies/${task.company.id}`} className="hover:underline">
                  {task.company.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[task.status]}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>

      <EditTaskForm
        task={{
          id: task.id,
          title: task.title,
          description: task.description,
          assignedToId: task.assignedToId,
          priority: task.priority,
          dueDate: task.dueDate ? toDateInputValue(task.dueDate) : null,
          companyId: task.companyId,
        }}
        employees={employees}
        companies={companies}
      />

      <AttachmentsList attachments={task.attachments} />

      {task.reviewComment ? (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-medium text-purple-900">Your review</p>
          <p className="mt-1 text-sm text-purple-800">{task.reviewComment}</p>
          <p className="mt-1 text-xs text-purple-700">Rating: {task.rating}/5</p>
        </div>
      ) : task.status === "DONE" ? (
        <ReviewTaskForm taskId={task.id} />
      ) : (
        <p className="text-sm text-slate-400">
          This task isn&apos;t marked as done yet, so it can&apos;t be reviewed.
        </p>
      )}
    </div>
  );
}
