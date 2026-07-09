import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/TopNav";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("EMPLOYEE");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        title="Office Manager"
        userName={user.name ?? ""}
        notifications={notifications}
        links={[
          { href: "/employee", label: "Dashboard" },
          { href: "/employee/tasks", label: "My Tasks" },
          { href: "/employee/daily-update", label: "Daily Update" },
        ]}
      />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
