import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import { prisma } from "@/lib/prisma";

const COLOR_DEFAULTS: Record<string, string> = {
  color_hero: "#0d2018",
  color_heading: "#111827",
  color_tour_title: "#111827",
  color_blog_title: "#111827",
  color_accent: "#2d6a4f",
  color_eyebrow: "#6b7280",
};

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const colorRows = await prisma.companyInfo.findMany({
    where: { key: { startsWith: "color_" } },
  });

  const colors = { ...COLOR_DEFAULTS };
  colorRows.forEach((r) => { colors[r.key] = r.value; });

  const cssVars = Object.entries(colors)
    .map(([k, v]) => `--${k.replace("color_", "site-")}: ${v};`)
    .join(" ");

  return (
    <>
      <style>{`:root { ${cssVars} }`}</style>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
