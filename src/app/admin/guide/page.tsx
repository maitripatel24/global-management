import { requireUser } from "@/lib/session";
import { GuideSection, GuideStep, GuideTip } from "@/components/GuideSection";
import {
  IconUsers,
  IconTasks,
  IconCheckCircle,
  IconInbox,
  IconChart,
  IconBell,
  IconSparkle,
  IconChat,
} from "@/components/icons";

export default async function AdminGuidePage() {
  await requireUser("ADMIN");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <IconSparkle className="h-5 w-5 text-amber-400" />
        <h1 className="text-xl font-semibold text-slate-900">Admin Guide</h1>
      </div>
      <p className="-mt-3 text-sm text-slate-500">
        Everything you can do as an admin, in the order you&apos;ll likely use it.
      </p>

      <GuideSection icon={<IconUsers className="h-4.5 w-4.5" />} title="1. Add your team" color="purple" index={0}>
        <p>
          Only admins can create logins &mdash; there&apos;s no public signup, so random people can&apos;t
          join your workspace.
        </p>
        <GuideStep n={1}>Go to <strong>Users</strong> in the top navigation.</GuideStep>
        <GuideStep n={2}>Fill in the person&apos;s name, email, a password, and pick their role (Employee or Admin).</GuideStep>
        <GuideStep n={3}>Click <strong>Create account</strong> &mdash; give them the email + password to log in with.</GuideStep>
        <GuideStep n={4}>Need to remove someone&apos;s access later? Click the status pill next to their name to disable their login without deleting their history.</GuideStep>
        <GuideTip>You can have as many admins as you like &mdash; just create their account with the &quot;Admin&quot; role.</GuideTip>
      </GuideSection>

      <GuideSection icon={<IconTasks className="h-4.5 w-4.5" />} title="2. Assign tasks" color="blue" index={1}>
        <GuideStep n={1}>Go to <strong>Tasks</strong> and fill in the &quot;Assign a new task&quot; form.</GuideStep>
        <GuideStep n={2}>Set a title, description, who it&apos;s for, priority, and an optional due date.</GuideStep>
        <GuideStep n={3}>
          Optionally attach up to 5 files (max 5MB each) &mdash; useful for reference documents, spreadsheets, or
          screenshots the employee will need.
        </GuideStep>
        <GuideStep n={4}>The employee gets an instant in-app notification and sees it on their dashboard.</GuideStep>
        <GuideTip>Tasks move through four stages automatically: Pending → In Progress → Done → Reviewed.</GuideTip>
      </GuideSection>

      <GuideSection icon={<IconCheckCircle className="h-4.5 w-4.5" />} title="3. Review completed work" color="green" index={2}>
        <GuideStep n={1}>When an employee marks a task &quot;Done&quot;, it shows up under &quot;Tasks awaiting your review&quot; on your Dashboard.</GuideStep>
        <GuideStep n={2}>Open the task, write feedback, and pick a star rating (1&ndash;5).</GuideStep>
        <GuideStep n={3}>Submitting a review notifies the employee and marks the task &quot;Reviewed&quot; &mdash; it&apos;s now part of their permanent record.</GuideStep>
      </GuideSection>

      <GuideSection icon={<IconInbox className="h-4.5 w-4.5" />} title="4. Check daily updates" color="amber" index={3}>
        <GuideStep n={1}>Go to <strong>Employees</strong> to see everyone at a glance, including whether they&apos;ve submitted today&apos;s update.</GuideStep>
        <GuideStep n={2}>Click into any employee to see their full task history and every daily update they&apos;ve ever submitted, including the hour-by-hour breakdown of what they worked on.</GuideStep>
      </GuideSection>

      <GuideSection icon={<IconChart className="h-4.5 w-4.5" />} title="5. Read the efficiency analytics" color="slate" index={4}>
        <p>The <strong>Analytics</strong> page turns everyone&apos;s hourly work logs into one chart.</p>
        <GuideStep n={1}>Bars show total hours logged in each hour of the day, across the last 30 days.</GuideStep>
        <GuideStep n={2}>The line shows efficiency % &mdash; how much of that logged time went to tasks that were actually completed.</GuideStep>
        <GuideStep n={3}>Use the dropdown to filter down to a single employee.</GuideStep>
        <GuideTip>This chart is empty until employees start filling in the optional &quot;hourly breakdown&quot; on their daily updates &mdash; encourage them to use it.</GuideTip>
      </GuideSection>

      <GuideSection icon={<IconChat className="h-4.5 w-4.5" />} title="6. Chat with employees" color="green" index={5}>
        <GuideStep n={1}>Go to <strong>Chats</strong> to see every employee and their most recent message.</GuideStep>
        <GuideStep n={2}>Click an employee to open your conversation with them and send a message &mdash; it updates live, no refresh needed.</GuideStep>
        <GuideTip>Every admin sees the same conversation with a given employee, so anyone on your team can jump in.</GuideTip>
      </GuideSection>

      <GuideSection icon={<IconBell className="h-4.5 w-4.5" />} title="Notifications" color="purple" index={6}>
        <p>The bell icon in the top bar lights up whenever an employee submits a daily update, marks a task done, or sends a chat message. Click a notification to jump straight to it, or &quot;Mark all read&quot; to clear the count.</p>
      </GuideSection>
    </div>
  );
}
