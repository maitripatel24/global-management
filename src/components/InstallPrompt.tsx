"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "install-prompt-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true,
    );
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  }

  if (isStandalone || dismissed || (!isIOS && !deferredPrompt)) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-lg border border-slate-200 bg-white p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:w-80">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">Install Office Manager</p>
        <button
          onClick={dismiss}
          className="text-xs text-slate-400 hover:text-slate-600"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
      {isIOS ? (
        <p className="mt-1 text-xs text-slate-500">
          Tap the Share button, then &quot;Add to Home Screen&quot; to install this app.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-slate-500">Add this app to your home screen for quick access.</p>
          <button
            onClick={handleInstallClick}
            className="mt-2 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
          >
            Install
          </button>
        </>
      )}
    </div>
  );
}
