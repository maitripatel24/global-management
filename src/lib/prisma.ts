import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Supabase is used whenever SUPA_POSTGRES_URL is set. DATABASE_URL (Neon, from
// the schema's datasource) stays as the fallback and is not removed yet.
function resolveDatasourceUrl(): string | undefined {
  const raw = process.env.SUPA_POSTGRES_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    // Supabase's pooler adds a `supa` marker param that Prisma doesn't understand.
    url.searchParams.delete("supa");
    // Port 6543 is Supabase's transaction-mode pooler (pgbouncer); Prisma needs
    // to be told so it doesn't use prepared statements across pooled sessions.
    if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    console.log("[db-diag] using SUPA_POSTGRES_URL", { host: url.hostname, port: url.port, user: url.username, database: url.pathname });
    return url.toString();
  } catch {
    return raw;
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: resolveDatasourceUrl() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
