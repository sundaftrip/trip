/* Halaman daftar lengkap semua tour, upcoming bookable di atas,
   trip selesai/sold-out turun ke bawah sebagai dokumentasi. */
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import ToursCatalog from "@/components/website/ToursCatalog";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export const revalidate = 60;

const TOURS_TITLE = "Semua Paket Tour · Sundaf Trip";
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

  /* Latar main mengikuti tema aktif — tanpa ini, padding navbar (pt-24)
     transparan dan memperlihatkan body charcoal sebagai pita gelap di bawah
     navbar. Atlas memakai kelas grid agar polanya menyambung mulus. */
  const bgTema: Record<string, { cls?: string; style?: React.CSSProperties }> = {
    atlas: { cls: "at-grid-bg", style: { backgroundColor: "var(--at-bg)" } },
    map: { style: { background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" } },
    pixel: { style: { background: "var(--px-bg)", backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" } },
    globe: { style: { background: "var(--gl-bg)" } },
    kawaii: { style: { background: "var(--kw-bg)" } },
    tropical: { style: { background: "var(--tr-bg)" } },
    fumayo: { cls: "fb-page" },
  };
  const bg = bgTema[theme] ?? {};

  return (
    <main className={`pt-24${bg.cls ? ` ${bg.cls}` : ""}`} style={bg.style}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Semua Paket Tour", url: "/tours" },
        ]}
      />
      <div id="tours" className="pt-2">
        <ToursCatalog tours={tours} theme={theme} showFilter split />
      </div>
    </main>
  );
}
