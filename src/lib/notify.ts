import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function notifyUser(userId: string, message: string, link?: string) {
  const [, user] = await Promise.all([
    prisma.notification.create({ data: { userId, message, link } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (user) {
    void sendMail(user.email, "Office Manager notification", message);
  }
}

export async function notifyAdmins(message: string, link?: string) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", active: true } });
  await Promise.all(admins.map((admin) => notifyUser(admin.id, message, link)));
}
