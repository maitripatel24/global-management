"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveUser, rejectUser } from "@/app/actions/users";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconCheckCircle, IconX } from "@/components/icons";

export function PendingApprovalActions({ userId, userName }: { userId: string; userName: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(action: (id: string) => Promise<{ error?: string }>) {
    setConfirmReject(false);
    setError(null);
    startTransition(async () => {
      const result = await action(userId);
      if (result.error) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() => run(approveUser)}
          className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          <IconCheckCircle className="h-4 w-4" />
          {isPending ? "Working..." : "Approve"}
        </button>
        <button
          disabled={isPending}
          onClick={() => setConfirmReject(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <IconX className="h-4 w-4" />
          Reject
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <ConfirmDialog
        open={confirmReject}
        title={`Reject ${userName}?`}
        message="This deletes their sign-up request. They can sign up again later if it was a mistake."
        confirmLabel="Yes, reject"
        onConfirm={() => run(rejectUser)}
        onCancel={() => setConfirmReject(false)}
      />
    </div>
  );
}
