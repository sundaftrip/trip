export interface PhotoPreset {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  /** CSS filter string applied to all tour/gallery images */
  filter: string;
  /** Representative tint for the preview swatch */
  swatch: string;
}

export const PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: "none",
    label: "Asli",
    desc: "Tanpa filter — foto original",
    emoji: "📷",
    filter: "none",
    swatch: "#f3f4f6",
  },
  {
    id: "soft_travel",
    label: "Soft Travel",
    desc: "Hangat, airy, pastel — cocok untuk wisata alam & pantai",
    emoji: "🌿",
    // Exposure +0.3 → brightness(1.07)
    // Contrast -10 → contrast(0.90)
    // Highlights -25 + Shadows +35 → tonal compression via brightness/contrast combo
    // Temperature -3 → very slight cool shift via hue-rotate
    // Vibrance +10 → saturate(1.10) but not too punchy
    // Clarity +8 → no direct CSS equiv; slight contrast+sharpness illusion
    filter: "brightness(1.07) contrast(0.90) saturate(1.08) hue-rotate(-3deg) sepia(0.06)",
    swatch: "#d1fae5",
  },
  {
    id: "golden_hour",
    label: "Golden Hour",
    desc: "Hangat keemasan — ideal untuk foto sore & sunset",
    emoji: "🌅",
    filter: "brightness(1.05) contrast(0.95) saturate(1.15) sepia(0.18) hue-rotate(5deg)",
    swatch: "#fef3c7",
  },
  {
    id: "moody_dark",
    label: "Moody Dark",
    desc: "Kontras dramatis — berkesan premium & elegan",
    emoji: "🎞",
    filter: "brightness(0.90) contrast(1.18) saturate(0.80) sepia(0.05)",
    swatch: "#1f2937",
  },
  {
    id: "vivid",
    label: "Vivid",
    desc: "Warna cerah & tajam — cocok untuk wisata kota & kuliner",
    emoji: "🎨",
    filter: "brightness(1.04) contrast(1.10) saturate(1.30)",
    swatch: "#dbeafe",
  },
  {
    id: "film",
    label: "Film",
    desc: "Analog grain — nostalgia & vintage aesthetic",
    emoji: "📽",
    filter: "brightness(1.02) contrast(0.92) saturate(0.75) sepia(0.20) hue-rotate(-5deg)",
    swatch: "#fce7f3",
  },
];

export function getPresetById(id: string): PhotoPreset {
  return PHOTO_PRESETS.find((p) => p.id === id) ?? PHOTO_PRESETS[0];
}
