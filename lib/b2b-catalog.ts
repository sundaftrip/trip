import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

export const B2B_CATALOG_ACCESS_COOKIE = "sundaf_b2b_catalog_access";
export const B2B_CATALOG_ROUTE = "/b2b-russia-catalog";

function catalogSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "sundaf-b2b-catalog-local"
  );
}

function signatureFor(passwordId: string) {
  return crypto
    .createHmac("sha256", catalogSecret())
    .update(passwordId)
    .digest("base64url");
}

export function signCatalogAccessToken(passwordId: string) {
  return `${passwordId}.${signatureFor(passwordId)}`;
}

export function verifyCatalogAccessToken(token?: string | null) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [passwordId, signature] = parts;
  if (!passwordId || !signature) return null;

  const expected = signatureFor(passwordId);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer) ? passwordId : null;
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
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function sanitizeDownloadFileName(fileName: string) {
  const clean = fileName
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return clean || "sundaf-b2b-russia.pdf";
}
