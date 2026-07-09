"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }

  // Look up the role directly rather than re-reading auth(), since the
  // session cookie just set by signIn() isn't reliably visible yet within
  // the same server action invocation.
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  redirect(user?.role === "ADMIN" ? "/admin" : "/employee");
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/login");
}
