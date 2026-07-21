"use client";

import { useActionState, useEffect, useState } from "react";
import { updateTask } from "@/app/actions/tasks";
import { useToast } from "@/components/Toast";

type EmployeeOption = { id: string; name: string };
type CompanyOption = { id: string; name: string };

export function EditTaskForm({
  task,
  employees,
  companies,
}: {
  task: {
    id: string;
    title: string;
    description: string;
    assignedToId: string | null;
    priority: string;
    dueDate: string | null;
    companyId: string | null;
  };
  employees: EmployeeOption[];
  companies: CompanyOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateTask, undefined);
  const showToast = useToast();

  useEffect(() => {
    if (state?.success) {
      showToast("success", "Task updated.");
      setOpen(false);
    } else if (state?.error) {
      showToast("error", state.error);
    }
  }, [state, showToast]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
      >
        Edit task
      </button>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <input type="hidden" name="taskId" value={task.id} />
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Title</label>
        <input
          name="title"
          defaultValue={task.title}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Description</label>
        <textarea
          name="description"
          defaultValue={task.description}
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Company</label>
        <select
          name="companyId"
          defaultValue={task.companyId ?? ""}
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
      <div>
        <label className="block text-xs font-medium text-slate-700">Assign to</label>
        <select
          name="assignedToId"
          defaultValue={task.assignedToId ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        >
          <option value="">Unassigned</option>
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
          defaultValue={task.priority}
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
          defaultValue={task.dueDate ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
