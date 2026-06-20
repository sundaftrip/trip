/* Whitelist field input API — pola pickInput() ala app/api/visa-database/route.ts.
   Hanya field di daftar ini yang diteruskan ke Prisma (anti mass-assignment:
   klien tidak bisa menyelipkan kolom yang dikelola server).

   Daftar = SEMUA kolom mutable model di prisma/schema.prisma
   MINUS id / createdAt / updatedAt / relasi, dan minus kolom yang
   memang dikelola server (lihat catatan per model di bawah). */

export function pickInput(
  body: Record<string, unknown>,
  fields: readonly string[]
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const f of fields) {
    if (f in body && body[f] !== undefined) data[f] = body[f];
  }
  return data;
}

// Angka opsional tidak boleh negatif (undefined/null = tidak diisi → lolos)
export const badNumber = (v: unknown) =>
  v !== undefined && v !== null && (typeof v !== "number" || Number.isNaN(v) || v < 0);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function normalizeTourPaymentPlanInput(value: unknown): { ok: true; value: Record<string, unknown> | null } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (!isRecord(value)) return { ok: false, error: "Skema pembayaran tidak valid." };

  const mode = value.mode;
  if (mode === undefined || mode === null || mode === "" || mode === "auto") {
    return { ok: true, value: null };
  }

  if (mode === "hidden") {
    return { ok: true, value: { mode: "hidden" } };
  }

  if (mode !== "manual") return { ok: false, error: "Mode skema pembayaran tidak valid." };
  if (!Array.isArray(value.steps)) return { ok: false, error: "Minimal satu tahap pembayaran manual wajib diisi." };

  const steps = value.steps.flatMap((step) => {
    if (!isRecord(step)) return [];

    const label = optionalText(step.label);
    const dueDate = optionalText(step.dueDate);
    const amount = Number(step.amount);
    if (!label || !dueDate || !Number.isFinite(amount) || amount < 0) return [];

    return [{ label, dueDate, amount }];
  });

  if (steps.length === 0) {
    return { ok: false, error: "Minimal satu tahap pembayaran manual wajib diisi lengkap." };
  }

  return {
    ok: true,
    value: {
      mode: "manual",
      title: optionalText(value.title),
      intro: optionalText(value.intro),
      paymentMethodsLabel: optionalText(value.paymentMethodsLabel),
      urgencyLabel: optionalText(value.urgencyLabel),
      finePrint: optionalText(value.finePrint),
      steps,
    },
  };
}

type ReceiptPricingItemInput = {
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
};

function nonNegativeNumber(value: unknown) {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function roundCurrency(value: number) {
  return Math.round(value);
}

export function normalizeReceiptPricingBreakdownInput(
  value: unknown
): { ok: true; value: Record<string, unknown> | null; total: number | null } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, value: null, total: null };
  if (!isRecord(value)) return { ok: false, error: "Rincian nominal receipt tidak valid." };
  if (!Array.isArray(value.items)) return { ok: false, error: "Minimal satu baris rincian nominal wajib tersedia." };

  const items: ReceiptPricingItemInput[] = [];
  for (const item of value.items.slice(0, 40)) {
    if (!isRecord(item)) continue;

    const name = optionalText(item.name);
    const quantity = nonNegativeNumber(item.quantity);
    const unitPrice = nonNegativeNumber(item.unitPrice);
    const discount = nonNegativeNumber(item.discount) ?? 0;

    if (!name && quantity === null && unitPrice === null && discount === 0) continue;
    if (!name || quantity === null || quantity <= 0 || unitPrice === null) {
      return { ok: false, error: "Setiap baris rincian wajib punya nama, qty, dan harga satuan yang valid." };
    }

    items.push({
      name,
      quantity,
      unitPrice: roundCurrency(unitPrice),
      discount: roundCurrency(discount),
    });
  }

  if (items.length === 0) return { ok: true, value: null, total: null };

  const subtotal = items.reduce(
    (sum, item) => sum + Math.max(0, item.quantity * item.unitPrice - item.discount),
    0
  );
  const globalDiscount = roundCurrency(nonNegativeNumber(value.globalDiscount) ?? 0);
  const total = roundCurrency(Math.max(0, subtotal - globalDiscount));

  return {
    ok: true,
    total,
    value: {
      version: 1,
      items,
      subtotal: roundCurrency(subtotal),
      globalDiscount,
      total,
    },
  };
}

// Nilai sah enum TourStatus di prisma/schema.prisma
export const VALID_TOUR_STATUSES = ["ACTIVE", "DRAFT", "FULL", "CANCELLED"] as const;

// Model Tour — expenseToken sengaja TIDAK masuk: token link pelaporan TL,
// dikelola khusus oleh lib/keuangan/actions.ts (bukan lewat form tour).
export const TOUR_INPUT_FIELDS = [
  "title", "slug", "country", "cityHighlight",
  "price", "promoPrice", "priceLandTour", "seatsLeft",
  "status", "pinned", "tripDate", "duration", "itinerary",
  "inclusions", "exclusions", "gallery", "hotel",
  "visaInfo", "heroImg", "badge", "notes", "description", "addOns",
  "paymentPlan",
] as const;

// Model Blog
export const BLOG_INPUT_FIELDS = [
  "slug", "title", "excerpt", "cover", "category",
  "date", "author", "body", "readTime", "published",
] as const;

// Model Receipt — receiptNo & createdById sengaja TIDAK masuk:
// di-generate/di-set server saat create (lihat app/api/receipts/route.ts).
export const RECEIPT_INPUT_FIELDS = [
  "customerName", "customerPhone", "customerEmail",
  "tourId", "tourTitle", "tripDate", "pax", "amount",
  "paymentMethod", "paymentDate", "pricingBreakdown", "notes", "status",
] as const;
