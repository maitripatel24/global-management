import { requireUser } from "@/lib/session";
import { getMessagesSince } from "@/app/actions/messages";
import { ChatThread } from "@/components/ChatThread";

export default async function EmployeeChatPage() {
  const user = await requireUser("EMPLOYEE");
  const messages = await getMessagesSince(user.id, null);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Chat with Admin</h1>
        <p className="text-sm text-slate-500">Message management directly &mdash; they&apos;ll be notified instantly.</p>
      </div>
      <ChatThread employeeId={user.id} currentUserId={user.id} initialMessages={messages} />
    </div>
  );
}
