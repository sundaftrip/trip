import type { Plan } from "./plan";

/**
 * Plan deployment ini.
 *
 * CATATAN: env ber-prefix `NEXT_PUBLIC_*` di-inline ke bundle KLIEN saat
 * build, jadi nilai `NEXT_PUBLIC_PLAN` TERLIHAT oleh siapa pun — ini bukan
 * rahasia dan jangan dianggap kontrol keamanan. Enforcement fitur plan yang
 * nyata tetap dilakukan di server (cek di /api/settings). Nama env sengaja
 * tidak di-rename karena butuh perubahan konfigurasi di Vercel.
 *
 * Instance mandiri (tanpa panel MASTER): plan di-set lewat env
 * `NEXT_PUBLIC_PLAN` ("pro" | "basic"). Default "basic" kalau tidak di-set.
 *
 * (Dulu plan di-fetch dari panel SUNDAF/MASTER; integrasi itu dihapus
 *  2026-06-07 saat otefamily/MASTER dipensiunkan.)
 */
export async function getPlan(): Promise<Plan> {
  return process.env.NEXT_PUBLIC_PLAN === "pro" ? "pro" : "basic";
}
