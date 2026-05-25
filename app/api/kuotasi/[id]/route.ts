import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { getQuotation, recalcPricing } from "@/lib/kuotasi/data";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_view")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  const q = await getQuotation(id);
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(q);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_edit")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  // Whitelist field yang boleh diupdate via endpoint ini (header quote).
  // Days/cost/addons punya endpoint terpisah.
  const data: Record<string, unknown> = {};
  for (const k of [
    "title", "country", "durationDays", "status",
    "currency", "kursForeign", "marginPct", "roundIdrTo",
    "notes",
  ]) {
    if (k in body) data[k] = body[k];
  }
  if ("validUntil" in body) data.validUntil = body.validUntil ? new Date(body.validUntil) : null;

  const updated = await prisma.quotation.update({ where: { id }, data });

  // Kurs/margin berubah → recalc semua tier.
  if ("kursForeign" in body || "marginPct" in body || "roundIdrTo" in body) {
    await recalcPricing(id);
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_delete")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  const q = await prisma.quotation.findUnique({ where: { id } });
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.quotation.delete({ where: { id } });
  await logActivity({
    userId: session.user.id!,
    userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role,
    action: "DELETE",
    resource: "KUOTASI",
    resourceId: q.id,
    resourceName: q.title,
  });

  return NextResponse.json({ ok: true });
}
