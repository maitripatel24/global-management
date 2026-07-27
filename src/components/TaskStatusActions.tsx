"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/app/actions/tasks";
import { useToast } from "@/components/Toast";
import { IconPlay, IconCheckCircle } from "@/components/icons";

export function TaskStatusActions({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const showToast = useToast();

  function setStatus(next: "IN_PROGRESS" | "DONE") {
    startTransition(async () => {
      await updateTaskStatus(taskId, next);
      showToast("success", next === "DONE" ? "Task marked as done." : "Task started.");
      router.refresh();
    });
  }

  if (status === "DONE" || status === "REVIEWED") {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {status === "PENDING" && (
        <button
          disabled={isPending}
          onClick={() => setStatus("IN_PROGRESS")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          <IconPlay className="h-5 w-5" />
          Start task
        </button>
      )}
      <button
        disabled={isPending}
        onClick={() => setStatus("DONE")}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 text-base font-semibold text-white transition-all hover:bg-green-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        <IconCheckCircle className="h-5 w-5" />
        Mark as done
      </button>
    </div>
  );
}
