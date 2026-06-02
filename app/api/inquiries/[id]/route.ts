import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
type InquiryStatus = (typeof STATUSES)[number];

// PATCH admin — ubah status lead.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const item = await prisma.inquiry.update({
    where: { id },
    data: { status: body.status as InquiryStatus },
  });
  return NextResponse.json(item);
}

// DELETE admin — hapus lead.
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await prisma.inquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
