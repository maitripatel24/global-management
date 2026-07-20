import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateCompanyForm } from "@/components/CreateCompanyForm";
import { ToggleCompanyActiveButton } from "@/components/ToggleCompanyActiveButton";
import { dueUrgency } from "@/lib/dueDate";
import { IconInbox } from "@/components/icons";

export default async function AdminCompaniesPage() {
  await requireUser("ADMIN");

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: { tasks: { select: { status: true, dueDate: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Companies</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Add a company</h2>
        <CreateCompanyForm />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Open tasks</th>
                <th className="px-4 py-2">Overdue</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => {
                const open = c.tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
                const overdue = c.tasks.filter((t) => dueUrgency(t.dueDate, t.status) === "overdue").length;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/companies/${c.id}`} className="font-medium text-slate-800 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.code ?? "—"}</td>
                    <td className="px-4 py-3">{open}</td>
                    <td className="px-4 py-3">
                      {overdue > 0 ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {overdue} overdue
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleCompanyActiveButton companyId={c.id} active={c.active} />
                    </td>
                  </tr>
                );
              })}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <IconInbox className="h-6 w-6 text-slate-300" />
                      No companies yet. Add your first one above.
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
