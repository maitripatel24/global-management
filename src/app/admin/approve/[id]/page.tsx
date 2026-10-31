import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ApproveUserButton } from "@/components/ApproveUserButton";
import { IconCheckCircle } from "@/components/icons";

export default async function ApproveUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser("ADMIN");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true },
  });
  if (!user) notFound();

  const rows: [string, string][] = [
    ["Name", user.name],
    ["Email", user.email],
    ["Phone", user.phone ?? "—"],
    ["Role", user.role],
    ["Signed up", user.createdAt.toLocaleString()],
  ];

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <Link href="/admin/users" className="text-xs text-slate-500 hover:text-slate-800">
          &larr; All users
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Approve new account</h1>
        <p className="text-sm text-slate-500">Check these details, then approve only if you know this person.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <dl className="space-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {user.role !== "EMPLOYEE" ? (
        <p className="text-sm text-slate-600">This is an admin account, so it can&apos;t be approved from here.</p>
      ) : user.active ? (
        <p className="flex items-center gap-2 text-sm font-medium text-green-700">
          <IconCheckCircle className="h-5 w-5" />
          This account is already active.
        </p>
      ) : (
        <ApproveUserButton userId={user.id} />
      )}
    </div>
  );
}
