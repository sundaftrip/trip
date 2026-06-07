/* Halaman daftar lengkap semua tour, upcoming bookable di atas,
   trip selesai/sold-out turun ke bawah sebagai dokumentasi. */
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { CheckCircle, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ToursCatalog from "@/components/website/ToursCatalog";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export const revalidate = 300;

const TOURS_TITLE = "Semua Paket Tour | Sundaf Trip";
const TOURS_DESC =
  "Daftar lengkap paket tour Sundaf Trip, upcoming bookable & dokumentasi trip yang sudah berlangsung.";

export const metadata: Metadata = {
  title: "Semua Paket Tour",
  description: TOURS_DESC,
  alternates: { canonical: "https://sundaftrip.com/tours" },
  // Override OG/Twitter agar share ke WhatsApp/IG menampilkan judul halaman ini,
  // bukan preview beranda (root layout default-nya beranda). Lihat brief P0.3.
  openGraph: {
    title: TOURS_TITLE,
    description: TOURS_DESC,
    url: "https://sundaftrip.com/tours",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TOURS_TITLE,
    description: TOURS_DESC,
  },
};

const getData = unstable_cache(
  async () => {
    const [toursRaw, companyRows] = await Promise.all([
      prisma.tour.findMany({
        where: { status: { in: ["ACTIVE", "FULL"] } },
        orderBy: { tripDate: "asc" },
        select: {
          id: true, slug: true, title: true, country: true, cityHighlight: true,
          price: true, promoPrice: true, seatsLeft: true,
          tripDate: true, duration: true, heroImg: true, badge: true,
          status: true,
        },
      }),
      prisma.companyInfo.findMany({ where: { key: "site_theme" } }),
    ]);
    const now = new Date();
    const tours = [...toursRaw].sort((a, b) => {
      const aDone = a.status === "FULL" || (!!a.tripDate && a.tripDate < now);
      const bDone = b.status === "FULL" || (!!b.tripDate && b.tripDate < now);
      if (aDone !== bDone) return aDone ? 1 : -1;
      const at = a.tripDate?.getTime() ?? Infinity;
      const bt = b.tripDate?.getTime() ?? Infinity;
      return aDone ? bt - at : at - bt;
    });
    const themeRow = companyRows.find((r) => r.key === "site_theme");
    return { tours, theme: themeRow?.value || "classic" };
  },
  ["all-tours-page"],
  { revalidate: 300, tags: ["home-data", "site-colors"] },
);

export default async function ToursPage() {
  const { tours, theme: rawTheme } = await getData();
  const theme = (rawTheme === "console" ? "atlas" : rawTheme) as
    | "classic" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "fumayo";

  // Hitung rekam jejak dari data nyata (P2.1): trip yang sudah berlangsung
  // dibingkai sebagai bukti pengalaman, bukan katalog kosong.
  const now = new Date();
  const doneCount = tours.filter(
    (t) => t.status === "FULL" || (!!t.tripDate && t.tripDate < now),
  ).length;
  const bookableCount = tours.length - doneCount;

  return (
    <main className="pt-24">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Semua Paket Tour", url: "/tours" },
        ]}
      />
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-1.5 h-5 rounded-full" style={{ background: "var(--site-accent,#2d6a4f)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Katalog Lengkap
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Semua Paket Tour
        </h1>

        {/* Badge rekam jejak — angka dihitung dari data tour (akurat, bukan estimasi) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {doneCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 12%, transparent)", color: "var(--site-accent,#2d6a4f)" }}
            >
              <CheckCircle size={13} aria-hidden="true" />
              {doneCount} perjalanan terdokumentasi
            </span>
          )}
          {bookableCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <CalendarClock size={13} aria-hidden="true" />
              {bookableCount} keberangkatan terbuka
            </span>
          )}
        </div>

        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          Paket yang bisa dipesan ada di atas. Di bawahnya, dokumentasi
          perjalanan yang sudah kami pandu — bukti rekam jejak, bukan katalog kosong.
        </p>
      </header>

      <div id="tours">
        <ToursCatalog tours={tours} theme={theme} showFilter split />
      </div>
    </main>
  );
}
