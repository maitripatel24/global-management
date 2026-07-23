import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

// Runs daily via Vercel Cron (see vercel.json). Notifies the assignee once
// when a task's due date is within the next 2 days, so nothing slips
// through silently the way it could in a spreadsheet.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const twoDaysOut = new Date(todayStart);
  twoDaysOut.setDate(twoDaysOut.getDate() + 2);
  twoDaysOut.setHours(23, 59, 59, 999);

  const dueSoonTasks = await prisma.task.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      assignedToId: { not: null },
      dueReminderSent: false,
      dueDate: { gte: todayStart, lte: twoDaysOut },
    },
  });

  let notified = 0;
  for (const task of dueSoonTasks) {
    if (!task.assignedToId) continue;
    await notifyUser(
      task.assignedToId,
      `Reminder: "${task.title}" is due ${task.dueDate!.toLocaleDateString()}`,
      `/employee/tasks/${task.id}`,
    );
    await prisma.task.update({ where: { id: task.id }, data: { dueReminderSent: true } });
    notified++;
  }

  return NextResponse.json({ ok: true, checked: dueSoonTasks.length, notified });
}
