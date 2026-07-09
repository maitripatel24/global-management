"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export type TaskFormState = { error?: string } | undefined;

export async function createTask(_prevState: TaskFormState, formData: FormData) {
  const admin = await requireUser("ADMIN");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const assignedToId = formData.get("assignedToId") as string;
  const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH";
  const dueDateRaw = formData.get("dueDate") as string;

  if (!title || !description || !assignedToId) {
    return { error: "Title, description and assignee are required." };
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      assignedToId,
      assignedById: admin.id,
      priority: priority || "MEDIUM",
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  await notifyUser(assignedToId, `New task assigned: "${title}"`, `/employee/tasks/${task.id}`);

  revalidatePath("/admin/tasks");
  revalidatePath("/employee");
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
