"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "@/app/actions/users";
import { useToast } from "@/components/Toast";
import { IconPlus } from "@/components/icons";

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, undefined);
  const showToast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      showToast("success", "Account created successfully.");
      formRef.current?.reset();
    } else if (state?.error) {
      showToast("error", state.error);
    }
  }, [state, showToast]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-medium text-slate-700">Full name</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700">Role</label>
        <select
          name="role"
          defaultValue="EMPLOYEE"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          <IconPlus className="h-4 w-4" />
          {isPending ? "Creating..." : "Create account"}
        </button>
      </div>
    </form>
  );
}
