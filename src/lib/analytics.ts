import { prisma } from "@/lib/prisma";

export type HourlyEfficiencyPoint = {
  hour: number;
  label: string;
  totalHours: number;
  productiveHours: number;
  efficiency: number;
};

export async function getHourlyEfficiency(days: number, employeeId?: string) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const entries = await prisma.workLogEntry.findMany({
    where: {
      dailyUpdate: {
        date: { gte: since },
        ...(employeeId ? { userId: employeeId } : {}),
      },
    },
    include: { task: true },
  });

  const buckets = new Map<number, { total: number; productive: number }>();
  for (let h = 6; h <= 21; h++) buckets.set(h, { total: 0, productive: 0 });

  for (const entry of entries) {
    const bucket = buckets.get(entry.hour) ?? { total: 0, productive: 0 };
    bucket.total += entry.hoursSpent;
    if (entry.task && (entry.task.status === "DONE" || entry.task.status === "REVIEWED")) {
      bucket.productive += entry.hoursSpent;
    }
    buckets.set(entry.hour, bucket);
  }

  const result: HourlyEfficiencyPoint[] = Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([hour, { total, productive }]) => ({
      hour,
      label: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`,
      totalHours: Math.round(total * 100) / 100,
      productiveHours: Math.round(productive * 100) / 100,
      efficiency: total > 0 ? Math.round((productive / total) * 1000) / 10 : 0,
    }));

  return result;
}
