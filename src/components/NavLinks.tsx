"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconUsers,
  IconTasks,
  IconChart,
  IconGuide,
  IconInbox,
  IconChat,
} from "@/components/icons";

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

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {links.map((link) => {
        const isActive = link.href === pathname || (link.href !== "/admin" && link.href !== "/employee" && pathname.startsWith(link.href));
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
