"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/retry";

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", { identifier, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      // authorize() returning null (bad credentials) surfaces as
      // "CredentialsSignin"; anything else (e.g. a database connection
      // blip) surfaces as "CallbackRouteError" and deserves its own message
      // rather than being misreported as a wrong password.
      if (err.type === "CredentialsSignin") {
        return { error: "Invalid email/phone or password." };
      }
      return { error: "Couldn't connect to the server. Please try again in a few seconds." };
    }
    throw err;
  }

  // Look up the role directly rather than re-reading auth(), since the
  // session cookie just set by signIn() isn't reliably visible yet within
  // the same server action invocation.
  const isEmail = identifier.includes("@");
  const user = await withDbRetry(() =>
    isEmail
      ? prisma.user.findUnique({ where: { email: identifier.toLowerCase() }, select: { role: true } })
      : prisma.user.findUnique({ where: { phone: identifier.replace(/\D/g, "") }, select: { role: true } }),
  );
  redirect(user?.role === "ADMIN" ? "/admin" : "/employee");
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/login");
}
