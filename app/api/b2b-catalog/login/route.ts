import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  B2B_CATALOG_ACCESS_COOKIE,
  B2B_CATALOG_ROUTE,
  catalogCookieOptions,
  signCatalogAccessToken,
} from "@/lib/b2b-catalog";

async function readPassword(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return {
      password: typeof body.password === "string" ? body.password : "",
      wantsJson: true,
    };
  }

  const formData = await req.formData();
  return {
    password: String(formData.get("password") ?? ""),
    wantsJson: false,
  };
}

function loginFailed(req: NextRequest, wantsJson: boolean) {
  if (wantsJson) {
    return NextResponse.json({ error: "Password tidak valid." }, { status: 401 });
  }
  return NextResponse.redirect(new URL(`${B2B_CATALOG_ROUTE}?error=1`, req.url), { status: 303 });
}

export async function POST(req: NextRequest) {
  const { password, wantsJson } = await readPassword(req);
  const trimmed = password.trim();
  if (!trimmed) return loginFailed(req, wantsJson);

  const candidates = await prisma.b2bCatalogPassword.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  let matchedId = "";
  for (const item of candidates) {
    if (await bcrypt.compare(trimmed, item.passwordHash)) {
      matchedId = item.id;
      break;
    }
  }

  if (!matchedId) return loginFailed(req, wantsJson);

  await prisma.b2bCatalogPassword.update({
    where: { id: matchedId },
    data: { lastUsedAt: new Date() },
  });

  const response = wantsJson
    ? NextResponse.json({ success: true })
    : NextResponse.redirect(new URL(B2B_CATALOG_ROUTE, req.url), { status: 303 });

  response.cookies.set(
    B2B_CATALOG_ACCESS_COOKIE,
    signCatalogAccessToken(matchedId),
    catalogCookieOptions(),
  );

  return response;
}
