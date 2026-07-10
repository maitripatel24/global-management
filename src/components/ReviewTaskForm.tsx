"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewTask } from "@/app/actions/tasks";
import { useToast } from "@/components/Toast";
import { IconStar } from "@/components/icons";

export function ReviewTaskForm({ taskId }: { taskId: string }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const showToast = useToast();

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">Review this task</h2>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Feedback for the employee..."
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Rating</label>
        <div className="flex" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHoverRating(n)}
              onClick={() => setRating(n)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${n} out of 5`}
            >
              <IconStar
                className={`h-5 w-5 ${
                  n <= (hoverRating || rating) ? "text-amber-400" : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">{rating} / 5</span>
      </div>
      <button
        disabled={isPending || !comment.trim()}
        onClick={() =>
          startTransition(async () => {
            await reviewTask(taskId, { comment, rating });
            showToast("success", "Review submitted.");
            router.refresh();
          })
        }
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
}
