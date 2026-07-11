import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getMessagesSince } from "@/app/actions/messages";
import { ChatThread } from "@/components/ChatThread";

export default async function AdminChatThreadPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const admin = await requireUser("ADMIN");

  const employee = await prisma.user.findUnique({ where: { id: employeeId } });
  if (!employee || employee.role !== "EMPLOYEE") {
    notFound();
  }

  const messages = await getMessagesSince(employeeId, null);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Chat with {employee.name}</h1>
        <p className="text-sm text-slate-500">{employee.email}</p>
      </div>
      <ChatThread employeeId={employeeId} currentUserId={admin.id} initialMessages={messages} />
    </div>
  );
}
