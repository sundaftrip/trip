import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateReceiptNo } from "@/lib/utils";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { pickInput, badNumber, RECEIPT_INPUT_FIELDS, normalizeReceiptPricingBreakdownInput } from "@/lib/api-input";
import { apiError } from "@/lib/api-error";
import type { Prisma } from "@prisma/client";

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

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Whitelist field — receiptNo & createdById selalu di-set server, bukan dari klien
  const data = pickInput(body, RECEIPT_INPUT_FIELDS);
  const pricingBreakdown = normalizeReceiptPricingBreakdownInput(data.pricingBreakdown);
  if (!pricingBreakdown.ok) {
    return NextResponse.json({ error: pricingBreakdown.error }, { status: 422 });
  }
  data.pricingBreakdown = pricingBreakdown.value;
  if (pricingBreakdown.total !== null) data.amount = pricingBreakdown.total;

  if (typeof data.customerName !== "string" || !data.customerName.trim())
    return NextResponse.json({ error: "Nama pelanggan wajib diisi." }, { status: 422 });
  if (badNumber(data.amount))
    return NextResponse.json({ error: "Nominal harus berupa angka dan tidak boleh negatif." }, { status: 422 });
  if (data.pax !== undefined && (typeof data.pax !== "number" || !Number.isInteger(data.pax) || data.pax < 1))
    return NextResponse.json({ error: "Jumlah pax minimal 1." }, { status: 422 });

  try {
    const receipt = await prisma.receipt.create({
      data: {
        ...(data as unknown as Omit<Prisma.ReceiptUncheckedCreateInput, "receiptNo">),
        receiptNo: generateReceiptNo(),
        createdById: session.user.id,
      },
    });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "CREATE", resource: "RECEIPT",
      resourceId: receipt.id, resourceName: receipt.customerName,
      detail: `Receipt ${receipt.receiptNo}`,
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (err) {
    return apiError(err);
  }
}
