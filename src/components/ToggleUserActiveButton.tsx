"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserActive } from "@/app/actions/users";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  function toggle() {
    setConfirmOpen(false);
    startTransition(async () => {
      await setUserActive(userId, !active);
      router.refresh();
    });
  }

  return (
    <>
      <button
        disabled={isPending}
        onClick={() => (active ? setConfirmOpen(true) : toggle())}
        className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
          active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        {active ? "Active" : "Disabled"}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title={`Disable ${userName}?`}
        message="Are you sure you want to disable this user? They won't be able to sign in until you enable them again."
        confirmLabel="Yes, disable"
        onConfirm={toggle}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
