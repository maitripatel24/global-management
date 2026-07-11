import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { IconInbox } from "@/components/icons";

export default async function AdminChatsPage() {
  await requireUser("ADMIN");

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { name: "asc" },
    include: {
      messageThread: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ["employeeId"],
    where: { read: false },
    _count: true,
  });
  const unreadMap = new Map(unreadCounts.map((u) => [u.employeeId, u._count]));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Chats</h1>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {employees.map((emp) => {
            const last = emp.messageThread[0];
            const unread = unreadMap.get(emp.id) ?? 0;
            return (
              <li key={emp.id}>
                <Link
                  href={`/admin/chats/${emp.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{emp.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {last ? last.content : "No messages yet"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          {employees.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-slate-400">
              <IconInbox className="h-6 w-6 text-slate-300" />
              No employees yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
