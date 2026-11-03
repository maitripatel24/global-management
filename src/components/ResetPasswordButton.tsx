"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { resetUserPassword } from "@/app/actions/users";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/components/Toast";

export function ResetPasswordButton({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const showToast = useToast();

  function close() {
    setOpen(false);
    setError(null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("newPassword") as string;
    startTransition(async () => {
      const result = await resetUserPassword(userId, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("success", `New password set for ${userName}. Tell them privately.`);
      close();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
      >
        Reset password
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4" onClick={close}>
            <form
              onSubmit={onSubmit}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-base font-semibold text-slate-900">Reset password for {userName}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose a new password and share it with them privately. They can change it themselves afterwards.
              </p>
              <label htmlFor="newPassword" className="mt-4 block text-sm font-medium text-slate-700">
                New password <span className="font-normal text-slate-400">(at least 8 characters)</span>
              </label>
              <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" minLength={8} />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Set password"}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </>
  );
}
