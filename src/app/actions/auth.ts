"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/retry";
import { notifyAdmins } from "@/lib/notify";

export type LoginState = { error?: string } | undefined;
export type SignUpState = { error?: string; success?: boolean } | undefined;

// True when the credentials are correct but the account is switched off
// (awaiting admin approval, or disabled). Only reveals this to someone who
// already knows the right password.
async function isDisabledAccountWithValidPassword(identifier: string, password: string) {
  try {
    const user = await withDbRetry(() =>
      identifier.includes("@")
        ? prisma.user.findUnique({ where: { email: identifier.toLowerCase() } })
        : prisma.user.findUnique({ where: { phone: identifier.replace(/\D/g, "") } }),
    );
    return !!user && !user.active && (await bcrypt.compare(password, user.passwordHash));
  } catch {
    return false;
  }
}

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
        if (await isDisabledAccountWithValidPassword(identifier, password)) {
          return {
            error: "Your account is waiting for admin approval, or has been disabled. Please contact your admin.",
          };
        }
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

// Public employee sign-up. Always creates an EMPLOYEE (never an admin) and
// leaves the account switched off until an admin approves it from the Users page.
export async function signUp(_prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  // Hidden honeypot field: real people never see or fill it, simple bots do.
  if ((formData.get("website") as string)?.trim()) return { success: true };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !phone || !password) {
    return { error: "All fields are required." };
  }
  if (name.length > 100 || email.length > 200) {
    return { error: "Name or email is too long." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!/^\d{7,15}$/.test(phone)) {
    return { error: "Phone number must contain only digits (7-15 digits)." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const duplicate = await withDbRetry(() =>
    prisma.user.findFirst({ where: { OR: [{ email }, { phone }] }, select: { id: true } }),
  );
  if (duplicate) {
    return { error: "An account with this email or phone number already exists. Try signing in, or contact your admin." };
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: "EMPLOYEE",
        active: false,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
  } catch {
    return { error: "An account with this email or phone number already exists. Try signing in, or contact your admin." };
  }

  try {
    await notifyAdmins(`${name} signed up and is waiting for your approval.`, "/admin/users");
  } catch {
    // The account exists either way; admins will still see it in the Users list.
  }

  return { success: true };
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/login");
}
