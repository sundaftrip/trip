import type { Plan } from "./plan";

/**
 * Plan deployment ini. SERVER-ONLY.
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
