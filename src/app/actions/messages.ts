"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireUser } from "@/lib/session";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export async function sendMessage(employeeId: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const trimmed = content.trim();
  if (!trimmed) return;

  if (session.user.role === "EMPLOYEE" && session.user.id !== employeeId) {
    throw new Error("Not authorized to post in this thread.");
  }

  const employee = await prisma.user.findUnique({ where: { id: employeeId } });
  if (!employee || employee.role !== "EMPLOYEE") {
    throw new Error("Invalid employee thread.");
  }

  await prisma.message.create({
    data: { employeeId, senderId: session.user.id, content: trimmed },
  });

  if (session.user.role === "ADMIN") {
    await notifyUser(employeeId, `New message from ${session.user.name}`, "/employee/chat");
  } else {
    await notifyAdmins(`New message from ${employee.name}`, `/admin/chats/${employeeId}`);
  }

  revalidatePath(`/admin/chats/${employeeId}`);
  revalidatePath("/employee/chat");
}

export async function getMessagesSince(employeeId: string, sinceIso: string | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (session.user.role === "EMPLOYEE" && session.user.id !== employeeId) {
    throw new Error("Not authorized to view this thread.");
  }

  const messages = await prisma.message.findMany({
    where: {
      employeeId,
      ...(sinceIso ? { createdAt: { gt: new Date(sinceIso) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true, role: true } } },
  });

  return messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    senderName: m.sender.name,
    senderRole: m.sender.role,
    senderId: m.senderId,
  }));
}

export async function markThreadRead(employeeId: string) {
  const user = await requireUser();
  await prisma.message.updateMany({
    where: {
      employeeId,
      read: false,
      senderId: { not: user.id },
    },
    data: { read: true },
  });
}
