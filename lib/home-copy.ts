export const HOME_COPY = {
  heroEyebrow: "SPESIALIS RUSIA, ASIA TENGAH & AURORA",
  heroTitle: "Pergi jauh. Pulang bawa cerita yang berbeda.",
  heroBody:
    "Rusia, Asia Tengah, dan aurora bukan rute yang harus kamu tebak sendiri. Visa, cuaca, rute, dan koordinasi kami siapkan dari awal—supaya kamu bisa menikmati perjalanannya.",
} as const;

export const LEGACY_HOME_COPY = {
  heroEyebrow: "#SPESIALIS RUSIA, ASIA TENGAH & AURORA",
  heroTitle: "Pergi jauh, tanpa repot.",
  heroBody:
    "Rute, visa, dan koordinasi perjalanan kami siapkan sejak awal, kamu tinggal menikmati.",
} as const;

function normalizeForComparison(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("id-ID")
    .replace(/[.!?]+$/g, "");
}

/**
 * Keeps intentional CMS edits, while replacing only the retired homepage copy
 * that is already stored in production content.
 */
export function replaceLegacyHomepageCopy(
  value: string,
  legacyValue: string,
  replacement: string,
) {
  return normalizeForComparison(value) === normalizeForComparison(legacyValue)
    ? replacement
    : value.trim();
}
