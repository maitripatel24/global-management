"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCompany } from "@/app/actions/companies";
import { useToast } from "@/components/Toast";
import { IconPlus } from "@/components/icons";

export function CreateCompanyForm() {
  const [state, formAction, isPending] = useActionState(createCompany, undefined);
  const showToast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      showToast("success", "Company added.");
      formRef.current?.reset();
    } else if (state?.error) {
      showToast("error", state.error);
    }
  }, [state, showToast]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Company name</label>
        <input
          name="name"
          required
          placeholder="e.g. Patidar Buildcon Ltd"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Short code (optional)</label>
        <input
          name="code"
          placeholder="e.g. PBL"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          <IconPlus className="h-4 w-4" />
          {isPending ? "Adding..." : "Add company"}
        </button>
      </div>
    </form>
  );
}
