import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermission, checkPermissions, hasPersistedUser } from "@/lib/permissions";
import { requiredPermissionsForMutation } from "@/lib/authorization";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { apiError } from "@/lib/api-error";
import { GEO_CMS_ROUTES, validateGeoRouteMutation } from "@/lib/geo-cms-routes";

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
  "content",
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

function validate(data: Record<string, unknown>): string | null {
  if ("title" in data && (typeof data.title !== "string" || !data.title.trim())) return "Title wajib diisi.";
  if ("answer" in data && (typeof data.answer !== "string" || !data.answer.trim())) return "Jawaban singkat wajib diisi.";
  if ("sections" in data && !Array.isArray(data.sections)) return "Konten tambahan harus berupa data valid.";
  if ("faqs" in data && !Array.isArray(data.faqs)) return "FAQ harus berupa data valid.";
  if ("content" in data && data.content !== null && (typeof data.content !== "object" || Array.isArray(data.content))) {
    return "Konten halaman harus berupa data valid.";
  }
  return null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const canReadDrafts = await hasPersistedUser(session);
  const page = await prisma.geoPage.findFirst({
    where: {
      OR: [{ id }, { routePath: id.startsWith("/") ? id : `/${id}` }],
      ...(!canReadDrafts ? { published: true, routePath: { in: GEO_CMS_ROUTES.map((route) => route.routePath) } } : {}),
    },
  });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const response = NextResponse.json(page);
  if (canReadDrafts) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Data halaman tidak valid." }, { status: 400 });

  const data = pickGeoInput(body);
  const isPublishOnly = "published" in data && Object.keys(data).length === 1;
  const requiredPermissions = requiredPermissionsForMutation(
    data,
    "geo_edit",
    { published: "geo_publish" },
  );
  if (!await checkPermissions(session, requiredPermissions))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  if (data.published !== undefined && typeof data.published !== "boolean")
    return NextResponse.json({ error: "Status publish harus bernilai benar/salah." }, { status: 422 });

  const error = validate(data);
  if (error) return NextResponse.json({ error }, { status: 422 });

  try {
    const existing = await prisma.geoPage.findUnique({ where: { id }, select: { routePath: true } });
    if (!existing) return NextResponse.json({ error: "Halaman GEO tidak ditemukan." }, { status: 404 });
    const routeError = validateGeoRouteMutation(data, existing.routePath);
    if (routeError) return NextResponse.json({ error: routeError }, { status: 422 });
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
      detail: isPublishOnly ? (body.published ? "Konten CMS diaktifkan" : "Konten CMS dinonaktifkan; halaman memakai konten bawaan jika tersedia") : undefined,
    });
    revalidatePublicContent();
    return NextResponse.json(page);
  } catch (err) {
    return apiError(err, { duplicate: "Route path GEO sudah dipakai." });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
