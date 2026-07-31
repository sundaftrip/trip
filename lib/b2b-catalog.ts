import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

export const B2B_CATALOG_ACCESS_COOKIE = "sundaf_b2b_catalog_access";
export const B2B_CATALOG_ROUTE = "/b2b-russia-catalog";
export const B2B_CATALOG_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

const B2B_CATALOG_TOKEN_VERSION = 1;
const B2B_CATALOG_CLOCK_SKEW_SECONDS = 60;
const MAX_TOKEN_LENGTH = 2048;

type CatalogAccessTokenPayload = {
  version: number;
  passwordId: string;
  issuedAt: number;
  expiresAt: number;
};

function catalogSecret() {
  const secret = [
    process.env.B2B_CATALOG_SECRET,
    process.env.AUTH_SECRET,
    process.env.NEXTAUTH_SECRET,
  ].find((candidate) => candidate && candidate.trim());

  if (!secret) {
    throw new Error("B2B catalog signing secret is not configured");
  }

  return secret;
}

function signatureFor(encodedPayload: string) {
  return crypto
    .createHmac("sha256", catalogSecret())
    .update(`sundaf-b2b-catalog:v${B2B_CATALOG_TOKEN_VERSION}:${encodedPayload}`)
    .digest("base64url");
}

function safeSignatureMatch(actual: string, expected: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(actual)) return false;

  const actualBuffer = Buffer.from(actual, "base64url");
  const expectedBuffer = Buffer.from(expected, "base64url");
  if (actualBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export function signCatalogAccessToken(passwordId: string, nowMs = Date.now()) {
  if (!passwordId.trim() || passwordId.length > 200) {
    throw new Error("B2B catalog password id is invalid");
  }
  if (!Number.isFinite(nowMs) || nowMs < 0) {
    throw new Error("B2B catalog token time is invalid");
  }

  const issuedAt = Math.floor(nowMs / 1000);
  const payload: CatalogAccessTokenPayload = {
    version: B2B_CATALOG_TOKEN_VERSION,
    passwordId,
    issuedAt,
    expiresAt: issuedAt + B2B_CATALOG_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encodedPayload}.${signatureFor(encodedPayload)}`;
}

export function verifyCatalogAccessToken(token?: string | null, nowMs = Date.now()) {
  if (!token || token.length > MAX_TOKEN_LENGTH || !Number.isFinite(nowMs) || nowMs < 0) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature || !/^[A-Za-z0-9_-]+$/.test(encodedPayload)) return null;

  try {
    const expected = signatureFor(encodedPayload);
    if (!safeSignatureMatch(signature, expected)) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<CatalogAccessTokenPayload>;
    const nowSeconds = Math.floor(nowMs / 1000);

    if (payload.version !== B2B_CATALOG_TOKEN_VERSION) return null;
    if (typeof payload.passwordId !== "string" || !payload.passwordId.trim() || payload.passwordId.length > 200) return null;
    if (!Number.isSafeInteger(payload.issuedAt) || !Number.isSafeInteger(payload.expiresAt)) return null;
    if ((payload.issuedAt as number) > nowSeconds + B2B_CATALOG_CLOCK_SKEW_SECONDS) return null;
    if ((payload.expiresAt as number) <= nowSeconds) return null;
    if ((payload.expiresAt as number) <= (payload.issuedAt as number)) return null;
    if ((payload.expiresAt as number) - (payload.issuedAt as number) > B2B_CATALOG_TOKEN_TTL_SECONDS) return null;

    return payload.passwordId;
  } catch {
    // Missing signing configuration and malformed tokens both fail closed.
    return null;
  }
}

export async function getCatalogAccessPasswordId() {
  const cookieStore = await cookies();
  return verifyCatalogAccessToken(cookieStore.get(B2B_CATALOG_ACCESS_COOKIE)?.value);
}

export function catalogCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: B2B_CATALOG_TOKEN_TTL_SECONDS,
  };
}

export function sanitizeDownloadFileName(fileName: string) {
  const clean = fileName
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return clean || "sundaf-b2b-russia.pdf";
}
