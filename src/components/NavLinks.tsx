"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconDashboard,
  IconUsers,
  IconTasks,
  IconChart,
  IconGuide,
  IconInbox,
  IconChat,
  IconMenu,
  IconX,
} from "@/components/icons";
import { logout } from "@/app/actions/auth";

const iconFor = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes("dashboard")) return IconDashboard;
  if (key.includes("employee") || key.includes("user")) return IconUsers;
  if (key.includes("chat")) return IconChat;
  if (key.includes("task")) return IconTasks;
  if (key.includes("analytic")) return IconChart;
  if (key.includes("guide")) return IconGuide;
  if (key.includes("update")) return IconInbox;
  return IconDashboard;
};

function isLinkActive(href: string, pathname: string) {
  return href === pathname || (href !== "/admin" && href !== "/employee" && pathname.startsWith(href));
}

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden gap-1 lg:flex">
      {links.map((link) => {
        const isActive = isLinkActive(link.href, pathname);
        const Icon = iconFor(link.label);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({
  links,
  userName,
}: {
  links: { href: string; label: string }[];
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[57px] z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg">
          <nav className="flex flex-col p-2">
            {links.map((link) => {
              const isActive = isLinkActive(link.href, pathname);
              const Icon = iconFor(link.label);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3">
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
      )}
    </div>
  );
}
