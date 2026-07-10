"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions/users";

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, undefined);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-medium text-slate-700">Full name</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Role</label>
        <select
          name="role"
          defaultValue="EMPLOYEE"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        {state?.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="mb-2 text-sm text-green-600">Account created.</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create account"}
        </button>
      </div>
    </form>
  );
}
