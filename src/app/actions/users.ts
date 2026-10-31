"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { sendMail } from "@/lib/mailer";
import { getBaseUrl } from "@/lib/baseUrl";

export type CreateUserState = { error?: string; success?: boolean } | undefined;

export async function createUser(_prevState: CreateUserState, formData: FormData) {
  await requireUser("ADMIN");

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phoneRaw = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "EMPLOYEE";

  if (!name || !email || !phoneRaw || !password || !role) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (!/^\d{7,15}$/.test(phoneRaw)) {
    return { error: "Phone number must contain only digits (7-15 digits)." };
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return { error: "An account with this email already exists." };
  }
  const existingPhone = await prisma.user.findUnique({ where: { phone: phoneRaw } });
  if (existingPhone) {
    return { error: "An account with this phone number already exists." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone: phoneRaw,
      role,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export type ApproveUserState = { error?: string; success?: boolean; alreadyActive?: boolean };

// Approves a self-signed-up employee. Requires a signed-in admin, so an email
// link alone can never approve anyone.
export async function approveUser(userId: string): Promise<ApproveUserState> {
  const admin = await requireUser("ADMIN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Account not found." };
  if (user.role !== "EMPLOYEE") return { error: "Only employee accounts can be approved here." };
  if (user.active) return { success: true, alreadyActive: true };

  await prisma.user.update({ where: { id: userId }, data: { active: true } });

  const base = await getBaseUrl();
  await sendMail(
    user.email,
    "Your Office Manager account is approved",
    `Hi ${user.name},\n\nYour account has been approved by ${admin.name}. You can now sign in here:\n${base}/login\n`,
  );

  revalidatePath("/admin/users");
  revalidatePath(`/admin/approve/${userId}`);
  return { success: true };
}

export async function setUserActive(userId: string, active: boolean) {
  await requireUser("ADMIN");
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}
