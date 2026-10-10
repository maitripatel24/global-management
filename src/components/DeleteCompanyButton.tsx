"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCompany } from "@/app/actions/companies";
import { useToast } from "@/components/Toast";
import { IconAlert } from "@/components/icons";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteCompanyButton({
  companyId,
  companyName,
  openTaskCount,
  redirectTo,
}: {
  companyId: string;
  companyName: string;
  openTaskCount: number;
  redirectTo?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const showToast = useToast();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const warning =
    openTaskCount > 0
      ? `It has ${openTaskCount} task${openTaskCount === 1 ? "" : "s"} linked to it. Those tasks won't be deleted, but will no longer be tied to a company. This can't be undone.`
      : "This can't be undone.";

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      await deleteCompany(companyId);
      showToast("success", `${companyName} deleted.`);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        <IconAlert className="h-3 w-3" />
        {isPending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${companyName}?`}
        message={warning}
        confirmLabel="Yes, delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
