"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewTask } from "@/app/actions/tasks";

export function ReviewTaskForm({ taskId }: { taskId: string }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">Review this task</h2>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Feedback for the employee..."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </div>
      <button
        disabled={isPending || !comment.trim()}
        onClick={() =>
          startTransition(async () => {
            await reviewTask(taskId, { comment, rating });
            router.refresh();
          })
        }
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}
