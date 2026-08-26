import type { NextRequest } from "next/server";

export const PUBLIC_MUTATION_BODY_LIMIT = 10_240;

export function validateSameOriginMutation(req: NextRequest) {
  const contentType = req.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") {
    return { ok: false as const, status: 415, error: "Content-Type harus application/json." };
  }

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > PUBLIC_MUTATION_BODY_LIMIT) {
    return { ok: false as const, status: 413, error: "Permintaan terlalu besar." };
  }

  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return { ok: false as const, status: 403, error: "Permintaan lintas situs ditolak." };
  }

  const origin = normalizedOrigin(req.headers.get("origin"));
  const trustedOrigins = requestOrigins(req);
  if (!origin || !trustedOrigins.has(origin)) {
    return { ok: false as const, status: 403, error: "Origin tidak diizinkan." };
  }

  return { ok: true as const };
}

export async function readBoundedJson(req: NextRequest) {
  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > PUBLIC_MUTATION_BODY_LIMIT) {
    return { ok: false as const, status: 413, error: "Permintaan terlalu besar." };
  }

  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false as const, status: 400, error: "Badan permintaan tidak valid." };
    }
    return { ok: true as const, value: value as Record<string, unknown> };
  } catch {
    return { ok: false as const, status: 400, error: "JSON tidak valid." };
  }
}

export const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function requestOrigins(req: NextRequest) {
  const values = new Set<string>();
  for (const candidate of [
    req.nextUrl.origin,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    vercelOrigin(process.env.VERCEL_BRANCH_URL),
    vercelOrigin(process.env.VERCEL_URL),
  ]) {
    const normalized = normalizedOrigin(candidate || null);
    if (normalized) values.add(normalized);
  }
  return values;
}

function vercelOrigin(host: string | undefined) {
  if (!host) return null;
  return host.startsWith("http://") || host.startsWith("https://")
    ? host
    : `https://${host}`;
}

function normalizedOrigin(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}
