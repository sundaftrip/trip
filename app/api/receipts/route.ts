import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateReceiptNo } from "@/lib/utils";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "receipt_view"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const receipts = await prisma.receipt.findMany({
    include: { tour: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(receipts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "receipt_create"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat receipt" }, { status: 403 });

  const body = await req.json();
  const receipt = await prisma.receipt.create({
    data: { ...body, receiptNo: generateReceiptNo(), createdById: session.user.id },
  });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "CREATE", resource: "RECEIPT",
    resourceId: receipt.id, resourceName: receipt.customerName,
    detail: `Receipt ${receipt.receiptNo}`,
  });

  return NextResponse.json(receipt, { status: 201 });
}
