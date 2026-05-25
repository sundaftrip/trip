import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { recalcPricing } from "@/lib/kuotasi/data";
import type { CostCategory } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

// Bulk replace cost items + auto recalc semua tier pricing.
export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_edit")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  const items: Array<{
    dayId?: string | null;
    category: CostCategory;
    label: string;
    perPax?: boolean;
    valueForeign?: number | null;
    valueIdr?: number | null;
    qty?: number;
    notes?: string | null;
    order?: number;
  }> = await req.json();

  await prisma.$transaction([
    prisma.quotationCostItem.deleteMany({ where: { quotationId: id } }),
    prisma.quotationCostItem.createMany({
      data: items.map((it, i) => ({
        quotationId: id,
        dayId: it.dayId ?? null,
        category: it.category,
        label: it.label,
        perPax: it.perPax ?? true,
        valueForeign: it.valueForeign ?? null,
        valueIdr: it.valueIdr ?? null,
        qty: it.qty ?? 1,
        notes: it.notes ?? null,
        order: it.order ?? i,
      })),
    }),
  ]);

  const pricings = await recalcPricing(id);
  return NextResponse.json({ ok: true, count: items.length, pricings });
}
