// Formatter ringkas untuk modul Kuotasi.
// Tidak pakai minus tipografis seperti modul keuangan — di sini
// angka negatif sangat jarang (margin loss), pakai minus biasa.

export function rupiah(n: number): string {
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

export function rupiahShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}Rp ${trim(abs / 1_000_000_000)} M`;
  if (abs >= 1_000_000) return `${sign}Rp ${trim(abs / 1_000_000)} jt`;
  if (abs >= 1_000) return `${sign}Rp ${trim(abs / 1_000)} rb`;
  return `${sign}Rp ${Math.round(abs).toLocaleString("id-ID")}`;
}

function trim(v: number): string {
  return v
    .toLocaleString("id-ID", { maximumFractionDigits: 2, minimumFractionDigits: 0 })
    .replace(/,00$/, "");
}

const CURRENCY_SYMBOL: Record<string, string> = {
  RUB: "₽",
  JPY: "¥",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  KRW: "₩",
  TRY: "₺",
  SGD: "S$",
  AUD: "A$",
  THB: "฿",
  VND: "₫",
  SAR: "﷼",
  AED: "د.إ",
  IDR: "Rp",
};

/** "75.000 ₽" / "12.500 JPY". Pakai simbol kalau dikenal, kalau tidak code. */
export function foreign(n: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  const body = Math.round(n).toLocaleString("id-ID");
  // Simbol Asia (₽, ¥, ₩, ₺, ฿, ₫) di belakang; simbol Latin ($, €, £, Rp) di depan.
  const suffix = ["₽", "¥", "₩", "₺", "฿", "₫", "﷼", "د.إ"].includes(symbol) || symbol === currency;
  return suffix ? `${body} ${symbol}` : `${symbol} ${body}`;
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function fmtDateShort(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export const CATEGORY_LABEL: Record<string, string> = {
  HOTEL: "Hotel",
  AKTIVITAS: "Aktivitas",
  TRANSPORT: "Transport",
  MAKAN: "Makan",
  ASURANSI: "Asuransi",
  TL_FEE: "TL Fee",
  TAX: "Tax",
  TIKET_MASUK: "Tiket Masuk",
  LAIN: "Lain-lain",
};

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Terkirim",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

export const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  ARCHIVED: "bg-stone-100 text-stone-500",
};
