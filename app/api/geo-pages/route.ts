import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { apiError } from "@/lib/api-error";

const FIELDS = [
  "routePath",
  "title",
  "eyebrow",
  "metaTitle",
  "metaDescription",
  "answer",
  "primaryCtaLabel",
  "primaryCtaHref",
  "secondaryCtaLabel",
  "secondaryCtaHref",
  "sections",
  "faqs",
  "schemaType",
  "published",
  "order",
] as const;

function pickGeoInput(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const field of FIELDS) {
    if (field in body) data[field] = body[field];
  }
  return data;
}

function normalizeRoutePath(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function validate(data: Record<string, unknown>): string | null {
  data.routePath = normalizeRoutePath(data.routePath);
  if (typeof data.routePath !== "string" || !data.routePath) return "Route path wajib diisi.";
  if (typeof data.title !== "string" || !data.title.trim()) return "Title wajib diisi.";
  if (typeof data.answer !== "string" || !data.answer.trim()) return "Jawaban singkat wajib diisi.";
  if (!Array.isArray(data.sections)) return "Sections harus berupa array JSON.";
  if (!Array.isArray(data.faqs)) return "FAQ harus berupa array JSON.";
  return null;
}

export async function GET() {
  const pages = await prisma.geoPage.findMany({ orderBy: [{ order: "asc" }, { updatedAt: "desc" }] });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "geo_create"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat halaman GEO" }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const data = pickGeoInput(body);
  const error = validate(data);
  if (error) return NextResponse.json({ error }, { status: 422 });

  try {
    const page = await prisma.geoPage.create({ data: data as unknown as Prisma.GeoPageUncheckedCreateInput });
    await logActivity({
      userId: session.user.id!,
      userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role,
      action: "CREATE",
      resource: "GEO",
      resourceId: page.id,
      resourceName: page.title,
    });
    revalidatePublicContent();
    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    return apiError(err, { duplicate: "Route path GEO sudah dipakai." });
  }
}

