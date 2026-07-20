"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export type TaskFormState = { error?: string; success?: boolean } | undefined;

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_ATTACHMENTS = 5;

export async function createTask(_prevState: TaskFormState, formData: FormData) {
  const admin = await requireUser("ADMIN");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const assignedToId = formData.get("assignedToId") as string;
  const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH";
  const dueDateRaw = formData.get("dueDate") as string;
  const companyId = (formData.get("companyId") as string) || null;
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);

  if (!title || !description || !assignedToId) {
    return { error: "Title, description and assignee are required." };
  }
  if (files.length > MAX_ATTACHMENTS) {
    return { error: `You can attach at most ${MAX_ATTACHMENTS} files.` };
  }
  const tooBig = files.find((f) => f.size > MAX_ATTACHMENT_SIZE);
  if (tooBig) {
    return { error: `"${tooBig.name}" is too large. Max size is 5MB per file.` };
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      assignedToId,
      assignedById: admin.id,
      priority: priority || "MEDIUM",
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      companyId,
    },
  });

  if (files.length > 0) {
    await prisma.taskAttachment.createMany({
      data: await Promise.all(
        files.map(async (file) => ({
          taskId: task.id,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          data: Buffer.from(await file.arrayBuffer()),
        })),
      ),
    });
  }

  await notifyUser(assignedToId, `New task assigned: "${title}"`, `/employee/tasks/${task.id}`);

  revalidatePath("/admin/tasks");
  revalidatePath("/employee");
  if (companyId) revalidatePath(`/admin/companies/${companyId}`);

  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: "IN_PROGRESS" | "DONE") {
  const employee = await requireUser("EMPLOYEE");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.assignedToId !== employee.id) {
    throw new Error("Not authorized to update this task.");
  }

  await prisma.task.update({ where: { id: taskId }, data: { status } });

  if (status === "DONE") {
    await notifyAdmins(`${employee.name} marked "${task.title}" as done`, `/admin/tasks/${task.id}`);
  }

  revalidatePath("/employee/tasks");
  revalidatePath(`/employee/tasks/${taskId}`);
  revalidatePath("/admin/tasks");
}

export async function reviewTask(
  taskId: string,
  data: { comment: string; rating: number },
) {
  await requireUser("ADMIN");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "REVIEWED",
      reviewComment: data.comment,
      rating: data.rating,
      reviewedAt: new Date(),
    },
  });

  await notifyUser(task.assignedToId, `Your task "${task.title}" has been reviewed`, `/employee/tasks/${task.id}`);

  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/employee/tasks");
}
