// ISR — homepage di-revalidate setiap 5 menit lewat unstable_cache di getData().
// Tidak pakai force-dynamic agar Vercel Edge bisa cache HTML → TTFB cepat.
export const revalidate = 300;
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import HeroSection from "@/components/website/HeroSection";
import WhySection from "@/components/website/WhySection";
import ToursCatalog from "@/components/website/ToursCatalog";
import BlogSection from "@/components/website/BlogSection";
import ContactSection from "@/components/website/ContactSection";
import TestimonialSection from "@/components/website/TestimonialSection";

const getData = unstable_cache(async () => {
  const [texts, toursRaw, posts, companyRows, testimonials] = await Promise.all([
    prisma.siteText.findMany(),
    // SELECT explicit — homepage card hanya butuh field ini. Skip:
    // gallery, itinerary, inclusions, exclusions, hotel, visaInfo, addOns,
    // notes (long), description (long, di-excerpt di card). Hemat JSON
    // payload yang dikirim ke client hydration (ToursCatalog).
    // Homepage HANYA tampilkan trip yang BISA DIBOOK:
    //   - status ACTIVE (bukan FULL/DRAFT/CANCELLED)
    //   - tripDate masih akan datang (atau belum di-set / open trip)
    // Trip selesai pindah ke halaman /tours sebagai portfolio.
    prisma.tour.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ tripDate: null }, { tripDate: { gte: new Date() } }],
      },
      orderBy: { tripDate: "asc" },
      take: 9,
      select: {
        id: true, title: true, country: true, cityHighlight: true,
        price: true, promoPrice: true, seatsLeft: true,
        tripDate: true, duration: true, heroImg: true, badge: true,
        status: true,
      },
    }),
    prisma.blog.findMany({ where: { published: true }, take: 3, orderBy: { date: "desc" } }),
    prisma.companyInfo.findMany(),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);
  // Sudah difilter di query — tinggal urut: tanggal terdekat dulu, open-trip
  // (tripDate null) di paling belakang.
  const tours = [...toursRaw].sort((a, b) => {
    const at = a.tripDate?.getTime() ?? Infinity;
    const bt = b.tripDate?.getTime() ?? Infinity;
    return at - bt;
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

export default async function HomePage() {
  // Tidak ada searchParams — pagination + filter region ditangani di
  // client (lihat ToursCatalog). Hasilnya: page HTML jadi STATIC dan
  // bisa di-cache Vercel Edge.
  const { texts, tours: allTours, posts, company, companyRows, testimonials } = await getData();
  const wa = toWaNumber(company["company_whatsapp"]);
  const companyName = company["company_name"] || "";
  const themeRow = companyRows.find((r) => r.key === "site_theme");
  const rawTheme = themeRow?.value || "classic";
  const theme = (rawTheme === "console" ? "atlas" : rawTheme) as "classic" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "fumayo";

  return (
    <>
      <HeroSection texts={texts} waNumber={wa} companyName={companyName} theme={theme} />
      <div id="tours">
        <ToursCatalog tours={allTours} theme={theme} showFilter={theme === "globe"} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-6 text-center">
          <a
            href="/tours"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide underline-offset-4 hover:underline"
            style={{ color: "var(--site-accent,#2d6a4f)" }}
          >
            Lihat semua tour &amp; dokumentasi trip →
          </a>
        </div>
      </div>
      <WhySection texts={texts} theme={theme} />
      <BlogSection posts={posts} theme={theme} />
      <TestimonialSection items={testimonials} theme={theme} />
      <ContactSection texts={texts} company={company} theme={theme} />
    </>
  );
}
