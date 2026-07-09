"use client";

import { useRouter, useSearchParams } from "next/navigation";

type EmployeeOption = { id: string; name: string };

export function EmployeeFilterSelect({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("employeeId") ?? "";

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) {
          params.set("employeeId", e.target.value);
        } else {
          params.delete("employeeId");
        }
        router.push(`/admin/analytics?${params.toString()}`);
      }}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
    >
      <option value="">All employees</option>
      {employees.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name}
        </option>
      ))}
    </select>
  );
}
