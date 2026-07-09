"use client";

import { useActionState } from "react";
import { createTask } from "@/app/actions/tasks";

type EmployeeOption = { id: string; name: string };

export function CreateTaskForm({ employees }: { employees: EmployeeOption[] }) {
  const [state, formAction, isPending] = useActionState(createTask, undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Title</label>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-700">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Assign to</label>
        <select
          name="assignedToId"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
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
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
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
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        {state?.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Assigning..." : "Assign task"}
        </button>
      </div>
    </form>
  );
}
