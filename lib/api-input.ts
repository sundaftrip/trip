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
  "paymentMethod", "paymentDate", "notes", "status",
] as const;
