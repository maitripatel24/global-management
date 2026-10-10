"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconAlert } from "@/components/icons";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              destructive ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}
          >
            <IconAlert className="h-5 w-5" />
          </span>
          <div>
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
