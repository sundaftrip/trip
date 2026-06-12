import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { pickInput, badNumber, RECEIPT_INPUT_FIELDS } from "@/lib/api-input";
import { apiError } from "@/lib/api-error";
import type { Prisma } from "@prisma/client";

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
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Whitelist field — receiptNo & createdById tidak bisa diubah dari klien
  const data = pickInput(body, RECEIPT_INPUT_FIELDS);

  if (badNumber(data.amount))
    return NextResponse.json({ error: "Nominal harus berupa angka dan tidak boleh negatif." }, { status: 422 });
  if (data.pax !== undefined && (typeof data.pax !== "number" || !Number.isInteger(data.pax) || data.pax < 1))
    return NextResponse.json({ error: "Jumlah pax minimal 1." }, { status: 422 });

  try {
    const receipt = await prisma.receipt.update({
      where: { id },
      data: data as unknown as Prisma.ReceiptUncheckedUpdateInput,
    });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "RECEIPT",
      resourceId: receipt.id, resourceName: receipt.customerName,
      detail: body.status ? `Status → ${body.status}` : undefined,
    });

    return NextResponse.json(receipt);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "receipt_delete"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk menghapus receipt" }, { status: 403 });

  const { id } = await params;
  try {
    const receipt = await prisma.receipt.findUnique({ where: { id }, select: { customerName: true, receiptNo: true } });
    await prisma.receipt.delete({ where: { id } });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "DELETE", resource: "RECEIPT",
      resourceId: id, resourceName: receipt?.customerName,
      detail: `Receipt ${receipt?.receiptNo}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
