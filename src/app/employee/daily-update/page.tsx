import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DailyUpdateForm } from "@/components/DailyUpdateForm";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function DailyUpdatePage() {
  const user = await requireUser("EMPLOYEE");
  const date = todayStart();

  const [tasks, existing] = await Promise.all([
    prisma.task.findMany({
      where: { assignedToId: user.id, status: { in: ["PENDING", "IN_PROGRESS", "DONE"] } },
      select: { id: true, title: true },
    }),
    prisma.dailyUpdate.findUnique({
      where: { userId_date: { userId: user.id, date } },
      include: { hourlyEntries: true },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Daily Update</h1>
        <p className="text-sm text-slate-500">{date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <DailyUpdateForm
          date={toDateInputValue(date)}
          initialSummary={existing?.summary ?? ""}
          initialEntries={
            existing?.hourlyEntries.map((e) => ({
              hour: e.hour,
              taskId: e.taskId,
              hoursSpent: e.hoursSpent,
              note: e.note ?? "",
            })) ?? []
          }
          tasks={tasks}
        />
      </div>
    </div>
  );
}
