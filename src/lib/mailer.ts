import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, text: string) {
  const client = getTransporter();
  if (!client) {
    console.log(`[mailer] SMTP not configured, skipping email to ${to}: ${subject}`);
    return;
  }
  try {
    await client.sendMail({
      from: process.env.EMAIL_FROM ?? "Office Manager <noreply@example.com>",
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
  }
}
