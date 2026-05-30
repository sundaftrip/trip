import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import ConsoleSidebar from "@/components/website/ConsoleSidebar";
import StickyWhatsApp from "@/components/website/StickyWhatsApp";
import OrganizationSchema from "@/components/website/OrganizationSchema";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// REBRAND 2026-05-31 — SUNDAF charcoal/teal defaults (was forest green).
const COLOR_DEFAULTS: Record<string, string> = {
  color_hero: "#222831",
  color_heading: "#222831",
  color_tour_title: "#222831",
  color_blog_title: "#222831",
  color_accent: "#00ADB5",
  color_eyebrow: "#00ADB5",
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
  caveat:        "var(--font-caveat)",
};

const getSiteConfig = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: { key: { in: [...COLOR_KEYS, "company_logo", "site_theme", "site_font", "company_whatsapp"] } },
      });
      const colors = { ...COLOR_DEFAULTS };
      let logo = "";
      let theme = "classic";
      let font = "jost";
      let whatsapp = "";
      rows.forEach((r) => {
        if (r.key === "company_logo") logo = r.value;
        else if (r.key === "site_theme") theme = r.value;
        else if (r.key === "site_font") font = r.value;
        else if (r.key === "company_whatsapp") whatsapp = r.value;
        else colors[r.key] = r.value;
      });
      return { colors, logo, theme, font, whatsapp };
    } catch {
      return { colors: { ...COLOR_DEFAULTS }, logo: "", theme: "classic", font: "jost", whatsapp: "" };
    }
  },
  ["site-config"],
  { revalidate: 3600, tags: ["site-colors"] }
);

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  const { colors, logo, font, theme, whatsapp } = config;
  // Preview-theme via cookie sengaja dihilangkan dari server layout karena
  // cookies() membuat seluruh segmen dynamic dan menghancurkan edge cache.
  // Admin yang mau preview theme bisa ubah site_theme di /admin/settings.

  const fontFamily = FONT_CSS_VAR[font] ?? FONT_CSS_VAR["jost"];
  const accent = colors["color_accent"] ?? "#00ADB5";
  const cssVars =
    Object.entries(colors)
      .map(([k, v]) => `--${k.replace("color_", "site-")}: ${v};`)
      .join(" ") +
    ` --site-accent: ${accent};` +
    // Aksen aman-kontras untuk dipakai sebagai teks (light = aksen apa adanya)
    ` --site-accent-ink: ${accent};` +
    ` --site-font-family: ${fontFamily};` +
    // Background bernuansa lembut dari warna aksen — ikut berubah saat skema diganti
    ` --site-bg: color-mix(in srgb, ${accent} 5%, #ffffff);` +
    ` --site-bg-soft: color-mix(in srgb, ${accent} 9%, #ffffff);`;

  const styleBlock = (
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
        --site-accent-ink: color-mix(in srgb, var(--site-accent) 55%, #ffffff);
      }
    `}</style>
  );

  /* ── CONSOLE — layout sidebar ala dashboard ── */
  if (theme === "console") {
    return (
      <>
        {styleBlock}
        <OrganizationSchema />
        <div className="flex flex-1 min-h-screen" style={{ background: "var(--at-bg)" }}>
          <ConsoleSidebar logo={logo} />
          <div className="flex-1 min-w-0 flex flex-col">
            <main className="cns-main flex-1 pt-14 lg:pt-0" data-theme="console">{children}</main>
            <Footer theme="atlas" />
          </div>
        </div>
        <StickyWhatsApp phone={whatsapp} />
      </>
    );
  }

  /* ── TERI — tema original (honeycomb + shadow warni + tepi bergerigi) ── */
  const isTeri = theme === "teri";

  return (
    <>
      {styleBlock}
      <OrganizationSchema />
      <Navbar logo={logo} theme={theme} />
      <main className={`flex-1 ${isTeri ? "teri-bg" : ""}`} data-theme={theme}>{children}</main>
      <Footer theme={theme} />
      <StickyWhatsApp phone={whatsapp} />
    </>
  );
}
