import { prisma } from "./prisma";
import { assessTourVisas } from "./tour-visa-assessment";
import { readTourVisaPlan } from "./tour-visa-plan";

/** The website, PDF and publication check read the same fields. */
export const TOUR_VISA_COUNTRY_SELECT = {
  id: true, name: true, en: true, region: true, visa: true,
  servicePrice: true, sortOrder: true, stay: true, conditions: true,
  eligibility: true, sourceUrl: true, lastVerifiedAt: true,
  variants: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, name: true, priceIDR: true, processingTime: true, sortOrder: true },
  },
} as const;

export async function getTourVisaCountries() {
  return prisma.countryVisa.findMany({ select: TOUR_VISA_COUNTRY_SELECT });
}

export async function getTourVisaEditorCountries() {
  return (await getTourVisaCountries()).map((record) => ({ ...record, lastVerifiedAt: record.lastVerifiedAt?.toISOString() ?? null }));
}

export function assessCatalogVisas(tour: { country: string; itinerary?: unknown; inclusions?: readonly string[]; addOns?: unknown }, records: Parameters<typeof assessTourVisas>[1]) {
  return assessTourVisas({
    plan: readTourVisaPlan(tour.itinerary), country: tour.country, inclusions: tour.inclusions,
    addOns: Array.isArray(tour.addOns) ? tour.addOns.filter((item) => item && typeof item.name === "string") : [],
  }, records);
}
