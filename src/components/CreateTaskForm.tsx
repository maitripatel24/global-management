"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask } from "@/app/actions/tasks";
import { useToast } from "@/components/Toast";
import { IconPlus } from "@/components/icons";

type EmployeeOption = { id: string; name: string };
type CompanyOption = { id: string; name: string };

export function CreateTaskForm({
  employees,
  companies,
  defaultCompanyId,
}: {
  employees: EmployeeOption[];
  companies?: CompanyOption[];
  defaultCompanyId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createTask, undefined);
  const showToast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      showToast("success", "Task assigned successfully.");
      formRef.current?.reset();
    } else if (state?.error) {
      showToast("error", state.error);
    }
  }, [state, showToast]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Title</label>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      {companies && (
        <div>
          <label className="block text-xs font-medium text-slate-700">Company</label>
          <select
            name="companyId"
            defaultValue={defaultCompanyId ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
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
        <label className="block text-xs font-medium text-slate-700">Assign to</label>
        <select
          name="assignedToId"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        >
          <option value="">Select employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Priority</label>
        <select
          name="priority"
          defaultValue="MEDIUM"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Due date</label>
        <input
          type="date"
          name="dueDate"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Attachments (optional)</label>
        <input
          type="file"
          name="attachments"
          multiple
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
        <p className="mt-1 text-xs text-slate-400">Up to 5 files, 5MB each.</p>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          <IconPlus className="h-4 w-4" />
          {isPending ? "Assigning..." : "Assign task"}
        </button>
      </div>
    </form>
  );
}
