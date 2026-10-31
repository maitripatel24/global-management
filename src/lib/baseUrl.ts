import { headers } from "next/headers";

// The public address the current request came in on, e.g.
// https://office-management-teal.vercel.app, so links inside emails always
// point at wherever the app is actually being served.
export async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
