import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminEmployeesPage() {
  await requireUser("ADMIN");
  const date = todayStart();

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { name: "asc" },
    include: {
      tasksAssigned: true,
      dailyUpdates: { where: { date } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Employees</h1>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Open tasks</th>
              <th className="px-4 py-2">Today&apos;s update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const openTasks = emp.tasksAssigned.filter(
                (t) => t.status === "PENDING" || t.status === "IN_PROGRESS",
              ).length;
              return (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/employees/${emp.id}`} className="font-medium text-slate-800 hover:underline">
                      {emp.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{emp.email}</td>
                  <td className="px-4 py-3">{openTasks}</td>
                  <td className="px-4 py-3">
                    {emp.dailyUpdates.length > 0 ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Submitted
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
