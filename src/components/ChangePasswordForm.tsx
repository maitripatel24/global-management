"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/app/actions/account";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/components/Toast";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);
  const showToast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      showToast("success", "Password changed.");
      formRef.current?.reset();
    } else if (state?.error) {
      showToast("error", state.error);
    }
  }, [state, showToast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
          Current password
        </label>
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
          New password <span className="font-normal text-slate-400">(at least 8 characters)</span>
        </label>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" minLength={8} />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
          Confirm new password
        </label>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" minLength={8} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
