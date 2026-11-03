import { requireUser } from "@/lib/session";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default async function EmployeeAccountPage() {
  const user = await requireUser("EMPLOYEE");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My account</h1>
        <p className="mt-1 text-base text-slate-500">
          {user.name} · {user.email}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
