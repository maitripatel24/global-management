"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSelfTask } from "@/app/actions/tasks";
import { useToast } from "@/components/Toast";
import { IconPlus } from "@/components/icons";

type CompanyOption = { id: string; name: string };

export function CreateSelfTaskForm({
  companies,
  defaultCompanyId,
}: {
  companies?: CompanyOption[];
  defaultCompanyId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createSelfTask, undefined);
  const showToast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      showToast("success", "Task created and assigned to you.");
      formRef.current?.reset();
    } else if (state?.error) {
      showToast("error", state.error);
    }
  }, [state, showToast]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-slate-700">Title</label>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-semibold text-slate-700">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      {companies && (
        <div>
          <label className="block text-sm font-semibold text-slate-700">Company</label>
          <select
            name="companyId"
            defaultValue={defaultCompanyId ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base transition-colors focus:border-slate-500 focus:outline-none"
          >
            <option value="">No company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-slate-700">Priority</label>
        <select
          name="priority"
          defaultValue="MEDIUM"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base transition-colors focus:border-slate-500 focus:outline-none"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700">Due date</label>
        <input
          type="date"
          name="dueDate"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition-all hover:bg-slate-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          <IconPlus className="h-5 w-5" />
          {isPending ? "Creating..." : "Create task for myself"}
        </button>
      </div>
    </form>
  );
}
