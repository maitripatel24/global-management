import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/TopNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("ADMIN");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        title="Office Manager · Admin"
        userName={user.name ?? ""}
        notifications={notifications}
        links={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/employees", label: "Employees" },
          { href: "/admin/tasks", label: "Tasks" },
          { href: "/admin/analytics", label: "Analytics" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/guide", label: "Guide" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
