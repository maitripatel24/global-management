import { prisma } from "@/lib/prisma";

export type HourlyLoadPoint = {
  hour: number;
  label: string;
  totalHours: number;
};

export async function getHourlyLoad(days: number, employeeId?: string): Promise<HourlyLoadPoint[]> {
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
    select: { hour: true, hoursSpent: true },
  });

  const buckets = new Map<number, number>();
  for (let h = 6; h <= 21; h++) buckets.set(h, 0);

  for (const entry of entries) {
    buckets.set(entry.hour, (buckets.get(entry.hour) ?? 0) + entry.hoursSpent);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([hour, total]) => ({
      hour,
      label: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "PM" : "AM"}`,
      totalHours: Math.round(total * 100) / 100,
    }));
}

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}

export type EmployeeWorkPattern = {
  employeeId: string;
  employeeName: string;
  daysSubmitted: number;
  totalHours: number;
  avgHoursPerDay: number;
  windowLabel: string;
  utilizationPercent: number | null;
};

// Derives each employee's actual working window and time utilization
// straight from their own daily-update submissions — no assumption about a
// fixed shift, and no dependence on task status, so it can't be skewed by
// tasks changing status after the fact.
//
// windowLabel is the average of each day's own earliest/latest logged hour
// (not a min/max across the whole period, which one outlier day could skew).
// utilizationPercent compares hours actually logged to the span of that
// window per day — e.g. a 9 AM-6 PM window (9 hours) with only 6 hours
// logged is 67% utilized, surfacing gaps the raw hour total alone would hide.
export async function getEmployeeWorkPatterns(days: number): Promise<EmployeeWorkPattern[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      dailyUpdates: {
        where: { date: { gte: since } },
        select: { hourlyEntries: { select: { hour: true, hoursSpent: true } } },
      },
    },
  });

  return employees
    .map((emp) => {
      const daysSubmitted = emp.dailyUpdates.length;
      const totalHours =
        Math.round(
          emp.dailyUpdates.reduce((s, u) => s + u.hourlyEntries.reduce((s2, e) => s2 + e.hoursSpent, 0), 0) * 100,
        ) / 100;

      const dailyStarts: number[] = [];
      const dailyEnds: number[] = [];
      let totalWindowSpan = 0;

      for (const update of emp.dailyUpdates) {
        if (update.hourlyEntries.length === 0) continue;
        // A single entry's hoursSpent can run past its own hour slot (e.g. 3
        // hours logged against the 9 AM slot), and entries can share a slot,
        // so the window can't be read off as a plain min/max of the hour
        // field. Stack entries sequentially by hour instead — each one
        // starts no earlier than where the previous one left off — which
        // gives the real elapsed span without ever exceeding total hours.
        const sorted = [...update.hourlyEntries].sort((a, b) => a.hour - b.hour);
        const start = sorted[0].hour;
        let cursor = start;
        for (const entry of sorted) {
          const begin = Math.max(entry.hour, cursor);
          cursor = begin + entry.hoursSpent;
        }
        const end = cursor;
        dailyStarts.push(start);
        dailyEnds.push(end);
        totalWindowSpan += end - start;
      }

      const avgHoursPerDay = daysSubmitted > 0 ? Math.round((totalHours / daysSubmitted) * 10) / 10 : 0;
      const windowLabel =
        dailyStarts.length > 0
          ? `${formatHour(Math.round(dailyStarts.reduce((a, b) => a + b, 0) / dailyStarts.length))} – ${formatHour(Math.round(dailyEnds.reduce((a, b) => a + b, 0) / dailyEnds.length))}`
          : "No data";
      const utilizationPercent = totalWindowSpan > 0 ? Math.round((totalHours / totalWindowSpan) * 1000) / 10 : null;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        daysSubmitted,
        totalHours,
        avgHoursPerDay,
        windowLabel,
        utilizationPercent,
      };
    })
    .sort((a, b) => b.totalHours - a.totalHours);
}
