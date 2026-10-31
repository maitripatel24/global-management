"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveUser } from "@/app/actions/users";
import { IconCheckCircle } from "@/components/icons";

export function ApproveUserButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (done) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-green-700">
          <IconCheckCircle className="h-5 w-5" />
          Approved. They can sign in now.
        </p>
        <Link href="/admin/users" className="inline-block text-sm font-medium text-slate-700 underline">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await approveUser(userId);
            if (result.error) {
              setError(result.error);
              return;
            }
            setDone(true);
            router.refresh();
          })
        }
        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-base font-semibold text-white transition-all hover:bg-green-700 active:scale-[0.98] disabled:opacity-50"
      >
        <IconCheckCircle className="h-5 w-5" />
        {isPending ? "Approving..." : "Approve this account"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
