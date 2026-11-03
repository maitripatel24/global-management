import { requireUser } from "@/lib/session";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export default async function AdminAccountPage() {
  const user = await requireUser("ADMIN");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My account</h1>
        <p className="text-sm text-slate-500">
          {user.name} · {user.email}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
