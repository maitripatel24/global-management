import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser(role?: "ADMIN" | "EMPLOYEE") {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (role && session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/employee");
  }
  return session.user;
}
