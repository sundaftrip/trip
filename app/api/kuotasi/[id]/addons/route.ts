import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_edit")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  const items: Array<{ label: string; priceIdr: number; notes?: string | null }> = await req.json();

  await prisma.$transaction([
    prisma.quotationAddon.deleteMany({ where: { quotationId: id } }),
    prisma.quotationAddon.createMany({
      data: items.map((it, i) => ({
        quotationId: id,
        label: it.label,
        priceIdr: Number(it.priceIdr) || 0,
        notes: it.notes ?? null,
        order: i,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true, count: items.length });
}
