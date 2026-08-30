import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermissions, hasPersistedUser } from "@/lib/permissions";
import { getPublicationCreatePolicy } from "@/lib/authorization";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { apiError } from "@/lib/api-error";
import { GEO_CMS_ROUTES, validateGeoRouteMutation } from "@/lib/geo-cms-routes";
import { validateGeoCmsStructuredInput } from "@/lib/geo-cms-input";

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
  const routeError = validateGeoRouteMutation(data);
  if (routeError) return routeError;
  if (typeof data.title !== "string" || !data.title.trim()) return "Title wajib diisi.";
  if (typeof data.answer !== "string" || !data.answer.trim()) return "Jawaban singkat wajib diisi.";
  if (!Array.isArray(data.sections)) return "Konten tambahan harus berupa data valid.";
  if (!Array.isArray(data.faqs)) return "FAQ harus berupa data valid.";
  return validateGeoCmsStructuredInput(data);
}

export async function GET() {
  const session = await auth();
  const canReadDrafts = await hasPersistedUser(session);
  const pages = await prisma.geoPage.findMany({
    where: canReadDrafts ? undefined : { published: true, routePath: { in: GEO_CMS_ROUTES.map((route) => route.routePath) } },
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
  });
  const response = NextResponse.json(pages);
  if (canReadDrafts) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Data halaman tidak valid." }, { status: 400 });

  const data = pickGeoInput(body);
  if (data.published !== undefined && typeof data.published !== "boolean")
    return NextResponse.json({ error: "Status publish harus bernilai benar/salah." }, { status: 422 });
  const publicationPolicy = getPublicationCreatePolicy(
    data.published,
    "geo_create",
    "geo_publish",
  );
  data.published = publicationPolicy.published;
  if (!await checkPermissions(session, publicationPolicy.requiredPermissions))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat atau mempublish halaman GEO" }, { status: 403 });

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
