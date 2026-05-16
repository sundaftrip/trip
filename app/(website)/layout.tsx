import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const COLOR_DEFAULTS: Record<string, string> = {
  color_hero: "#0d2018",
  color_heading: "#111827",
  color_tour_title: "#111827",
  color_blog_title: "#111827",
  color_accent: "#2d6a4f",
  color_eyebrow: "#6b7280",
};

const COLOR_KEYS = Object.keys(COLOR_DEFAULTS);

/* Map font key → CSS variable (loaded in root layout via next/font) */
const FONT_CSS_VAR: Record<string, string> = {
  jost:          "var(--font-jost)",
  "plus-jakarta": "var(--font-plus-jakarta)",
  "dm-sans":     "var(--font-dm-sans)",
  outfit:        "var(--font-outfit)",
  nunito:        "var(--font-nunito)",
  playfair:      "var(--font-playfair)",
  raleway:       "var(--font-raleway)",
  poppins:       "var(--font-poppins)",
};

const getSiteConfig = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: { key: { in: [...COLOR_KEYS, "company_logo", "site_theme", "site_font"] } },
      });
      const colors = { ...COLOR_DEFAULTS };
      let logo = "";
      let theme = "classic";
      let font = "jost";
      rows.forEach((r) => {
        if (r.key === "company_logo") logo = r.value;
        else if (r.key === "site_theme") theme = r.value;
        else if (r.key === "site_font") font = r.value;
        else colors[r.key] = r.value;
      });
      return { colors, logo, theme, font };
    } catch {
      return { colors: { ...COLOR_DEFAULTS }, logo: "", theme: "classic", font: "jost" };
    }
  },
  ["site-config"],
  { revalidate: 3600, tags: ["site-colors"] }
);

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { colors, logo, theme, font } = await getSiteConfig();

  const fontFamily = FONT_CSS_VAR[font] ?? FONT_CSS_VAR["jost"];
  const accent = colors["color_accent"] ?? "#2d6a4f";
  const cssVars =
    Object.entries(colors)
      .map(([k, v]) => `--${k.replace("color_", "site-")}: ${v};`)
      .join(" ") +
    ` --site-accent: ${accent};` +
    ` --site-font-family: ${fontFamily};` +
    // Background bernuansa lembut dari warna aksen — ikut berubah saat skema diganti
    ` --site-bg: color-mix(in srgb, ${accent} 5%, #ffffff);` +
    ` --site-bg-soft: color-mix(in srgb, ${accent} 9%, #ffffff);`;

  return (
    <>
      <style>{`
        :root { ${cssVars} }
        .dark {
          --site-hero: #ffffff;
          --site-heading: #f9fafb;
          --site-tour-title: #f3f4f6;
          --site-blog-title: #f3f4f6;
          --site-eyebrow: #9ca3af;
          --site-bg: color-mix(in srgb, var(--site-accent) 14%, #060606);
          --site-bg-soft: color-mix(in srgb, var(--site-accent) 20%, #0a0a0a);
        }
      `}</style>
      <Navbar logo={logo} theme={theme} />
      <main className="flex-1" data-theme={theme}>{children}</main>
      <Footer theme={theme} />
    </>
  );
}
