export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import HeroSection from "@/components/website/HeroSection";
import WhySection from "@/components/website/WhySection";
import ToursSection from "@/components/website/ToursSection";
import BlogSection from "@/components/website/BlogSection";
import ContactSection from "@/components/website/ContactSection";
import TestimonialSection from "@/components/website/TestimonialSection";

async function getData() {
  const [texts, toursRaw, posts, companyRows, testimonials] = await Promise.all([
    prisma.siteText.findMany(),
    prisma.tour.findMany({ where: { status: { in: ["ACTIVE", "FULL"] } }, orderBy: { tripDate: "asc" } }),
    prisma.blog.findMany({ where: { published: true }, take: 3, orderBy: { date: "desc" } }),
    prisma.companyInfo.findMany(),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);
  // Beranda menampilkan SEMUA tour (halaman Paket Tour terpisah dihapus).
  // Aktif di atas (tanggal terdekat dulu), tour selesai turun ke bawah.
  const now = new Date();
  const tours = [...toursRaw]
    .sort((a, b) => {
      const aDone = a.status === "FULL" || (!!a.tripDate && a.tripDate < now);
      const bDone = b.status === "FULL" || (!!b.tripDate && b.tripDate < now);
      if (aDone !== bDone) return aDone ? 1 : -1;
      const at = a.tripDate ? a.tripDate.getTime() : Infinity;
      const bt = b.tripDate ? b.tripDate.getTime() : Infinity;
      return aDone ? bt - at : at - bt;
    });
  const t: Record<string, { id?: string; en?: string }> = {};
  texts.forEach((x) => { t[x.key] = { id: x.valueId ?? undefined, en: x.valueEn ?? undefined }; });
  const company: Record<string, string> = {};
  companyRows.forEach((c) => { company[c.key] = c.value; });
  return { texts: t, tours, posts, company, companyRows, testimonials };
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const rows = await prisma.companyInfo.findMany({ where: { key: { in: ["company_name", "company_website"] } } });
    const c: Record<string, string> = {};
    rows.forEach((r) => { c[r.key] = r.value; });
    const name = c["company_name"] || "Travel";
    return {
      title: `${name} — Paket Wisata Terpercaya`,
      description: `${name} menyediakan paket wisata terpercaya dengan pelayanan terbaik.`,
      openGraph: { title: `${name} — Paket Wisata`, type: "website" },
    };
  } catch {
    return { title: "Travel — Paket Wisata Terpercaya" };
  }
}

export default async function HomePage() {
  const { texts, tours, posts, company, companyRows, testimonials } = await getData();
  const wa = toWaNumber(company["company_whatsapp"]);
  const companyName = company["company_name"] || "";
  const themeRow = companyRows.find((r) => r.key === "site_theme");
  const rawTheme = themeRow?.value || "classic";
  const theme = (rawTheme === "console" ? "atlas" : rawTheme) as "classic" | "vibrant" | "bold" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "atelier" | "jojo" | "teri" | "attic";

  // Fetch featured image server-side for vibrant theme (no client fetch needed)
  let featuredImage: string | null = null;
  if (theme === "vibrant" && tours.length > 0) {
    const featured = tours.find((t) => t.heroImg) ?? tours[0];
    featuredImage = featured?.heroImg ?? null;
  }

  // Foto-foto untuk carousel hero Atelier — dari heroImg tiap tour
  const heroImages = theme === "atelier"
    ? [...new Set(tours.map((t) => t.heroImg).filter((x): x is string => !!x))].slice(0, 6)
    : [];

  return (
    <>
      <HeroSection texts={texts} waNumber={wa} companyName={companyName} theme={theme} featuredImage={featuredImage} heroImages={heroImages} />
      <div id="tours"><ToursSection tours={tours} theme={theme} /></div>
      <WhySection texts={texts} theme={theme} />
      <BlogSection posts={posts} theme={theme} />
      <TestimonialSection items={testimonials} theme={theme} />
      <ContactSection texts={texts} company={company} theme={theme} />
    </>
  );
}
