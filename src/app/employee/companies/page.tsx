import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { IconInbox } from "@/components/icons";

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
        <h1 className="text-xl font-semibold text-slate-900">Companies</h1>
        <p className="text-sm text-slate-500">Browse companies and your tasks for each one.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Your open tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => {
                const myOpen = c.tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/employee/companies/${c.id}`} className="font-medium text-slate-800 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.code ?? "—"}</td>
                    <td className="px-4 py-3">{myOpen}</td>
                  </tr>
                );
              })}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <IconInbox className="h-6 w-6 text-slate-300" />
                      No companies yet.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
