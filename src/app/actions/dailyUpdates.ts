"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notifyAdmins } from "@/lib/notify";

export type DailyUpdateEntryInput = {
  hour: number;
  taskId: string | null;
  hoursSpent: number;
  note: string;
};

export type DailyUpdateFormState = { error?: string; success?: boolean } | undefined;

export async function submitDailyUpdate(
  _prevState: DailyUpdateFormState,
  formData: FormData,
): Promise<DailyUpdateFormState> {
  const employee = await requireUser("EMPLOYEE");

  const dateRaw = formData.get("date") as string;
  const summary = (formData.get("summary") as string)?.trim();
  const entriesRaw = formData.get("entries") as string;

  if (!dateRaw || !summary) {
    return { error: "Date and summary are required." };
  }

  let entries: DailyUpdateEntryInput[] = [];
  try {
    entries = entriesRaw ? JSON.parse(entriesRaw) : [];
  } catch {
    return { error: "Invalid hourly entries." };
  }

  const date = new Date(dateRaw + "T00:00:00");

  const existing = await prisma.dailyUpdate.findUnique({
    where: { userId_date: { userId: employee.id, date } },
  });

  const dailyUpdate = existing
    ? await prisma.dailyUpdate.update({
        where: { id: existing.id },
        data: { summary },
      })
    : await prisma.dailyUpdate.create({
        data: { userId: employee.id, date, summary },
      });

  await prisma.workLogEntry.deleteMany({ where: { dailyUpdateId: dailyUpdate.id } });

  const validEntries = entries.filter((e) => e.hoursSpent > 0);
  if (validEntries.length > 0) {
    await prisma.workLogEntry.createMany({
      data: validEntries.map((e) => ({
        dailyUpdateId: dailyUpdate.id,
        taskId: e.taskId || null,
        hour: e.hour,
        hoursSpent: e.hoursSpent,
        note: e.note || null,
      })),
    });
  }

  await notifyAdmins(
    `${employee.name} submitted their daily update for ${dateRaw}`,
    "/admin/updates",
  );

  revalidatePath("/employee/daily-update");
  revalidatePath("/admin/analytics");
  revalidatePath(`/admin/employees/${employee.id}`);
  revalidatePath("/admin/updates");

  return { success: true };
}
