"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserActive } from "@/app/actions/users";

export function ToggleUserActiveButton({ userId, active }: { userId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setUserActive(userId, !active);
          router.refresh();
        })
      }
      className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
        active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </button>
  );
}
