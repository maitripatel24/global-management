import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TaskStatusActions } from "@/components/TaskStatusActions";
import { AttachmentsList } from "@/components/AttachmentsList";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { IconUsers, IconBuilding, IconClock, IconStar } from "@/components/icons";

export default async function EmployeeTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("EMPLOYEE");

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignedBy: true,
      company: true,
      attachments: { select: { id: true, fileName: true, size: true, mimeType: true } },
    },
  });

  if (!task || task.assignedToId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
          <StatusBadge status={task.status} size="lg" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <IconUsers className="h-4 w-4" />
            Assigned by {task.assignedBy.name}
          </span>
          {task.company && (
            <span className="flex items-center gap-1">
              <IconBuilding className="h-4 w-4" />
              {task.company.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <PriorityBadge priority={task.priority} size="lg" />
        {task.dueDate && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700">
            <IconClock className="h-4 w-4" />
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-base leading-relaxed whitespace-pre-wrap text-slate-700">{task.description}</p>
      </div>

      <AttachmentsList attachments={task.attachments} />

      <TaskStatusActions taskId={task.id} status={task.status} />

      {task.reviewComment && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-5">
          <p className="flex items-center gap-1.5 text-base font-semibold text-purple-900">
            <IconStar className="h-4 w-4" />
            Admin review
          </p>
          <p className="mt-2 text-base text-purple-800">{task.reviewComment}</p>
          {task.rating && <p className="mt-2 text-sm font-medium text-purple-700">Rating: {task.rating}/5</p>}
        </div>
      )}
    </div>
  );
}
