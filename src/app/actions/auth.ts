"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/retry";
import { notifyAdmins } from "@/lib/notify";
import { sendMail } from "@/lib/mailer";
import { getBaseUrl } from "@/lib/baseUrl";

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

// Where to send someone after signing in. Only the path of the requested page
// is used (never its host), and only inside the area their role may open, so
// a crafted link can't redirect people to another site.
function pickDestination(raw: string | null, role?: string) {
  const area = role === "ADMIN" ? "/admin" : "/employee";
  if (!raw) return area;
  try {
    const url = new URL(raw, "http://local");
    const path = url.pathname + url.search;
    if (url.pathname === area || url.pathname.startsWith(`${area}/`)) return path;
  } catch {}
  return area;
}

export async function login(_prevState: LoginState, formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || null;

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
  redirect(pickDestination(callbackUrl, user?.role));
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

  let created: { id: string };
  try {
    created = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: "EMPLOYEE",
        active: false,
        passwordHash: await bcrypt.hash(password, 10),
      },
      select: { id: true },
    });
  } catch {
    return { error: "An account with this email or phone number already exists. Try signing in, or contact your admin." };
  }

  const approvePath = `/admin/approve/${created.id}`;

  // None of the notifications below may fail the sign-up: the account exists
  // either way and still shows up in Admin > Users.
  try {
    await notifyAdmins(`${name} signed up and is waiting for your approval.`, approvePath);
  } catch {}

  // Approval email. The link only works for a signed-in admin, so having the
  // email alone is not enough to approve anyone.
  const approver = process.env.SIGNUP_APPROVAL_EMAIL;
  if (approver) {
    try {
      const base = await getBaseUrl();
      await sendMail(
        approver,
        `New sign-up waiting for approval: ${name}`,
        `${name} has signed up for Office Manager and is waiting for your approval.\n\n` +
          `Email: ${email}\nPhone: ${phone}\n\n` +
          `To approve, open this link and sign in as an admin:\n${base}${approvePath}\n\n` +
          `If you don't recognise this person, ignore this email. The account stays switched off.`,
      );
    } catch {}
  }

  return { success: true };
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/login");
}
