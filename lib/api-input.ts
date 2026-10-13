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

const ADD_ON_TAGS = new Set(["", "wajib", "recommended"]);
const ROOM_PRICE_KEY = /^__room_price_(quad|triple|twin)$/;

type TourInputResult = { ok: true; value: Record<string, unknown> } | { ok: false; error: string };

function textList(value: unknown, field: string, max = 120): string[] | string {
  if (!Array.isArray(value)) return `${field} harus berupa daftar.`;
  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > max ? `${field} maksimal ${max} baris.` : items;
}

function optionalTrimmed(value: unknown) {
  if (value === null) return null;
  return typeof value === "string" ? (value.trim() || null) : undefined;
}

/**
 * Validasi bentuk data tour dari CMS sebelum masuk Prisma. Field yang tidak
 * dikirim tidak disentuh (aman untuk update parsial). Mengembalikan salinan.
 */
export function normalizeTourInput(input: Record<string, unknown>): TourInputResult {
  const data: Record<string, unknown> = { ...input };

  for (const field of ["title", "country"] as const) {
    if (field in data) {
      if (typeof data[field] !== "string" || !(data[field] as string).trim()) {
        return { ok: false, error: field === "title" ? "Judul tour wajib diisi." : "Negara wajib diisi." };
      }
      data[field] = (data[field] as string).trim();
    }
  }

  for (const field of ["cityHighlight", "duration", "badge", "heroImg", "notes", "description", "visaInfo"] as const) {
    if (field in data) {
      const value = optionalTrimmed(data[field]);
      if (value === undefined) return { ok: false, error: `Isian ${field} tidak valid.` };
      data[field] = value;
    }
  }

  for (const field of ["price", "promoPrice", "priceLandTour"] as const) {
    if (field in data && typeof data[field] === "number") data[field] = Math.round(data[field] as number);
  }
  if ("promoPrice" in data && data.promoPrice === 0) data.promoPrice = null;
  if ("priceLandTour" in data && data.priceLandTour === 0) data.priceLandTour = null;
  if ("seatsLeft" in data) {
    if (typeof data.seatsLeft !== "number" || !Number.isFinite(data.seatsLeft) || data.seatsLeft < 0) {
      return { ok: false, error: "Sisa kursi harus angka 0 atau lebih." };
    }
    data.seatsLeft = Math.round(data.seatsLeft);
  }

  if ("tripDate" in data && data.tripDate !== null) {
    const date = typeof data.tripDate === "string" ? new Date(data.tripDate) : null;
    if (!date || !Number.isFinite(date.getTime())) return { ok: false, error: "Tanggal berangkat tidak valid." };
    data.tripDate = date;
  }

  for (const [field, label] of [["inclusions", "Daftar termasuk"], ["exclusions", "Daftar tidak termasuk"], ["gallery", "Galeri"]] as const) {
    if (field in data) {
      const list = textList(data[field], label);
      if (typeof list === "string") return { ok: false, error: list };
      data[field] = list;
    }
  }

  if ("itinerary" in data) {
    if (!Array.isArray(data.itinerary)) return { ok: false, error: "Itinerary harus berupa daftar hari." };
    const days = [];
    for (const item of data.itinerary.slice(0, 60)) {
      if (!isRecord(item)) continue;
      const title = typeof item.title === "string" ? item.title.trim() : "";
      const description = typeof item.description === "string" ? item.description.trim() : "";
      const day = Math.round(Number(item.day));
      if (!title && !description) continue;
      if (!Number.isFinite(day) || day < 1) return { ok: false, error: "Nomor hari itinerary harus 1 atau lebih." };
      if (!title) return { ok: false, error: `Judul itinerary hari ${day} wajib diisi.` };
      const image = typeof item.image === "string" && item.image.trim() ? item.image.trim() : undefined;
      days.push({ day, title, description, ...(image ? { image } : {}) });
    }
    data.itinerary = days.sort((a, b) => a.day - b.day);
  }

  if ("addOns" in data) {
    if (data.addOns === null) data.addOns = [];
    if (!Array.isArray(data.addOns)) return { ok: false, error: "Add-on harus berupa daftar." };
    const addOns = [];
    for (const item of data.addOns.slice(0, 40)) {
      if (!isRecord(item)) continue;
      const name = typeof item.name === "string" ? item.name.trim() : "";
      if (!name) continue;
      const price = Number(item.price);
      if (!Number.isFinite(price) || price < 0) return { ok: false, error: `Harga add-on "${name}" tidak valid.` };
      const tag = typeof item.tag === "string" && ADD_ON_TAGS.has(item.tag) ? item.tag : "";
      const desc = typeof item.desc === "string" && item.desc.trim() ? item.desc.trim() : undefined;
      addOns.push({ name, price: Math.round(price), ...(tag ? { tag } : {}), ...(desc ? { desc } : {}) });
    }
    data.addOns = addOns;
  }

  if ("hotel" in data && data.hotel !== null) {
    if (!isRecord(data.hotel)) return { ok: false, error: "Data hotel tidak valid." };
    const hotel: Record<string, unknown> = {};
    for (const [rawKey, value] of Object.entries(data.hotel)) {
      const key = rawKey.trim();
      if (!key) continue;
      if (ROOM_PRICE_KEY.test(key)) {
        const price = Number(value);
        if (value === "" || value === null || value === undefined) continue;
        if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Harga per kamar harus angka." };
        if (price > 0) hotel[key] = Math.round(price);
        continue;
      }
      if (typeof value === "string") {
        if (value.trim()) hotel[key] = value.trim();
      } else if (typeof value === "number" || isRecord(value) || Array.isArray(value)) {
        hotel[key] = value;
      }
    }
    data.hotel = Object.keys(hotel).length > 0 ? hotel : null;
  }

  return { ok: true, value: data };
}

const TOUR_CHANGE_LABELS: Record<string, string> = {
  title: "judul", country: "negara", cityHighlight: "kota", duration: "durasi", badge: "badge",
  tripDate: "tanggal", seatsLeft: "kursi", status: "status", pinned: "pin",
  price: "harga", promoPrice: "harga promo", priceLandTour: "harga land tour",
  heroImg: "foto utama", gallery: "galeri", itinerary: "itinerary", inclusions: "termasuk",
  exclusions: "tidak termasuk", hotel: "hotel/harga kamar", addOns: "add-on",
  description: "deskripsi", notes: "catatan", visaInfo: "info visa", paymentPlan: "skema bayar",
};

const TOUR_STATUS_NAMES: Record<string, string> = { DRAFT: "Draft", ACTIVE: "Aktif", FULL: "Penuh", CANCELLED: "Batal" };

function comparable(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === undefined || value === "") return null;
  return JSON.stringify(value ?? null);
}

function rupiah(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `Rp ${amount.toLocaleString("id-ID")}` : "kosong";
}

/** Ringkasan perubahan tour untuk Log Aktivitas, mis. "Status Draft → Aktif · Ubah: harga, galeri". */
export function describeTourChanges(before: Record<string, unknown>, after: Record<string, unknown>) {
  const details: string[] = [];
  const changed: string[] = [];
  for (const [field, label] of Object.entries(TOUR_CHANGE_LABELS)) {
    if (!(field in after)) continue;
    if (comparable(before[field]) === comparable(after[field])) continue;
    if (field === "status") {
      details.push(`Status ${TOUR_STATUS_NAMES[String(before.status)] ?? before.status} → ${TOUR_STATUS_NAMES[String(after.status)] ?? after.status}`);
    } else if (field === "price" || field === "promoPrice") {
      details.push(`${field === "price" ? "Harga" : "Harga promo"} ${rupiah(before[field])} → ${rupiah(after[field])}`);
    } else if (field === "seatsLeft") {
      details.push(`Kursi ${before.seatsLeft ?? 0} → ${after.seatsLeft ?? 0}`);
    } else {
      changed.push(label);
    }
  }
  if (changed.length) details.push(`Ubah: ${changed.join(", ")}`);
  return details.join(" · ") || "Tanpa perubahan isi";
}

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
