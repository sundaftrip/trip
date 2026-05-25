// Kalkulasi cost & pricing untuk modul Kuotasi (multi-negara, multi-currency).
// Replikasi logika sheet COST di RUSSIA 2026.xlsx, digeneralisasi:
//   COGS foreign/pax = total foreign-currency / pax  (+ flat-foreign / pax)
//   COGS IDR/pax     = foreign × kursForeign + IDR/pax
//   Selling IDR      = COGS IDR ÷ (1 − margin/100), lalu round-up ke kelipatan roundTo
//   Margin IDR       = Selling − COGS IDR

import type { QuotationCostItem } from "@prisma/client";

export const DEFAULT_PAX_TIERS = [10, 15, 17, 25, 30, 35, 40] as const;

export type CostInput = Pick<
  QuotationCostItem,
  "perPax" | "valueForeign" | "valueIdr" | "qty"
>;

export type PricingRow = {
  paxCount: number;
  cogsForeignPerPax: number;
  cogsIdrPerPax: number;
  marginIdr: number;
  sellingIdr: number;
};

/**
 * Total cost trip per-pax, terpisah dalam currency asing vs IDR.
 * - perPax=true  → biaya per orang × qty
 * - perPax=false → biaya flat trip × qty, dibagi rata ke jumlah pax
 */
export function aggregateCosts(items: CostInput[], pax: number) {
  let perPaxForeign = 0;
  let perPaxIdr = 0;
  let flatForeign = 0;
  let flatIdr = 0;

  for (const it of items) {
    const qty = it.qty ?? 1;
    const foreign = (it.valueForeign ?? 0) * qty;
    const idr = (it.valueIdr ?? 0) * qty;
    if (it.perPax) {
      perPaxForeign += foreign;
      perPaxIdr += idr;
    } else {
      flatForeign += foreign;
      flatIdr += idr;
    }
  }

  const flatPerPaxForeign = pax > 0 ? flatForeign / pax : 0;
  const flatPerPaxIdr = pax > 0 ? flatIdr / pax : 0;

  return {
    foreignPerPax: perPaxForeign + flatPerPaxForeign,
    idrPerPax: perPaxIdr + flatPerPaxIdr,
  };
}

/** Round-up ke kelipatan `step` (default 100.000). 19.368.735 → 19.400.000. */
export function roundUpTo(value: number, step: number): number {
  if (step <= 0) return Math.ceil(value);
  return Math.ceil(value / step) * step;
}

export function computePricingRow(
  items: CostInput[],
  pax: number,
  kursForeign: number,
  marginPct: number,
  roundTo: number
): PricingRow {
  const { foreignPerPax, idrPerPax } = aggregateCosts(items, pax);
  const cogsIdrPerPax = foreignPerPax * kursForeign + idrPerPax;
  const grossIdrPerPax =
    marginPct >= 100 ? cogsIdrPerPax : cogsIdrPerPax / (1 - marginPct / 100);
  const sellingIdr = roundUpTo(grossIdrPerPax, roundTo);
  const marginIdr = sellingIdr - cogsIdrPerPax;
  return {
    paxCount: pax,
    cogsForeignPerPax: foreignPerPax + (kursForeign > 0 ? idrPerPax / kursForeign : 0),
    cogsIdrPerPax,
    marginIdr,
    sellingIdr,
  };
}

export function computeAllTiers(
  items: CostInput[],
  paxList: number[],
  kursForeign: number,
  marginPct: number,
  roundTo: number
): PricingRow[] {
  return paxList
    .filter((p) => p > 0)
    .map((p) => computePricingRow(items, p, kursForeign, marginPct, roundTo));
}

// ── currency presets per destinasi populer ──────────────────────────
// Dipakai sebagai default saat user pilih country di wizard.
export const COUNTRY_CURRENCY: Record<string, { currency: string; defaultRate: number }> = {
  Rusia: { currency: "RUB", defaultRate: 238 },
  Jepang: { currency: "JPY", defaultRate: 110 },
  Turki: { currency: "TRY", defaultRate: 400 },
  "Korea Selatan": { currency: "KRW", defaultRate: 12 },
  China: { currency: "CNY", defaultRate: 2280 },
  Singapura: { currency: "SGD", defaultRate: 12500 },
  Thailand: { currency: "THB", defaultRate: 480 },
  Vietnam: { currency: "VND", defaultRate: 0.65 },
  Eropa: { currency: "EUR", defaultRate: 17500 },
  "Inggris Raya": { currency: "GBP", defaultRate: 20500 },
  "Amerika Serikat": { currency: "USD", defaultRate: 16200 },
  Australia: { currency: "AUD", defaultRate: 10800 },
  "Arab Saudi": { currency: "SAR", defaultRate: 4320 },
  UEA: { currency: "AED", defaultRate: 4410 },
  Indonesia: { currency: "IDR", defaultRate: 1 },
};

export const COUNTRY_LIST = Object.keys(COUNTRY_CURRENCY);
