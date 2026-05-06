import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateReceiptNo } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const receipts = await prisma.receipt.findMany({
    include: { tour: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(receipts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const receipt = await prisma.receipt.create({
    data: {
      ...body,
      receiptNo: generateReceiptNo(),
      createdById: session.user.id,
    },
  });
  return NextResponse.json(receipt, { status: 201 });
}
