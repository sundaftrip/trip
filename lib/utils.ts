import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = "id-ID") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, locale = "id-ID") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Strip a phone number down to the digits-only form wa.me links expect
 *  (removes "+", spaces, dashes, and any other non-digit characters). */
export function toWaNumber(raw?: string | null) {
  return (raw ?? "").replace(/\D/g, "");
}

/** Inject Cloudinary transformation segment ke URL agar gambar di-deliver
 *  dengan width tertentu + auto-format (WebP/AVIF) + auto-quality.
 *  Tanpa ini gambar di-serve original size (sering 2-5MB) → CLS + LCP buruk.
 *
 *  Pattern Cloudinary: https://res.cloudinary.com/<cloud>/image/upload/<rest>
 *  Tambah segment "w_<width>,c_fill,q_auto,f_auto" setelah `/upload/`.
 *  Idempotent — kalau width sama sudah ada, tidak dobel-inject.
 */
export function cldOptimize(url: string | null | undefined, width: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  const seg = `w_${width},c_fill,q_auto,f_auto`;
  if (url.includes(`/upload/${seg}/`) || url.includes(`/upload/${seg},`)) return url;
  return url.replace("/upload/", `/upload/${seg}/`);
}

export function generateReceiptNo() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `SDT-${y}${m}${d}-${rand}`;
}
