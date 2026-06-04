import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tour);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const permKey = "status" in body && Object.keys(body).length === 1 ? "tour_status" : "tour_edit";
  if (!await checkPermission(session, permKey))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const tour = await prisma.tour.update({ where: { id }, data: body });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "UPDATE", resource: "TOUR",
    resourceId: tour.id, resourceName: tour.title,
    detail: "status" in body && Object.keys(body).length === 1 ? `Status → ${body.status}` : undefined,
  });

  revalidatePublicContent();
  return NextResponse.json(tour);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "tour_delete"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk menghapus tour" }, { status: 403 });

  const { id } = await params;
  const tour = await prisma.tour.findUnique({ where: { id }, select: { title: true } });
  await prisma.tour.delete({ where: { id } });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "DELETE", resource: "TOUR",
    resourceId: id, resourceName: tour?.title,
  });

  revalidatePublicContent();
  return NextResponse.json({ success: true });
}
