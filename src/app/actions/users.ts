"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

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

export type PendingActionResult = { error?: string; success?: boolean };

// Approves an employee who signed up themselves. Only works on accounts still
// marked pending, and only for a signed-in admin.
export async function approveUser(userId: string): Promise<PendingActionResult> {
  await requireUser("ADMIN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.pendingApproval || user.role !== "EMPLOYEE") {
    return { error: "This request is no longer pending." };
  }

  await prisma.user.update({ where: { id: userId }, data: { active: true, pendingApproval: false } });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

// Rejects a sign-up request by deleting the never-activated account.
export async function rejectUser(userId: string): Promise<PendingActionResult> {
  await requireUser("ADMIN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.pendingApproval || user.role !== "EMPLOYEE") {
    return { error: "This request is no longer pending." };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    return { error: "Couldn't remove this request. Please try again." };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function setUserActive(userId: string, active: boolean) {
  await requireUser("ADMIN");
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}
