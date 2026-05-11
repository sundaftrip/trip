export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/website/HeroSection";
import WhySection from "@/components/website/WhySection";
import ToursSection from "@/components/website/ToursSection";
import BlogSection from "@/components/website/BlogSection";
import ContactSection from "@/components/website/ContactSection";

async function getData() {
  const [texts, tours, posts, companyRows] = await Promise.all([
    prisma.siteText.findMany(),
    prisma.tour.findMany({ where: { status: "ACTIVE" }, take: 6, orderBy: { createdAt: "desc" } }),
    prisma.blog.findMany({ where: { published: true }, take: 3, orderBy: { date: "desc" } }),
    prisma.companyInfo.findMany(),
  ]);
  const t: Record<string, { id?: string; en?: string }> = {};
  texts.forEach((x) => { t[x.key] = { id: x.valueId ?? undefined, en: x.valueEn ?? undefined }; });
  const company: Record<string, string> = {};
  companyRows.forEach((c) => { company[c.key] = c.value; });
  return { texts: t, tours, posts, company, companyRows };
}

export default async function HomePage() {
  const { texts, tours, posts, company, companyRows } = await getData();
  const wa = company["company_whatsapp"] || "";
  const companyName = company["company_name"] || "";
  const themeRow = companyRows.find((r) => r.key === "site_theme");
  const theme = (themeRow?.value || "classic") as "classic" | "vibrant" | "bold";
  return (
    <>
      <HeroSection texts={texts} waNumber={wa} companyName={companyName} theme={theme} />
      <ToursSection tours={tours} theme={theme} />
      <WhySection texts={texts} theme={theme} />
      <BlogSection posts={posts} theme={theme} />
      <ContactSection texts={texts} company={company} />
    </>
  );
}
