import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { apiError } from "@/lib/api-error";

const STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
type InquiryStatus = (typeof STATUSES)[number];
const STATUS_NAMES: Record<InquiryStatus, string> = { NEW: "Baru", CONTACTED: "Dihubungi", CLOSED: "Selesai" };

// PATCH admin — ubah status lead.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "inquiry_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin mengubah lead" }, { status: 403 });
  const { id } = await ctx.params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!body.status || !STATUSES.includes(body.status as InquiryStatus)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 422 });
  }

  try {
    const item = await prisma.inquiry.update({
      where: { id },
      data: { status: body.status as InquiryStatus },
    });
    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "INQUIRY",
      resourceId: item.id, resourceName: item.name, detail: `Status → ${STATUS_NAMES[item.status as InquiryStatus] ?? item.status}`,
    });
    return NextResponse.json(item);
  } catch (err) {
    return apiError(err);
  }
}

// DELETE admin — hapus lead.
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "inquiry_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin menghapus lead" }, { status: 403 });
  const { id } = await ctx.params;
  try {
    const item = await prisma.inquiry.delete({ where: { id } });
    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "DELETE", resource: "INQUIRY",
      resourceId: id, resourceName: item.name,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err);
  }
}
