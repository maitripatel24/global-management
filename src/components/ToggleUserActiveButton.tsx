"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserActive } from "@/app/actions/users";

export function ToggleUserActiveButton({
  userId,
  userName,
  active,
}: {
  userId: string;
  userName: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (
      active &&
      !window.confirm(`Are you sure you want to disable ${userName}? They won't be able to sign in until you enable them again.`)
    ) {
      return;
    }
    startTransition(async () => {
      await setUserActive(userId, !active);
      router.refresh();
    });
  }

  return (
    <button
      disabled={isPending}
      onClick={handleClick}
      className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
        active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {active ? "Active" : "Disabled"}
    </button>
  );
}
