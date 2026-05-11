import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "receipt_view"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: { tour: true } });
  if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(receipt);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "receipt_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk mengedit receipt" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const receipt = await prisma.receipt.update({ where: { id }, data: body });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "UPDATE", resource: "RECEIPT",
    resourceId: receipt.id, resourceName: receipt.customerName,
    detail: body.status ? `Status → ${body.status}` : undefined,
  });

  return NextResponse.json(receipt);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "receipt_delete"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk menghapus receipt" }, { status: 403 });

  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({ where: { id }, select: { customerName: true, receiptNo: true } });
  await prisma.receipt.delete({ where: { id } });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "DELETE", resource: "RECEIPT",
    resourceId: id, resourceName: receipt?.customerName,
    detail: `Receipt ${receipt?.receiptNo}`,
  });

  return NextResponse.json({ success: true });
}
