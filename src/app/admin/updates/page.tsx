import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { IconCheckCircle, IconClock, IconInbox } from "@/components/icons";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminTodaysUpdatesPage() {
  await requireUser("ADMIN");
  const date = todayStart();

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE", active: true },
    orderBy: { name: "asc" },
    include: {
      dailyUpdates: {
        where: { date },
        include: { hourlyEntries: { include: { task: true } } },
      },
    },
  });

  const submitted = employees.filter((e) => e.dailyUpdates.length > 0);
  const pending = employees.filter((e) => e.dailyUpdates.length === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Today&apos;s Updates</h1>
        <p className="text-sm text-slate-500">
          {date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          {" · "}
          {submitted.length}/{employees.length} submitted
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <IconCheckCircle className="h-4 w-4 text-green-600" />
          <h2 className="text-sm font-semibold text-slate-800">Submitted ({submitted.length})</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {submitted.map((emp) => {
            const update = emp.dailyUpdates[0];
            return (
              <li key={emp.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/employees/${emp.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                    {emp.name}
                  </Link>
                  <span className="text-xs text-slate-400">
                    {update.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{update.summary}</p>
                {update.hourlyEntries.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {update.hourlyEntries.map((entry) => (
                      <span
                        key={entry.id}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                        title={entry.note ?? undefined}
                      >
                        {entry.hour}:00 · {entry.hoursSpent}h{entry.task ? ` · ${entry.task.title}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
          {submitted.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-400">
              <IconInbox className="h-6 w-6 text-slate-300" />
              No updates submitted yet today.
            </li>
          )}
        </ul>
      </div>

      {pending.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 border-b border-amber-100 px-4 py-3">
            <IconClock className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-900">Not submitted yet ({pending.length})</h2>
          </div>
          <ul className="divide-y divide-amber-100">
            {pending.map((emp) => (
              <li key={emp.id} className="px-4 py-3">
                <Link href={`/admin/employees/${emp.id}`} className="text-sm font-medium text-amber-900 hover:underline">
                  {emp.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
