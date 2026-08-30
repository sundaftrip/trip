import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import ConsoleSidebar from "@/components/website/ConsoleSidebar";
import StickyWhatsApp from "@/components/website/StickyWhatsApp";
import OrganizationSchema from "@/components/website/OrganizationSchema";
import AutoTranslate from "@/components/website/AutoTranslate";
import ReferralCapture from "@/components/website/ReferralCapture";
import RouteScrollReset from "@/components/website/RouteScrollReset";
import CleanNavbar from "@/components/website/clean/CleanNavbar";
import CleanFooter from "@/components/website/clean/CleanFooter";
import CleanThemeBoundary from "@/components/website/clean/CleanThemeBoundary";
import cleanShellStyles from "@/components/website/clean/CleanShell.module.css";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// SUNDAF public identity: petrol teal, midnight navy, and warm ivory.
const COLOR_DEFAULTS: Record<string, string> = {
  color_hero: "#132B3A",
  color_heading: "#132B3A",
  color_tour_title: "#132B3A",
  color_blog_title: "#132B3A",
  color_accent: "#075D63",
  color_eyebrow: "#075D63",
};

const COLOR_KEYS = Object.keys(COLOR_DEFAULTS);

const getFooterTagline = unstable_cache(async () => {
  try {
    return (await prisma.siteText.findUnique({ where: { key: "home_footer_tagline" } }))?.valueId || "";
  } catch {
    return "";
  }
}, ["active-footer-tagline"], { revalidate: 300, tags: ["footer-data"] });

const getSiteConfig = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: {
          OR: [
            { key: { in: [...COLOR_KEYS, "site_theme", "site_font"] } },
            { key: { startsWith: "company_" } },
          ],
        },
      });
      const colors = { ...COLOR_DEFAULTS };
      const company: Record<string, string> = {};
      let logo = "";
      let theme = "atlas";
      let font = "plus-jakarta";
      let whatsapp = "";
      rows.forEach((r) => {
        if (r.key.startsWith("company_")) {
          company[r.key] = r.value;
          if (r.key === "company_logo") logo = r.value;
          if (r.key === "company_whatsapp") whatsapp = r.value;
          return;
        }
        if (r.key === "site_theme") theme = r.value;
        else if (r.key === "site_font") font = r.value;
        else if (r.key in COLOR_DEFAULTS) colors[r.key] = r.value;
      });
      return { colors, logo, theme, font, whatsapp, company };
    } catch {
      return { colors: { ...COLOR_DEFAULTS }, logo: "", theme: "atlas", font: "plus-jakarta", whatsapp: "", company: {} as Record<string, string> };
    }
  },
  ["site-config-v5"],
  { revalidate: 3600, tags: ["site-colors"] }
);

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [config, footerTagline] = await Promise.all([getSiteConfig(), getFooterTagline()]);
  const { colors, logo, theme, whatsapp, company } = config;
  // Preview-theme via cookie sengaja dihilangkan dari server layout karena
  // cookies() membuat seluruh segmen dynamic dan menghancurkan edge cache.
  // Admin yang mau preview theme bisa ubah site_theme di /admin/settings.

  // Identitas editorial Sundaf memakai satu keluarga huruf agar heading,
  // navigasi, dan kartu terasa konsisten. Pengaturan font CMS tetap disimpan
  // untuk kompatibilitas data, tetapi tidak lagi mengganti tipografi publik.
  const fontFamily = 'var(--font-jost), "Helvetica Neue", Arial, sans-serif';
  // Atlas is the canonical public brand. Lock its palette here so an older
  // saved CMS preset (for example forest green or electric blue) cannot leak
  // back into the live website. Other preview themes remain configurable.
  const publicColors = theme === "atlas" ? { ...colors, ...COLOR_DEFAULTS } : colors;
  const accent = publicColors["color_accent"] ?? "#075D63";
  const cssVars =
    Object.entries(publicColors)
      .map(([k, v]) => `--${k.replace("color_", "site-")}: ${v};`)
      .join(" ") +
    ` --site-accent: ${accent};` +
    // Aksen aman-kontras untuk dipakai sebagai teks (light = aksen apa adanya)
    ` --site-accent-ink: ${accent};` +
    ` --site-aurora: #20B8B5;` +
    ` --site-warm-accent: #E58A68;` +
    ` --site-font-family: ${fontFamily};` +
    ` --background: #FFFFFF;` +
    ` --foreground: #132B3A;` +
    ` --site-bg: #FFFFFF;` +
    ` --site-bg-soft: #F3EFE7;` +
    ` --site-surface: #FFFFFF;`;

  const styleBlock = (
    <style>{`
      :root { ${cssVars} }
      .dark {
        --site-accent: #20B8B5;
        --site-hero: #ffffff;
        --site-heading: #f9fafb;
        --site-tour-title: #f3f4f6;
        --site-blog-title: #f3f4f6;
        --site-eyebrow: #8DE5DF;
        --site-bg: color-mix(in srgb, var(--site-accent) 10%, #0b2024);
        --site-bg-soft: color-mix(in srgb, var(--site-accent) 14%, #102a2e);
        --site-accent-ink: #8EF4F2;
      }
    `}</style>
  );

  /* ── CONSOLE, layout sidebar ala dashboard ── */
  if (theme === "console") {
    return (
      <>
        {styleBlock}
        <RouteScrollReset />
        <OrganizationSchema />
        <div className="flex flex-1 min-h-screen" style={{ background: "var(--at-bg)" }}>
          <ConsoleSidebar logo={logo} />
          <div className="flex-1 min-w-0 flex flex-col">
            <main className="cns-main flex-1 pt-14 lg:pt-0" data-theme="console">{children}</main>
            <Footer theme="atlas" />
          </div>
        </div>
        <StickyWhatsApp phone={whatsapp} hideOnTourDetail />
        <AutoTranslate />
        <ReferralCapture />
      </>
    );
  }

  /* ── CLEAN, tampilan publik yang sekarang menjadi native Next.js ── */
  if (theme === "atlas") {
    return (
      <CleanThemeBoundary>
        {styleBlock}
        <RouteScrollReset />
        <OrganizationSchema />
        <a className={cleanShellStyles.skipLink} href="#website-main">
          Langsung ke konten utama
        </a>
        <CleanNavbar logo={logo} whatsapp={whatsapp} />
        <main id="website-main" className="flex-1" data-theme="atlas" tabIndex={-1}>{children}</main>
        <CleanFooter logo={logo} company={company} tagline={footerTagline} />
        <StickyWhatsApp phone={whatsapp} hideOnTourDetail />
        <AutoTranslate />
        <ReferralCapture />
      </CleanThemeBoundary>
    );
  }

  /* ── TERI, tema original (honeycomb + shadow warni + tepi bergerigi) ── */
  const isTeri = theme === "teri";

  return (
    <>
      {styleBlock}
      <RouteScrollReset />
      <OrganizationSchema />
      <Navbar logo={logo} theme={theme} />
      <main className={`flex-1 ${isTeri ? "teri-bg" : ""}`} data-theme={theme}>{children}</main>
      <Footer theme={theme} />
      <StickyWhatsApp phone={whatsapp} />
      <AutoTranslate />
      <ReferralCapture />
    </>
  );
}
