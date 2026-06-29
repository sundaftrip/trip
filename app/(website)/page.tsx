// ISR, homepage di-revalidate setiap 5 menit lewat unstable_cache di getData().
// Tidak pakai force-dynamic agar Vercel Edge bisa cache HTML → TTFB cepat.
export const revalidate = 60;
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import { compareFeaturedTourOrder } from "@/lib/tour-order";
import HeroSection from "@/components/website/HeroSection";
import WhyGallery from "@/components/website/WhyGallery";
import ToursSection from "@/components/website/ToursSection";
import BlogSection from "@/components/website/BlogSection";
import ContactSection from "@/components/website/ContactSection";
import TestimonialSection from "@/components/website/TestimonialSection";

const getData = unstable_cache(async () => {
  const [texts, toursRaw, posts, companyRows, testimonials] = await Promise.all([
    prisma.siteText.findMany(),
    // SELECT explicit, homepage card hanya butuh field ini. Skip:
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
      select: {
        id: true, slug: true, title: true, country: true, cityHighlight: true,
        price: true, promoPrice: true, seatsLeft: true,
        tripDate: true, duration: true, heroImg: true, badge: true,
        status: true, pinned: true,
      },
    }),
    prisma.blog.findMany({
      where: { published: true },
      take: 3,
      orderBy: { date: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        cover: true,
        category: true,
        date: true,
        author: true,
        readTime: true,
      },
    }),
    prisma.companyInfo.findMany(),
    prisma.testimonial.findMany({
      where: { published: true, category: "trip" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        role: true,
        content: true,
        rating: true,
        avatar: true,
      },
    }),
  ]);
  // Sudah difilter di query, tinggal urut: pinned + niche utama
  // (Rusia/Asia Tengah/Aurora) dulu, lalu tanggal terdekat.
  const tours = [...toursRaw].sort(compareFeaturedTourOrder).slice(0, 9);
  const t: Record<string, { id?: string; en?: string }> = {};
  texts.forEach((x) => { t[x.key] = { id: x.valueId ?? undefined, en: x.valueEn ?? undefined }; });
  const company: Record<string, string> = {};
  companyRows.forEach((c) => { company[c.key] = c.value; });
  return { texts: t, tours, posts, company, companyRows, testimonials };
// tag "site-colors" disertakan agar cache ikut dibuang saat tema/warna/font diganti
}, ["home-page-data", "home-payload-v1"], { revalidate: 300, tags: ["home-data", "site-colors"] });

const galleryDeferStyle: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "544px",
};

const blogDeferStyle: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "620px",
};

export async function generateMetadata(): Promise<Metadata> {
  // Title, description, keywords, OG & Twitter card — semuanya diwarisi dari
  // root layout (app/layout.tsx) yang sudah brand-forward + kaya kata kunci
  // niche (Rusia/Asia Tengah/Aurora). og:image diambil otomatis dari
  // app/opengraph-image.tsx (kartu 1200×630).
  //
  // PENTING: jangan men-deklarasi `openGraph` di sini tanpa `images`. Object
  // openGraph kosong itu yang dulu MEMATIKAN kartu share (og:image hilang).
  // Override lama ("Paket Wisata Terpercaya") juga melemahkan SEO niche.
  // Cukup kunci canonical-nya saja.
  return {
    alternates: { canonical: "https://sundaftrip.com" },
  };
}

export default async function HomePage() {
  // Tidak ada searchParams, pagination + filter region ditangani di
  // client (lihat ToursCatalog). Hasilnya: page HTML jadi STATIC dan
  // bisa di-cache Vercel Edge.
  const { texts, tours: allTours, posts, company, companyRows, testimonials } = await getData();
  const wa = toWaNumber(company["company_whatsapp"]);
  const companyName = "Sundaf Trip";
  const themeRow = companyRows.find((r) => r.key === "site_theme");
  const rawTheme = themeRow?.value || "classic";
  const theme = (rawTheme === "console" ? "atlas" : rawTheme) as "classic" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "fumayo";
  const pinnedTours = allTours.filter((tour) => tour.pinned);
  const regularTours = allTours.filter((tour) => !tour.pinned);

  return (
    <>
      <HeroSection texts={texts} waNumber={wa} companyName={companyName} theme={theme} />
      <div id="tours">
        <ToursSection tours={regularTours} pinnedTours={pinnedTours} theme={theme}>
          <div className="flex justify-center pt-5 pb-6">
            <Link
              href="/tours"
              prefetch={false}
              className="tours-cta group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-wide"
              style={{ color: "var(--site-accent,#2d6a4f)" }}
            >
              <span>Lihat semua jadwal &amp; dokumentasi</span>
              <ArrowRight size={16} aria-hidden="true" className="tours-cta-arrow" />
            </Link>
          </div>
        </ToursSection>
      </div>
      <div style={galleryDeferStyle}>
        <WhyGallery theme={theme} />
      </div>
      <div style={blogDeferStyle}>
        <BlogSection posts={posts} theme={theme} />
      </div>
      <TestimonialSection items={testimonials} theme={theme} />
      <ContactSection texts={texts} company={company} theme={theme} />
    </>
  );
}
