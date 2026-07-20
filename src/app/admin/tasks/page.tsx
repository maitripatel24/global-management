import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { IconPaperclip } from "@/components/icons";
import { dueUrgency, dueUrgencyStyles } from "@/lib/dueDate";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  REVIEWED: "bg-purple-100 text-purple-700",
};

type FilterKey = "all" | "open" | "review" | "reviewed";

const filters: { key: FilterKey; label: string; statuses: string[] }[] = [
  { key: "all", label: "All", statuses: [] },
  { key: "open", label: "Open", statuses: ["PENDING", "IN_PROGRESS"] },
  { key: "review", label: "Awaiting review", statuses: ["DONE"] },
  { key: "reviewed", label: "Reviewed", statuses: ["REVIEWED"] },
];

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; company?: string }>;
}) {
  await requireUser("ADMIN");
  const { filter: rawFilter, company: companyFilter } = await searchParams;
  const activeFilter: FilterKey = filters.some((f) => f.key === rawFilter) ? (rawFilter as FilterKey) : "all";

  const [tasks, employees, companies] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { assignedTo: true, company: true, _count: { select: { attachments: true } } },
    }),
    prisma.user.findMany({ where: { role: "EMPLOYEE", active: true }, select: { id: true, name: true } }),
    prisma.company.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const countFor = (statuses: string[]) =>
    statuses.length === 0 ? tasks.length : tasks.filter((t) => statuses.includes(t.status)).length;

  const activeStatuses = filters.find((f) => f.key === activeFilter)!.statuses;
  let visibleTasks = activeStatuses.length === 0 ? tasks : tasks.filter((t) => activeStatuses.includes(t.status));
  if (companyFilter) {
    visibleTasks = visibleTasks.filter((t) => t.companyId === companyFilter);
  }

  const filterQuery = (extra: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { filter: activeFilter === "all" ? undefined : activeFilter, company: companyFilter, ...extra };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    return qs ? `/admin/tasks?${qs}` : "/admin/tasks";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Assign a new task</h2>
        <CreateTaskForm employees={employees} companies={companies} />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={filterQuery({ filter: f.key === "all" ? undefined : f.key })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label} ({countFor(f.statuses)})
          </Link>
        ))}
      </div>

      {companies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={filterQuery({ company: undefined })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !companyFilter
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All companies
          </Link>
          {companies.map((c) => (
            <Link
              key={c.id}
              href={filterQuery({ company: c.id })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                companyFilter === c.id
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Company</th>
                <th className="px-4 py-2">Assignee</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleTasks.map((task) => {
                const urgency = dueUrgency(task.dueDate, task.status);
                return (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tasks/${task.id}`}
                        className="inline-flex items-center gap-1.5 font-medium text-slate-800 hover:underline"
                      >
                        {task.title}
                        {task._count.attachments > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs font-normal text-slate-400">
                            <IconPaperclip className="h-3 w-3" />
                            {task._count.attachments}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{task.company?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{task.assignedTo.name}</td>
                    <td className="px-4 py-3 text-slate-500">{task.priority}</td>
                    <td className={`px-4 py-3 ${dueUrgencyStyles[urgency]}`}>
                      {task.dueDate
                        ? `${task.dueDate.toLocaleDateString()}${urgency === "overdue" ? " (overdue)" : urgency === "soon" ? " (soon)" : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {visibleTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                    No tasks in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
