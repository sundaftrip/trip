// ISR, homepage di-revalidate setiap 5 menit lewat unstable_cache di getData().
// Tidak pakai force-dynamic agar Vercel Edge bisa cache HTML → TTFB cepat.
export const revalidate = 60;
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import { compareFeaturedTourOrder } from "@/lib/tour-order";
import PremiumHome from "@/components/website/PremiumHome";

const getData = unstable_cache(async () => {
  const [toursRaw, posts, companyRows, testimonials] = await Promise.all([
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
      take: 2,
      orderBy: { date: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        date: true,
        readTime: true,
      },
    }),
    prisma.companyInfo.findMany({
      where: { key: { in: ["company_whatsapp"] } },
    }),
    prisma.testimonial.findMany({
      where: { published: true, category: "trip" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        name: true,
        role: true,
        content: true,
      },
    }),
  ]);
  // Sudah difilter di query, tinggal urut: pinned + niche utama
  // (Rusia/Asia Tengah/Aurora) dulu, lalu tanggal terdekat.
  const tours = [...toursRaw].sort(compareFeaturedTourOrder).slice(0, 3);
  const company: Record<string, string> = {};
  companyRows.forEach((c) => { company[c.key] = c.value; });
  const testimonial = [...testimonials]
    .filter((item) => item.content.trim().length >= 70 && item.content.trim().length <= 360)
    .sort((a, b) => a.content.length - b.content.length)[0] ?? testimonials[0] ?? null;
  return { tours, posts, company, testimonial };
// tag "site-colors" disertakan agar cache ikut dibuang saat tema/warna/font diganti
}, ["home-page-data", "home-payload-premium-v1"], { revalidate: 300, tags: ["home-data", "site-colors"] });

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
  const { tours, posts, company, testimonial } = await getData();
  const wa = toWaNumber(company["company_whatsapp"]);

  return <PremiumHome tours={tours} posts={posts} testimonial={testimonial} whatsappNumber={wa} />;
}
