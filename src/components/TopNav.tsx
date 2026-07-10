import { logout } from "@/app/actions/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { NavLinks } from "@/components/NavLinks";
import { IconSparkle } from "@/components/icons";

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
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <IconSparkle className="h-4 w-4 text-amber-400" />
            {title}
          </span>
          <NavLinks links={links} />
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell notifications={notifications} />
          <span className="text-sm text-slate-500">{userName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
