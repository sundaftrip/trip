export interface ColorScheme {
  id: string;
  name: string;
  desc: string;
  swatch: string[];
  colors: {
    color_hero: string;
    color_heading: string;
    color_tour_title: string;
    color_blog_title: string;
    color_accent: string;
    color_eyebrow: string;
  };
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "forest",
    name: "Forest",
    desc: "Hijau alam yang elegan",
    swatch: ["#0d2018", "#2d6a4f", "#52b788", "#d8f3dc"],
    colors: {
      color_hero: "#0d2018", color_heading: "#1b4332",
      color_tour_title: "#1b4332", color_blog_title: "#1b4332",
      color_accent: "#2d6a4f", color_eyebrow: "#52b788",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    desc: "Biru dalam yang tenang",
    swatch: ["#0c1a2e", "#1e3a5f", "#2563eb", "#bfdbfe"],
    colors: {
      color_hero: "#0c1a2e", color_heading: "#1e3a5f",
      color_tour_title: "#1e3a5f", color_blog_title: "#1e3a5f",
      color_accent: "#2563eb", color_eyebrow: "#60a5fa",
    },
  },
  {
    id: "ember",
    name: "Ember",
    desc: "Hangat & penuh semangat",
    swatch: ["#1c0a00", "#7c2d12", "#ea580c", "#fed7aa"],
    colors: {
      color_hero: "#1c0a00", color_heading: "#7c2d12",
      color_tour_title: "#431407", color_blog_title: "#431407",
      color_accent: "#ea580c", color_eyebrow: "#fb923c",
    },
  },
  {
    id: "slate",
    name: "Slate",
    desc: "Abu profesional & modern",
    swatch: ["#0f172a", "#1e293b", "#475569", "#e2e8f0"],
    colors: {
      color_hero: "#0f172a", color_heading: "#1e293b",
      color_tour_title: "#1e293b", color_blog_title: "#1e293b",
      color_accent: "#475569", color_eyebrow: "#94a3b8",
    },
  },
  {
    id: "rose",
    name: "Rose Gold",
    desc: "Mewah & feminin",
    swatch: ["#1c0606", "#881337", "#e11d48", "#fecdd3"],
    colors: {
      color_hero: "#1c0606", color_heading: "#881337",
      color_tour_title: "#881337", color_blog_title: "#881337",
      color_accent: "#e11d48", color_eyebrow: "#fb7185",
    },
  },
  {
    id: "sand",
    name: "Sandy Beach",
    desc: "Hangat seperti pasir pantai",
    swatch: ["#1a1207", "#713f12", "#ca8a04", "#fef9c3"],
    colors: {
      color_hero: "#1a1207", color_heading: "#713f12",
      color_tour_title: "#713f12", color_blog_title: "#713f12",
      color_accent: "#ca8a04", color_eyebrow: "#eab308",
    },
  },
  {
    id: "violet",
    name: "Royal Violet",
    desc: "Ungu kerajaan yang megah",
    swatch: ["#0d0020", "#3b0764", "#7c3aed", "#ddd6fe"],
    colors: {
      color_hero: "#0d0020", color_heading: "#3b0764",
      color_tour_title: "#3b0764", color_blog_title: "#3b0764",
      color_accent: "#7c3aed", color_eyebrow: "#a78bfa",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    desc: "Gelap elegan seperti langit malam",
    swatch: ["#020617", "#0f172a", "#334155", "#94a3b8"],
    colors: {
      color_hero: "#020617", color_heading: "#0f172a",
      color_tour_title: "#1e293b", color_blog_title: "#1e293b",
      color_accent: "#334155", color_eyebrow: "#64748b",
    },
  },
  {
    id: "sakura",
    name: "Sakura",
    desc: "Lembut & romantis",
    swatch: ["#1a0010", "#9d174d", "#ec4899", "#fce7f3"],
    colors: {
      color_hero: "#1a0010", color_heading: "#831843",
      color_tour_title: "#831843", color_blog_title: "#831843",
      color_accent: "#ec4899", color_eyebrow: "#f472b6",
    },
  },
  {
    id: "teal",
    name: "Teal",
    desc: "Segar & modern",
    swatch: ["#042f2e", "#134e4a", "#0d9488", "#99f6e4"],
    colors: {
      color_hero: "#042f2e", color_heading: "#134e4a",
      color_tour_title: "#134e4a", color_blog_title: "#134e4a",
      color_accent: "#0d9488", color_eyebrow: "#2dd4bf",
    },
  },
];

export const DEFAULT_SCHEME_ID = "forest";

export function getSchemeById(id: string): ColorScheme {
  return COLOR_SCHEMES.find((s) => s.id === id) ?? COLOR_SCHEMES[0];
}
