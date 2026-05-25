// Data layer untuk modul Kuotasi.
// Server-side helpers — semua API route + RSC page lewat sini.

import { prisma } from "@/lib/prisma";
import { computeAllTiers, DEFAULT_PAX_TIERS, type CostInput } from "./calc";

export async function listQuotations() {
  return prisma.quotation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { days: true, pricings: true } },
      pricings: { select: { paxCount: true, sellingIdr: true } },
    },
  });
}

export async function getQuotation(id: string) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      days: { orderBy: { dayIndex: "asc" }, include: { costs: { orderBy: { order: "asc" } } } },
      costs: { orderBy: { order: "asc" } },
      pricings: { orderBy: { paxCount: "asc" } },
      addons: { orderBy: { order: "asc" } },
    },
  });
}

/**
 * Recalculate semua tier PAX untuk quotation. Hapus tier lama yang sudah
 * tidak ada di paxList, upsert sisanya. Dipanggil setiap kali user
 * edit cost / kurs / margin / margin / paxList.
 */
export async function recalcPricing(quotationId: string, paxList: number[] = [...DEFAULT_PAX_TIERS]) {
  const q = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { costs: true },
  });
  if (!q) throw new Error("Quotation not found");

  const items: CostInput[] = q.costs.map((c) => ({
    perPax: c.perPax,
    valueForeign: c.valueForeign,
    valueIdr: c.valueIdr,
    qty: c.qty,
  }));

  const rows = computeAllTiers(items, paxList, q.kursForeign, q.marginPct, q.roundIdrTo);

  await prisma.$transaction([
    prisma.quotationPricing.deleteMany({
      where: { quotationId, paxCount: { notIn: paxList } },
    }),
    ...rows.map((r) =>
      prisma.quotationPricing.upsert({
        where: { quotationId_paxCount: { quotationId, paxCount: r.paxCount } },
        create: { quotationId, ...r },
        update: { ...r },
      })
    ),
  ]);

  return rows;
}

export async function listTemplates(opts: { country?: string; category?: string } = {}) {
  return prisma.costComponentTemplate.findMany({
    where: {
      active: true,
      ...(opts.country ? { country: opts.country } : {}),
      ...(opts.category ? { category: opts.category as never } : {}),
    },
    orderBy: [{ category: "asc" }, { city: "asc" }, { label: "asc" }],
  });
}
