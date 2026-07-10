"use client";

import { useActionState, useEffect, useState } from "react";
import { submitDailyUpdate, type DailyUpdateEntryInput } from "@/app/actions/dailyUpdates";
import { useToast } from "@/components/Toast";
import { IconPlus } from "@/components/icons";

type TaskOption = { id: string; title: string };

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am - 8pm

export function DailyUpdateForm({
  date,
  initialSummary,
  initialEntries,
  tasks,
}: {
  date: string;
  initialSummary: string;
  initialEntries: DailyUpdateEntryInput[];
  tasks: TaskOption[];
}) {
  const [state, formAction, isPending] = useActionState(submitDailyUpdate, undefined);
  const [entries, setEntries] = useState<DailyUpdateEntryInput[]>(
    initialEntries.length > 0 ? initialEntries : [{ hour: 9, taskId: null, hoursSpent: 1, note: "" }],
  );
  const showToast = useToast();

  useEffect(() => {
    if (state?.success) showToast("success", "Daily update saved.");
    else if (state?.error) showToast("error", state.error);
  }, [state, showToast]);

  function updateEntry(index: number, patch: Partial<DailyUpdateEntryInput>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function addEntry() {
    setEntries((prev) => [...prev, { hour: 9, taskId: null, hoursSpent: 1, note: "" }]);
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="entries" value={JSON.stringify(entries)} />

      <div>
        <label className="block text-sm font-medium text-slate-700">Summary of what you did today</label>
        <textarea
          name="summary"
          required
          defaultValue={initialSummary}
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
          placeholder="e.g. Finished the sales report, fixed the invoice bug, onboarded new client contacts..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">Hourly breakdown (optional)</label>
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 transition-colors hover:text-slate-950"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add hour
          </button>
        </div>

        <div className="mt-2 space-y-2">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="animate-fade-in-up flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-2 transition-colors hover:border-slate-300"
            >
              <select
                value={entry.hour}
                onChange={(e) => updateEntry(i, { hour: Number(e.target.value) })}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h > 12 ? h - 12 : h}:00 {h >= 12 ? "PM" : "AM"}
                  </option>
                ))}
              </select>

              <select
                value={entry.taskId ?? ""}
                onChange={(e) => updateEntry(i, { taskId: e.target.value || null })}
                className="min-w-[10rem] flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
              >
                <option value="">No specific task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={0.25}
                max={8}
                step={0.25}
                value={entry.hoursSpent}
                onChange={(e) => updateEntry(i, { hoursSpent: Number(e.target.value) })}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs"
              />
              <span className="text-xs text-slate-500">hrs</span>

              <input
                type="text"
                value={entry.note}
                onChange={(e) => updateEntry(i, { note: e.target.value })}
                placeholder="note (optional)"
                className="min-w-[8rem] flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
              />

              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Submit daily update"}
      </button>
    </form>
  );
}
