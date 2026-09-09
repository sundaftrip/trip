import type { TourVisaOffer } from "./tour-visa-offers";
import { formatCurrency } from "./utils";

export type TourVisaAssessmentView = {
  countries: {
    id: string;
    name: string;
    status: "visa_free" | "visa_on_arrival" | "required" | "evisa" | "conditional" | "unknown";
    explanation: string;
    conditions: string[];
    sourceUrl: string | null;
    checkedAt: string | null;
    serviceState: "offered" | "included" | "separate" | "consultation" | "not_needed";
    href: string | null;
    stayDays: number | null;
    kind: "visit" | "transit";
  }[];
  summary: string[];
  issues: string[];
  warnings: string[];
  legacy: boolean;
};

export type SelectableVisaOffer = TourVisaOffer & {
  countryIds?: string[];
  variantId?: string | null;
};

export type VisaSelection = {
  items: (SelectableVisaOffer & { count: number; total: number })[];
  total: number;
};

export type VisaTravelerParty = {
  adults: number;
  childCount: number;
  visaCounts: Record<string, number>;
};

export function clampVisaTravelerCount(value: number, travelerCount: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(travelerCount)) return 0;
  return Math.min(Math.max(0, Math.floor(value)), Math.max(0, Math.floor(travelerCount)));
}

export function updateVisaTravelerParty(
  current: VisaTravelerParty,
  field: "adults" | "childCount",
  value: number,
): VisaTravelerParty {
  const next = {
    ...current,
    [field]: Math.max(field === "adults" ? 1 : 0, clampVisaTravelerCount(value, field === "adults" ? 8 : 4)),
  };
  next.visaCounts = Object.fromEntries(Object.entries(current.visaCounts).map(([id, count]) => [
    id, clampVisaTravelerCount(count, next.adults + next.childCount),
  ]));
  return next;
}

export function calculateVisaSelection(
  offers: readonly SelectableVisaOffer[],
  counts: Readonly<Record<string, number>>,
  travelerCount: number,
): VisaSelection {
  const seen = new Set<string>();
  const items: VisaSelection["items"] = [];
  for (const offer of offers) {
    if (seen.has(offer.id) || !Number.isFinite(offer.price) || offer.price <= 0) continue;
    seen.add(offer.id);
    const count = clampVisaTravelerCount(counts[offer.id] ?? 0, travelerCount);
    if (count > 0) items.push({ ...offer, count, total: offer.price * count });
  }
  return { items, total: items.reduce((sum, item) => sum + item.total, 0) };
}

export function formatVisaSelectionPreference(selection: VisaSelection): string {
  if (!selection.items.length) return "Bantuan visa tidak ditambahkan; dokumen perjalanan tetap perlu diperiksa.";
  return [
    ...selection.items.map((item) => `${item.name}: ${formatCurrency(item.price)} × ${item.count} orang = ${formatCurrency(item.total)}`),
    `Total bantuan visa untuk grup: ${formatCurrency(selection.total)} (terpisah dari harga paket per orang)`,
  ].join("; ");
}

export function getVisibleOptionalAddOns<T extends { name: string; price?: number; visaHref?: string | null }>(
  addons: readonly T[],
  offers: readonly SelectableVisaOffer[],
): T[] {
  return addons.filter((addon) => !offers.some((offer) => (
    addon.visaHref === offer.href
    && addon.price === offer.price
    && addon.name.trim().toLowerCase() === offer.name.trim().toLowerCase()
  )));
}
