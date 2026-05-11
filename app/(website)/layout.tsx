import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { getPresetById } from "@/lib/photo-presets";

const COLOR_DEFAULTS: Record<string, string> = {
  color_hero: "#0d2018",
  color_heading: "#111827",
  color_tour_title: "#111827",
  color_blog_title: "#111827",
  color_accent: "#2d6a4f",
  color_eyebrow: "#6b7280",
};

const COLOR_KEYS = Object.keys(COLOR_DEFAULTS);

const getSiteConfig = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: { key: { in: [...COLOR_KEYS, "company_logo", "site_theme", "photo_preset"] } },
      });
      const colors = { ...COLOR_DEFAULTS };
      let logo = "";
      let theme = "classic";
      let photoPreset = "none";
      rows.forEach((r) => {
        if (r.key === "company_logo") logo = r.value;
        else if (r.key === "site_theme") theme = r.value;
        else if (r.key === "photo_preset") photoPreset = r.value;
        else colors[r.key] = r.value;
      });
      return { colors, logo, theme, photoPreset };
    } catch {
      return { colors: { ...COLOR_DEFAULTS }, logo: "", theme: "classic", photoPreset: "none" };
    }
  },
  ["site-config"],
  { revalidate: 3600, tags: ["site-colors"] }
);

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { colors, logo, theme, photoPreset } = await getSiteConfig();

  const cssVars =
    Object.entries(colors)
      .map(([k, v]) => `--${k.replace("color_", "site-")}: ${v};`)
      .join(" ") + ` --site-accent: ${colors["color_accent"] ?? "#2d6a4f"};`;

  const preset = getPresetById(photoPreset);
  const photoFilterVar = preset.filter !== "none" ? `--photo-filter: ${preset.filter};` : "";

  return (
    <>
      <style>{`
        :root { ${cssVars} ${photoFilterVar} }
        .dark {
          --site-hero: #ffffff;
          --site-heading: #f9fafb;
          --site-tour-title: #f3f4f6;
          --site-blog-title: #f3f4f6;
          --site-eyebrow: #9ca3af;
        }
      `}</style>
      <Navbar logo={logo} />
      <main className="flex-1" data-theme={theme} data-photo-preset={photoPreset}>{children}</main>
      <Footer />
    </>
  );
}
