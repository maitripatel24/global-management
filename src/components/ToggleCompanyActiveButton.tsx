"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCompanyActive } from "@/app/actions/companies";

export function ToggleCompanyActiveButton({ companyId, active }: { companyId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setCompanyActive(companyId, !active);
          router.refresh();
        })
      }
      className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
        active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
