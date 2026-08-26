import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildVisaIntelligenceDataset,
  type VisaIntelligenceDataset,
} from "@/lib/visa-intelligence";

export async function loadVisaIntelligenceDataset(): Promise<VisaIntelligenceDataset> {
  const rows = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      flag: true,
      name: true,
      en: true,
      region: true,
      visa: true,
      stay: true,
      cost: true,
      officialFee: true,
      servicePrice: true,
      notes: true,
      conditions: true,
      sourceUrl: true,
      lastVerifiedAt: true,
      updatedAt: true,
    },
  });

  return buildVisaIntelligenceDataset(rows);
}

export async function loadVisaIntelligencePageData() {
  const [dataset, company] = await Promise.all([
    loadVisaIntelligenceDataset(),
    prisma.companyInfo.findUnique({
      where: { key: "company_whatsapp" },
      select: { value: true },
    }),
  ]);

  return {
    dataset,
    whatsapp: company?.value ?? "",
  };
}
