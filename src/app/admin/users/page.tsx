import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "@/components/CreateUserForm";
import { ToggleUserActiveButton } from "@/components/ToggleUserActiveButton";
import { PendingApprovalActions } from "@/components/PendingApprovalActions";

export default async function AdminUsersPage() {
  const currentUser = await requireUser("ADMIN");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  const pending = users
    .filter((u) => u.pendingApproval)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Manage Users</h1>

      {pending.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
          <div className="border-b border-amber-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-amber-900">
              Pending approvals ({pending.length})
            </h2>
            <p className="mt-0.5 text-xs text-amber-800">
              These people signed up themselves. Approve only if you know them.
            </p>
          </div>
          <ul className="divide-y divide-amber-200">
            {pending.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-600">
                    {u.email} · {u.phone ?? "no phone"} · signed up {u.createdAt.toLocaleString()}
                  </p>
                </div>
                <PendingApprovalActions userId={u.id} userName={u.name} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Add a new admin or employee</h2>
        <CreateUserForm />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
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
                <td className="px-4 py-3 text-slate-500">{u.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.id === currentUser.id ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                  ) : u.pendingApproval ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Pending approval
                    </span>
                  ) : (
                    <ToggleUserActiveButton userId={u.id} userName={u.name} active={u.active} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
