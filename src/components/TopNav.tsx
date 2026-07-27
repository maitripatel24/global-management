import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { NavLinks, MobileNav } from "@/components/NavLinks";
import { Logo } from "@/components/Logo";
import { IconLogout } from "@/components/icons";

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
  size = "md",
}: {
  title: string;
  userName: string;
  links: { href: string; label: string }[];
  notifications: NotificationItem[];
  size?: "md" | "lg";
}) {
  const large = size === "lg";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <MobileNav links={links} userName={userName} size={size} />
          <Link
            href={links[0]?.href ?? "/"}
            className={`flex min-w-0 items-center gap-1.5 truncate font-semibold text-slate-900 hover:text-slate-700 ${large ? "text-base" : "text-sm"}`}
          >
            <Logo className={large ? "h-6 w-6 shrink-0 rounded" : "h-5 w-5 shrink-0 rounded"} />
            <span className="truncate">{title}</span>
          </Link>
          <NavLinks links={links} size={size} />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationBell notifications={notifications} />
          <span className="hidden text-sm text-slate-500 lg:inline">{userName}</span>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Sign out"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 lg:px-3"
            >
              <IconLogout className="h-4 w-4" />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
