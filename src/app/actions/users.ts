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
  const password = formData.get("password") as string;
  const role = formData.get("role") as "ADMIN" | "EMPLOYEE";

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserActive(userId: string, active: boolean) {
  await requireUser("ADMIN");
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}
