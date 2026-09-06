export const HOME_COPY = {
  heroEyebrow: "SPESIALIS RUSIA, ASIA TENGAH & AURORA",
  heroTitle: "Jelajahi Rusia, Asia Tengah & Aurora.",
  heroBody:
    "Pilih open trip dengan jadwal tetap atau rancang perjalanan privat. Kami membantu menyiapkan rute, visa, dan kebutuhan sebelum berangkat.",
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
