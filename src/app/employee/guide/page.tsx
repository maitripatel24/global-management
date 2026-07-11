import { requireUser } from "@/lib/session";
import { GuideSection, GuideStep, GuideTip } from "@/components/GuideSection";
import { IconTasks, IconInbox, IconBell, IconSparkle, IconChat } from "@/components/icons";

export default async function EmployeeGuidePage() {
  await requireUser("EMPLOYEE");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <IconSparkle className="h-5 w-5 text-amber-400" />
        <h1 className="text-xl font-semibold text-slate-900">Your Guide</h1>
      </div>
      <p className="-mt-3 text-sm text-slate-500">A quick walkthrough of everything you can do here.</p>

      <GuideSection icon={<IconTasks className="h-4.5 w-4.5" />} title="1. Your tasks" color="blue" index={0}>
        <GuideStep n={1}>Your <strong>Dashboard</strong> and <strong>My Tasks</strong> page show everything assigned to you.</GuideStep>
        <GuideStep n={2}>Open a task to see the full description, priority, due date, and any files your admin attached.</GuideStep>
        <GuideStep n={3}>Click <strong>Start task</strong> when you begin, and <strong>Mark as done</strong> when finished &mdash; this notifies your admin automatically.</GuideStep>
        <GuideStep n={4}>Once your admin reviews it, their feedback and rating appear right on the task.</GuideStep>
      </GuideSection>

      <GuideSection icon={<IconInbox className="h-4.5 w-4.5" />} title="2. Submit your daily update" color="green" index={1}>
        <p>At the end of each day, go to <strong>Daily Update</strong> and log what you worked on.</p>
        <GuideStep n={1}>Write a short summary of what you did today.</GuideStep>
        <GuideStep n={2}>Optionally, add an hourly breakdown: pick the hour, which task it relates to (or none), and how many hours you spent.</GuideStep>
        <GuideStep n={3}>Click <strong>Submit daily update</strong>. You can come back and edit the same day&apos;s update any time before midnight.</GuideStep>
        <GuideTip>The hourly breakdown feeds your admin&apos;s efficiency chart &mdash; filling it in helps show the real work you&apos;re putting in.</GuideTip>
      </GuideSection>

      <GuideSection icon={<IconChat className="h-4.5 w-4.5" />} title="3. Chat with your admin" color="amber" index={2}>
        <p>Go to <strong>Chat</strong> to message management directly &mdash; it updates live, no need to refresh the page.</p>
      </GuideSection>

      <GuideSection icon={<IconBell className="h-4.5 w-4.5" />} title="4. Notifications" color="purple" index={3}>
        <p>The bell icon in the top bar shows a red badge when you have something new &mdash; a task assignment, review feedback, or a chat message from your admin. Click it to see the full list, and click any notification to jump straight to what it&apos;s about.</p>
      </GuideSection>
    </div>
  );
}
