import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { IconInbox, IconBuilding } from "@/components/icons";

export default async function EmployeeCompaniesPage() {
  const user = await requireUser("EMPLOYEE");

  const companies = await prisma.company.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      tasks: {
        where: { assignedToId: user.id },
        select: { status: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
        <p className="mt-1 text-base text-slate-500">Tap a company to see your tasks for it.</p>
      </div>

      {companies.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white py-14 text-center text-base text-slate-400">
          <IconInbox className="h-8 w-8 text-slate-300" />
          No companies yet.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => {
          const myOpen = c.tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
          return (
            <Link
              key={c.id}
              href={`/employee/companies/${c.id}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <IconBuilding className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-900">{c.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {myOpen > 0 ? (
                    <span className="font-medium text-blue-600">
                      {myOpen} open task{myOpen === 1 ? "" : "s"} for you
                    </span>
                  ) : (
                    "No open tasks for you"
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
