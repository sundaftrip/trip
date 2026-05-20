export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import HeroSection from "@/components/website/HeroSection";
import WhySection from "@/components/website/WhySection";
import ToursSection from "@/components/website/ToursSection";
import BlogSection from "@/components/website/BlogSection";
import ContactSection from "@/components/website/ContactSection";
import TestimonialSection from "@/components/website/TestimonialSection";
import Pagination from "@/components/website/Pagination";
import TourFilter, { regionOf, type RegionKey, REGIONS } from "@/components/website/TourFilter";

const TOURS_PER_PAGE = 12;

const getData = unstable_cache(async () => {
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
// tag "site-colors" disertakan agar cache ikut dibuang saat tema/warna/font diganti
}, ["home-page-data"], { revalidate: 300, tags: ["home-data", "site-colors"] });

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; region?: string }>;
}) {
  const { texts, tours: allTours, posts, company, companyRows, testimonials } = await getData();
  const wa = toWaNumber(company["company_whatsapp"]);
  const companyName = company["company_name"] || "";
  const themeRow = companyRows.find((r) => r.key === "site_theme");
  const rawTheme = themeRow?.value || "classic";
  const theme = (rawTheme === "console" ? "atlas" : rawTheme) as "classic" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "fumayo";

  // Filter region + pagination katalog tour — 12 per halaman
  const sp = await searchParams;
  const activeRegion: RegionKey = (REGIONS.find(r => r.key === sp.region)?.key ?? "all");
  const filteredTours = activeRegion === "all"
    ? allTours
    : allTours.filter(t => regionOf(t.country) === activeRegion);
  const totalPages = Math.max(1, Math.ceil(filteredTours.length / TOURS_PER_PAGE));
  const currentPage = Math.min(totalPages, Math.max(1, Number(sp.page) || 1));
  const tours = filteredTours.slice((currentPage - 1) * TOURS_PER_PAGE, currentPage * TOURS_PER_PAGE);

  return (
    <>
      <HeroSection texts={texts} waNumber={wa} companyName={companyName} theme={theme} />
      <div id="tours">
        <ToursSection tours={tours} theme={theme}>
          {theme === "globe" && (
            <TourFilter active={activeRegion} />
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </ToursSection>
      </div>
      <WhySection texts={texts} theme={theme} />
      <BlogSection posts={posts} theme={theme} />
      <TestimonialSection items={testimonials} theme={theme} />
      <ContactSection texts={texts} company={company} theme={theme} />
    </>
  );
}
