/* Halaman hub Destinasi — index 3 halaman destinasi (Murmansk, Teriberka,
   Kazakhstan). Breadcrumb JSON-LD halaman destinasi sudah menunjuk ke
   /destinations, jadi halaman ini wajib ada (sebelumnya 404).
   Design system mengikuti pola halaman destinasi & tours (theme helpers). */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, ChevronRight, Compass, FileText } from "lucide-react";
import { cldOptimize } from "@/lib/utils";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

// Konten hub jarang berubah — cukup segarkan tiap 1 jam (cuma baca site_theme).
export const revalidate = 3600;

const PAGE_TITLE = "Destinasi Pilihan · Sundaf Trip";
const PAGE_DESC =
  "Jelajahi destinasi pilihan Sundaf Trip untuk traveler Indonesia: aurora borealis di Murmansk, desa di ujung dunia Teriberka, dan alam liar Kazakhstan. Panduan lengkap, budget rupiah, dan paket tour tersedia.";

export const metadata: Metadata = {
  title: "Destinasi Pilihan",
  description: PAGE_DESC,
  alternates: { canonical: "https://sundaftrip.com/destinations" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: "https://sundaftrip.com/destinations",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
};

/* Gambar kartu diambil dari URL yang sudah dipakai halaman destinasi
   masing-masing, dioptimasi via cldOptimize (Cloudinary w_480; URL
   non-Cloudinary lolos apa adanya). */
const DESTINATIONS = [
  {
    slug: "murmansk",
    name: "Murmansk",
    region: "Rusia · Lingkar Arktik",
    img: cldOptimize(
      "https://res.cloudinary.com/dlmgl1grq/image/upload/v1778586061/WhatsApp_Image_2026-05-12_at_18.25.04_bghn1q.jpg",
      480,
    ),
    alt: "Aurora borealis di langit Murmansk, Rusia",
    desc: "Kota terbesar di atas Lingkar Arktik dan gerbang berburu aurora borealis. Husky sledding, snowmobile safari, sampai makan kepiting raja Murmansk — semua dalam satu trip.",
  },
  {
    slug: "teriberka",
    name: "Teriberka",
    region: "Rusia · Laut Barents",
    img: cldOptimize(
      "https://res.cloudinary.com/dlmgl1grq/image/upload/v1778586061/WhatsApp_Image_2026-05-12_at_18.27.58_xusryb.jpg",
      480,
    ),
    alt: "Teriberka di tepi Laut Barents, Rusia",
    desc: "Desa nelayan terpencil tempat daratan Rusia berakhir, lokasi syuting film Leviathan. Whale watching di Laut Barents, aurora paling gelap, dan pantai telur naga yang ikonik.",
  },
  {
    slug: "kazakhstan",
    name: "Kazakhstan",
    region: "Asia Tengah · Bebas Visa 30 Hari",
    img: cldOptimize(
      "https://images.pexels.com/photos/33731541/pexels-photo-33731541.jpeg?auto=compress&cs=tinysrgb&w=800",
      480,
    ),
    alt: "Danau Kaindy dengan hutan tenggelam, Kazakhstan",
    desc: "Bebas visa 30 hari untuk WNI. Danau Kaindy dengan hutan tenggelamnya, Charyn Canyon, Almaty di kaki Tian Shan, sampai Astana yang futuristik di tengah stepa.",
  },
];

async function getTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    return row?.value ?? "classic";
  } catch {
    return "classic";
  }
}

export default async function DestinationsPage() {
  const rawTheme = await getTheme();
  const theme = rawTheme === "console" ? "atlas" : rawTheme;

  /* ── theme helpers (pola sama dengan halaman destinasi lain) ── */
  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isFumayo   = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isFumayo;

  const pageBg  = isFumayo ? "var(--fb-bg)" : isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : isAtlas ? "var(--at-bg)" : undefined;
  const headClr = isFumayo ? "var(--fb-text)" : isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : isAtlas ? "var(--at-text)" : undefined;
  const subClr  = isFumayo ? "var(--fb-subtext)" : isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : isAtlas ? "var(--at-subtext)" : undefined;
  const cardBg  = isFumayo ? "var(--fb-card)" : isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : isAtlas ? "var(--at-card)" : undefined;
  const bdrClr  = isFumayo ? "var(--fb-border)" : isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : isAtlas ? "var(--at-border)" : undefined;

  const pageGrid = isPixel ? { backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" }
    : isMap ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }
    : isAtlas ? { backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)", backgroundSize: "32px 32px" }
    : isFumayo ? { backgroundImage: "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)", backgroundSize: "26px 26px", fontFamily: "var(--fb-font)" }
    : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pageGrid } : {};

  const pillClass = isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isPixel ? "px-pill" : isGlobe ? "gl-pill" : isMap ? "mp-pill" : isAtlas ? "at-pill" : "rounded-full px-3 py-1 text-xs font-medium";

  const eyebrowStyle = isKawaii   ? { background: "var(--kw-peach)", color: "var(--kw-text)" }
                     : isTropical ? { background: "var(--tr-mint)", color: "var(--tr-text)" }
                     : isPixel    ? { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
                     : isGlobe    ? { background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }
                     : isMap      ? { background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }
                     : isAtlas    ? { color: "var(--at-subtext)" }
                     : { background: "var(--site-accent,#2d6a4f)", color: "#111827", opacity: 0.95 };

  const cardClass = isKawaii ? "kw-card" : isTropical ? "tr-card" : isPixel ? "px-card" : isGlobe ? "gl-card" : isMap ? "mp-card" : isAtlas ? "at-card"
    : "bg-white rounded-2xl border border-gray-200 hover:border-gray-300";

  return (
    <div className={`destination-light-surface min-h-screen pt-24 ${!isOutlined ? "bg-white" : ""}`} style={wrapperStyle}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Destinasi", url: "/destinations" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        {/* ── HEADER ── */}
        <div className="pt-8 mb-10">
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► DESTINASI" : "Destinasi"}
          </span>
          <h1 className={`text-3xl sm:text-5xl font-black mt-3 mb-4 leading-tight ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Destinasi Pilihan Sundaf Trip
          </h1>
          <p className={`text-sm sm:text-base max-w-2xl leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`}
            style={{ color: subClr }}>
            Panduan destinasi yang kami tulis khusus untuk traveler Indonesia: cara ke sana
            dari Jakarta, aktivitas terbaik, sampai estimasi budget dalam rupiah.
          </p>
        </div>

        {/* ── KARTU DESTINASI ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {DESTINATIONS.map((d) => (
            <Link key={d.slug} href={`/destinations/${d.slug}`}
              className={`group block overflow-hidden transition-all duration-300 hover:-translate-y-1 ${cardClass}`}
              style={cardBg ? { background: cardBg, borderColor: bdrClr, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `3px 3px 0 0 ${bdrClr}` : undefined } : {}}>
              <div className="relative h-48 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                <Image
                  src={d.img}
                  alt={d.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <p className={`text-xs mb-1.5 flex items-center gap-1 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>
                  <MapPin size={11} /> {d.region}
                </p>
                <h2 className={`font-black text-lg leading-tight mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                  style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
                  {d.name}
                </h2>
                <p className={`text-sm leading-relaxed mb-3 ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`} style={{ color: subClr }}>
                  {d.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:underline"
                  style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                  Baca panduan {d.name} <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── CTA: tour & visa ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/tours"
            className={`group flex items-start gap-4 p-6 transition-all duration-300 hover:-translate-y-0.5 ${cardClass}`}
            style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
            <span className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "var(--site-accent,#2d6a4f)", color: "#111827" }}>
              <Compass size={18} />
            </span>
            <span>
              <span className={`block font-black mb-1 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>
                Lihat Semua Paket Tour
              </span>
              <span className={`block text-sm leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`} style={{ color: subClr }}>
                Trip rombongan ke destinasi-destinasi ini, sudah termasuk visa, tiket, dan pendampingan tour leader.
              </span>
            </span>
          </Link>
          <Link href="/visa"
            className={`group flex items-start gap-4 p-6 transition-all duration-300 hover:-translate-y-0.5 ${cardClass}`}
            style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
            <span className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "var(--site-accent,#2d6a4f)", color: "#111827" }}>
              <FileText size={18} />
            </span>
            <span>
              <span className={`block font-black mb-1 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>
                Cek Info & Layanan Visa
              </span>
              <span className={`block text-sm leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`} style={{ color: subClr }}>
                Database visa 88 negara untuk paspor Indonesia, lengkap dengan layanan pengurusannya.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
