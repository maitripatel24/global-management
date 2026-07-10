import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "@/components/CreateUserForm";
import { ToggleUserActiveButton } from "@/components/ToggleUserActiveButton";

export default async function AdminUsersPage() {
  const currentUser = await requireUser("ADMIN");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Manage Users</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Add a new admin or employee</h2>
        <CreateUserForm />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {u.name} {u.id === currentUser.id && <span className="text-xs text-slate-400">(you)</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.id === currentUser.id ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                  ) : (
                    <ToggleUserActiveButton userId={u.id} active={u.active} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
