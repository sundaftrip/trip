/**
 * Definisi plan & fitur — MURNI, tanpa dependensi server.
 * Aman di-import dari client component maupun server.
 *
 * Resolusi plan aktual (fetch dari MASTER) ada di lib/license.ts (server-only).
 */

export type Plan = "basic" | "pro";

/** Fitur yang memerlukan plan Pro. Fitur yang tidak terdaftar → bebas dipakai. */
export const PLAN_FEATURES: Record<string, Plan> = {
  theme_vibrant: "pro",
  theme_bold: "pro",
  theme_tropical: "pro",
  theme_kawaii: "pro",
  theme_pixel: "pro",
  theme_globe: "pro",
  theme_map: "pro",
  theme_atlas: "pro",
  color_schemes: "pro",
};

/** Cek apakah sebuah fitur aktif untuk plan tertentu. Pure — aman di mana saja. */
export function isFeatureEnabledFor(feature: string, plan: Plan): boolean {
  const required = PLAN_FEATURES[feature];
  if (!required) return true;
  return !(required === "pro" && plan !== "pro");
}

export const PLAN_LABEL: Record<Plan, string> = {
  basic: "Basic",
  pro: "Pro",
};
