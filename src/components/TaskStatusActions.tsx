"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/app/actions/tasks";

export function TaskStatusActions({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(next: "IN_PROGRESS" | "DONE") {
    startTransition(async () => {
      await updateTaskStatus(taskId, next);
      router.refresh();
    });
  }

  if (status === "DONE" || status === "REVIEWED") {
    return null;
  }

  return (
    <div className="flex gap-2">
      {status === "PENDING" && (
        <button
          disabled={isPending}
          onClick={() => setStatus("IN_PROGRESS")}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Start task
        </button>
      )}
      <button
        disabled={isPending}
        onClick={() => setStatus("DONE")}
        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        Mark as done
      </button>
    </div>
  );
}
