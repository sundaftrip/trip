import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return url;
  const u = new URL(url);
  u.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT ?? "3");
  u.searchParams.set("pool_timeout", process.env.PRISMA_POOL_TIMEOUT ?? "20");
  if (!u.searchParams.has("pgbouncer")) u.searchParams.set("pgbouncer", "true");
  return u.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildUrl(),
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
