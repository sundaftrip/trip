import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function buildUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  let out = url;
  if (!out.includes("connection_limit")) out += `${sep}connection_limit=1`;
  if (!out.includes("pgbouncer")) out += `&pgbouncer=true`;
  return out;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildUrl(),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
