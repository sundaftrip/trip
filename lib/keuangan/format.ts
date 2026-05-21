// Formatting util untuk modul keuangan. Pakai minus sign tipografis (−)
// supaya angka negatif terbaca rapi di font monospace.

const MINUS = "−";

/** "Rp 14.700.000" / "−Rp 14.700.000" */
export function rupiah(n: number): string {
  const neg = n < 0;
  const abs = Math.round(Math.abs(n));
  const body = abs.toLocaleString("id-ID");
  return `${neg ? MINUS : ""}Rp ${body}`;
}

/** Versi ringkas untuk angka besar: "Rp 14,7 jt", "Rp 1,21 M". */
export function rupiahShort(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  let body: string;
  if (abs >= 1_000_000_000) body = `${trim(abs / 1_000_000_000)} M`;
  else if (abs >= 1_000_000) body = `${trim(abs / 1_000_000)} jt`;
  else if (abs >= 1_000) body = `${trim(abs / 1_000)} rb`;
  else body = abs.toLocaleString("id-ID");
  return `${neg ? MINUS : ""}Rp ${body}`;
}

function trim(v: number): string {
  return v
    .toLocaleString("id-ID", { maximumFractionDigits: 2, minimumFractionDigits: 0 })
    .replace(/,00$/, "");
}

/** Angka biasa tanpa "Rp" — untuk kolom tabel. */
export function num(n: number): string {
  const neg = n < 0;
  return `${neg ? MINUS : ""}${Math.round(Math.abs(n)).toLocaleString("id-ID")}`;
}

/** Delta dengan tanda: "+1.200.000" / "−1.200.000". */
export function signed(n: number): string {
  if (n === 0) return "0";
  return `${n > 0 ? "+" : MINUS}${Math.round(Math.abs(n)).toLocaleString("id-ID")}`;
}

export function pct(n: number, digits = 1): string {
  return `${n >= 0 ? "" : MINUS}${Math.abs(n).toFixed(digits)}%`;
}

// ── mata uang asing ──────────────────────────────────────────
// Tagihan vendor bisa dalam USD/RUB/EUR/SGD. Nilai di DB selalu
// IDR (amount); currency + fxRate dipakai untuk tampilan asli.

export const CURRENCIES = ["IDR", "USD", "RUB", "EUR", "SGD"] as const;

/** Nominal dalam mata uang asli, kosong kalau IDR. mis. "USD 12.000". */
export function foreignAmount(amountIdr: number, currency: string, fxRate: number): string {
  if (currency === "IDR" || !fxRate || fxRate <= 0) return "";
  const foreign = amountIdr / fxRate;
  return `${currency} ${foreign.toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
}

/** "USD · kurs Rp 16.250" — keterangan kurs untuk baris tagihan. */
export function fxNote(currency: string, fxRate: number): string {
  if (currency === "IDR" || !fxRate || fxRate <= 0) return "";
  return `kurs Rp ${Math.round(fxRate).toLocaleString("id-ID")}`;
}

export function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateShort(d: Date | string): string {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function fmtDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "MEI 2026" — untuk header laporan bulanan. */
export function fmtMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const months = [
    "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
    "JUL", "AGU", "SEP", "OKT", "NOV", "DES",
  ];
  return `${months[m - 1]} ${y}`;
}

/** key bulan stabil "YYYY-MM" untuk grouping. */
export function monthKey(d: Date | string): string {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
}
