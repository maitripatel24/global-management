import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { NotificationBell } from "@/components/NotificationBell";

type NotificationItem = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

export function TopNav({
  title,
  userName,
  links,
  notifications,
}: {
  title: string;
  userName: string;
  links: { href: string; label: string }[];
  notifications: NotificationItem[];
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          <nav className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell notifications={notifications} />
          <span className="text-sm text-slate-500">{userName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
