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
  if ("routePath" in data) data.routePath = normalizeRoutePath(data.routePath);
  if ("routePath" in data && (!data.routePath || typeof data.routePath !== "string")) return "Route path wajib diisi.";
  if ("title" in data && (typeof data.title !== "string" || !data.title.trim())) return "Title wajib diisi.";
  if ("answer" in data && (typeof data.answer !== "string" || !data.answer.trim())) return "Jawaban singkat wajib diisi.";
  if ("sections" in data && !Array.isArray(data.sections)) return "Sections harus berupa array JSON.";
  if ("faqs" in data && !Array.isArray(data.faqs)) return "FAQ harus berupa array JSON.";
  return null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.geoPage.findFirst({ where: { OR: [{ id }, { routePath: id.startsWith("/") ? id : `/${id}` }] } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const isPublishOnly = "published" in body && Object.keys(body).length === 1;
  const permKey = isPublishOnly ? "geo_publish" : "geo_edit";
  if (!await checkPermission(session, permKey))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const data = pickGeoInput(body);
  const error = validate(data);
  if (error) return NextResponse.json({ error }, { status: 422 });

  try {
    const page = await prisma.geoPage.update({
      where: { id },
      data: data as unknown as Prisma.GeoPageUncheckedUpdateInput,
    });
    await logActivity({
      userId: session.user.id!,
      userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role,
      action: "UPDATE",
      resource: "GEO",
      resourceId: page.id,
      resourceName: page.title,
      detail: isPublishOnly ? (body.published ? "Dipublish" : "Di-unpublish") : undefined,
    });
    revalidatePublicContent();
    return NextResponse.json(page);
  } catch (err) {
    return apiError(err, { duplicate: "Route path GEO sudah dipakai." });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "geo_delete"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk menghapus halaman GEO" }, { status: 403 });

  const { id } = await params;
  try {
    const page = await prisma.geoPage.findUnique({ where: { id }, select: { title: true } });
    await prisma.geoPage.delete({ where: { id } });
    await logActivity({
      userId: session.user.id!,
      userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role,
      action: "DELETE",
      resource: "GEO",
      resourceId: id,
      resourceName: page?.title,
    });
    revalidatePublicContent();
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}

