import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TaskStatusActions } from "@/components/TaskStatusActions";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

export default async function EmployeeTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("EMPLOYEE");

  const task = await prisma.task.findUnique({
    where: { id },
    include: { assignedBy: true },
  });

  if (!task || task.assignedToId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{task.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Assigned by {task.assignedBy.name}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[task.status]}`}>
          {task.status.replace("_", " ")}
        </span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
        <div className="mt-4 flex gap-4 text-xs text-slate-500">
          <span>Priority: {task.priority}</span>
          {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>
      </div>

      <TaskStatusActions taskId={task.id} status={task.status} />

      {task.reviewComment && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm font-medium text-purple-900">Admin review</p>
          <p className="mt-1 text-sm text-purple-800">{task.reviewComment}</p>
          {task.rating && <p className="mt-1 text-xs text-purple-700">Rating: {task.rating}/5</p>}
        </div>
      )}
    </div>
  );
}
