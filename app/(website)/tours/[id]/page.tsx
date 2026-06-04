export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import type React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Calendar, Clock, Users, CheckCircle, XCircle,
  ArrowLeft, Camera, Building2, FileText,
  ClipboardList, Plane, Package, Ban, Route, Download, Star, ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate, toWaNumber } from "@/lib/utils";
import { visaSlug, matchCountryFuzzy } from "@/lib/visa-slug";
import GalleryZoom from "@/components/website/GalleryZoom";
import ItineraryFold from "@/components/website/ItineraryFold";
import TourShareButtons from "@/components/website/TourShareButtons";
import TourBookingCTA from "@/components/website/TourBookingCTA";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

/* ── generateMetadata, og:image dari heroImg tour ───────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [tour, companyRow] = await Promise.all([
    prisma.tour.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      select: { id: true, slug: true, title: true, heroImg: true, description: true, notes: true, visaInfo: true, country: true },
    }),
    prisma.companyInfo.findFirst({ where: { key: "company_name" } }),
  ]);
  if (!tour) return {};

  const companyName = companyRow?.value ?? "Sundaftrip";
  const description = tour.description ?? tour.notes ?? tour.visaInfo ?? `Paket tour ${tour.country} bersama ${companyName}`;

  const canonicalPath = `/tours/${tour.slug ?? tour.id}`;
  return {
    title: tour.title,
    description,
    alternates: { canonical: `${siteUrl}${canonicalPath}` },
    openGraph: {
      title: tour.title,
      description,
      url: `${siteUrl}${canonicalPath}`,
      type: "website",
      siteName: companyName,
      ...(tour.heroImg ? { images: [{ url: tour.heroImg, width: 1200, height: 630, alt: tour.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: tour.title,
      description,
      ...(tour.heroImg ? { images: [tour.heroImg] } : {}),
    },
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // `id` bisa slug rapi (baru) atau cuid (link lama) — resolve keduanya.
  const tour = await prisma.tour.findFirst({ where: { OR: [{ slug: id }, { id }] } });
  if (!tour || (tour.status === "DRAFT" && process.env.NODE_ENV === "production")) notFound();
  const [companyRows, reviews, visaCountries] = await Promise.all([
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "company_name", "site_theme"] } } }),
    prisma.testimonial.findMany({
      where: { tourId: tour.id, published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.countryVisa.findMany({ select: { name: true, en: true } }),
  ]);

  // Agregat rating dari ulasan ASLI tour ini (dasar AggregateRating JSON-LD).
  const reviewCount = reviews.length;
  const ratingValue = reviewCount
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  const now = new Date();
  // Trip yang tanggalnya sudah lewat TIDAK lagi dialihkan, tetap dibuka dalam
  // mode "Trip Selesai" (read-only) supaya ulasan + rating tetap tampil & terindeks.
  const isExpired = !!tour.tripDate && tour.tripDate < now;

  const company: Record<string, string> = {};
  companyRows.forEach((c) => { company[c.key] = c.value; });
  const waNumber = toWaNumber(company["company_whatsapp"]);
  const companyName = company["company_name"] || "";
  const rawSiteTheme = company["site_theme"] ?? "classic";
  const siteTheme = rawSiteTheme === "console" ? "atlas" : rawSiteTheme;
  const isTropical = siteTheme === "tropical";
  const isKawaii   = siteTheme === "kawaii";
  const isPixel    = siteTheme === "pixel";
  const isAtlas    = siteTheme === "atlas";
  const isFumayo   = siteTheme === "fumayo";
  const isOutlined = isTropical || isKawaii || isPixel || isAtlas || isFumayo;

  const pfx   = isTropical ? "tr" : isKawaii ? "kw" : isPixel ? "px" : isAtlas ? "at" : isFumayo ? "fb" : "";
  const tBg   = isFumayo ? "var(--fb-bg)"   : isTropical ? "var(--tr-bg)"   : isKawaii ? "var(--kw-bg)"   : isPixel ? "var(--px-bg)"   : isAtlas ? "var(--at-bg)"   : undefined;
  const tText = isFumayo ? "var(--fb-text)"  : isTropical ? "var(--tr-text)"  : isKawaii ? "var(--kw-text)" : isPixel ? "var(--px-text)" : isAtlas ? "var(--at-text)" : undefined;
  const tCard = isFumayo ? "var(--fb-card)"  : isTropical ? "var(--tr-card)"  : isKawaii ? "var(--kw-card)" : isPixel ? "var(--px-card)" : isAtlas ? "var(--at-card)" : undefined;
  const tMint = isFumayo ? "var(--fb-mint)"  : isTropical ? "var(--tr-mint)"  : isKawaii ? "var(--kw-mint)" : isPixel ? "var(--px-cyan)" : isAtlas ? "var(--at-muted)" : undefined;
  const tSun  = isFumayo ? "var(--fb-sun)"   : isTropical ? "var(--tr-sun)"   : isKawaii ? "var(--kw-sun)"  : isPixel ? "var(--px-yellow)" : isAtlas ? "var(--at-muted)" : undefined;
  const tSub  = isFumayo ? "var(--fb-subtext)" : isTropical ? "var(--tr-subtext)" : isKawaii ? "var(--kw-subtext)" : isPixel ? "var(--px-subtext)" : isAtlas ? "var(--at-subtext)" : undefined;
  const tBdr  = isFumayo ? "var(--fb-border)" : isTropical ? "var(--tr-border)" : isKawaii ? "var(--kw-border)" : isPixel ? "var(--px-border)" : isAtlas ? "var(--at-border)" : undefined;

  const itinerary = (tour.itinerary as { day: number; title: string; description: string }[]) ?? [];
  const addOns = (tour.addOns as { name: string; price: number; tag?: "" | "wajib" | "recommended"; desc?: string }[]) ?? [];
  const hotelInfo = tour.hotel as Record<string, string> | null;

  // Untuk add-on visa: deteksi & arahkan otomatis ke halaman visa negara terkait.
  // Pencocokan toleran typo (fuzzy): "Visa Kirgyztan" tetap nyambung ke "Kyrgyzstan".
  function resolveVisaHref(addOnName: string): string | null {
    if (!/visa/i.test(addOnName)) return null;
    const match = matchCountryFuzzy(visaCountries, addOnName);
    return match ? `/visa/${visaSlug(match.en)}` : "/visa";
  }

  // Add-on WAJIB praktis harus dibeli peserta → dilipat ke total harga awal.
  const basePrice = tour.promoPrice ?? tour.price;
  const mandatoryAddOns = addOns.filter((a) => a.tag === "wajib");
  const optionalAddOns = addOns.filter((a) => a.tag !== "wajib");
  const mandatoryTotal = mandatoryAddOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const startingTotal = basePrice + mandatoryTotal;

  const greeting = companyName ? `Halo ${companyName}` : "Halo";
  const waMessage = encodeURIComponent(
    `${greeting}, saya tertarik dengan paket *${tour.title}*. Mohon informasi lebih lanjut.` +
      (mandatoryTotal > 0
        ? `\n\nRincian harga:\n• Paket: ${formatCurrency(basePrice)}` +
          mandatoryAddOns.map((a) => `\n• ${a.name} (wajib): ${formatCurrency(a.price)}`).join("") +
          `\n• Estimasi total: ${formatCurrency(startingTotal)} / orang`
        : "")
  );

  // Ringkasan plain-text untuk catatan lead (Lead Masuk di CMS)
  const waSummary =
    mandatoryTotal > 0
      ? `Paket: ${formatCurrency(basePrice)}` +
        mandatoryAddOns.map((a) => ` · ${a.name} (wajib): ${formatCurrency(a.price)}`).join("") +
        ` · Estimasi total: ${formatCurrency(startingTotal)}/orang`
      : `Harga paket: ${formatCurrency(basePrice)}/orang`;

  const secTitle = isOutlined
    ? "text-2xl font-black flex items-center gap-2"
    : "text-xl font-bold text-gray-900 dark:text-white";

  const pixelGridStyle = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isAtlas ? {
    backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)",
    backgroundSize: "32px 32px",
  } : {};

  /* Helper: icon+label for sidebar rows (outlined themes) */
  const sidebarLabel = (icon: React.ReactNode, label: string) =>
    isOutlined ? (
      <span className="flex items-center gap-1.5">{icon}{label}</span>
    ) : label;

  /* ── #4: JSON-LD TouristTrip schema ──────────────────────────── */
  const tourJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.description ?? tour.notes ?? tour.visaInfo ?? undefined,
    image: tour.heroImg ? [tour.heroImg] : undefined,
    ...(tour.tripDate ? { startDate: tour.tripDate.toISOString() } : {}),
    ...(tour.duration ? { duration: tour.duration } : {}),
    offers: {
      "@type": "Offer",
      price: String(tour.promoPrice ?? tour.price),
      priceCurrency: "IDR",
      availability:
        tour.status === "FULL"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url: `${siteUrl}/tours/${tour.slug ?? tour.id}`,
    },
    provider: {
      "@type": "Organization",
      name: companyName,
      url: siteUrl,
    },
  };

  /* ── Product schema dgn AggregateRating + Review (HANYA jika ada ulasan asli).
       TouristTrip tidak memunculkan bintang di Google; Product didukung.
       Rating dihitung dari testimoni nyata yang terikat ke tour ini. ── */
  const productJsonLd = reviewCount > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tour.title,
    description: (tour.description || tour.notes || tour.visaInfo || `Paket tour ${tour.country}`).trim(),
    ...(tour.heroImg ? { image: [tour.heroImg] } : {}),
    brand: { "@type": "Brand", name: companyName || "Sundaf Trip" },
    // offers hanya disertakan kalau harga valid (>0). Harga 0 (trip lama) bikin
    // "Rp 0" & warning Merchant listing, review snippet tidak butuh offers.
    ...((tour.promoPrice ?? tour.price) > 0 ? {
      offers: {
        "@type": "Offer",
        price: String(tour.promoPrice ?? tour.price),
        priceCurrency: "IDR",
        availability: (isExpired || tour.status === "FULL") ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        url: `${siteUrl}/tours/${tour.slug ?? tour.id}`,
      },
    } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      reviewCount: String(reviewCount),
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
      reviewBody: r.content,
      datePublished: r.createdAt.toISOString().slice(0, 10),
    })),
  } : null;

  return (
    <div className="min-h-screen pt-16" style={isOutlined ? { backgroundColor: tBg, ...pixelGridStyle } : undefined}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourJsonLd) }}
      />
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {/* Hero */}
      <div className={`relative h-80 lg:h-[480px] ${!tour.heroImg && !isOutlined ? "bg-gray-900 dark:bg-gray-950" : ""} ${isOutlined && !tour.heroImg ? "border-b-2" : ""}`}
        style={isOutlined && !tour.heroImg ? { borderColor: tBdr } : undefined}>
        {tour.heroImg && (
          <Image src={tour.heroImg} alt={tour.title} fill className="object-cover" priority />
        )}
        {/* Cinematic overlay: dark vignette top + strong bottom ramp */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.08) 100%)" }} />
        {/* Extra side vignette */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.30) 0%, transparent 50%, rgba(0,0,0,0.18) 100%)" }} />

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 max-w-7xl mx-auto">
          {tour.badge && (
            <span className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 border border-white/20 text-white/90"
              style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}>
              {tour.badge}
            </span>
          )}

          {/* Hero title, plain white, readable on any tour photo */}
          <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-4 tracking-tight text-white drop-shadow-lg">
            {tour.title}
          </h1>

          {/* Info pills, frosted glass style, consistent across all themes */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { icon: <MapPin size={11} />, text: `${tour.country}${tour.cityHighlight ? ` · ${tour.cityHighlight}` : ""}` },
              tour.duration  ? { icon: <Clock    size={11} />, text: tour.duration } : null,
              tour.tripDate  ? { icon: <Calendar size={11} />, text: formatDate(tour.tripDate) } : null,
              { icon: <Users size={11} />, text: `${tour.seatsLeft} seat tersisa` },
            ].filter(Boolean).map((pill, i) => (
              <span key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/90 border border-white/20"
                style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(12px)" }}>
                {(pill as { icon: React.ReactNode; text: string }).icon}
                {(pill as { icon: React.ReactNode; text: string }).text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/tours"
          className={`inline-flex items-center gap-1 text-sm mb-8 transition ${isOutlined ? `${pfx}-pill font-black` : "text-gray-500 hover:text-blue-600"}`}
          style={isOutlined ? { background: tCard, color: tText } : undefined}>
          <ArrowLeft size={16} /> Kembali ke Daftar Tour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Deskripsi Tour, evocative copy, paragraf + bonus/optional */}
            {tour.description && (
              <div>
                <div className={`text-[15px] lg:text-[16px] leading-relaxed whitespace-pre-line ${isOutlined ? "" : "text-gray-700 dark:text-gray-300"}`}
                  style={isOutlined ? { color: tSub } : undefined}>
                  {tour.description}
                </div>
              </div>
            )}

            {/* Gallery */}
            {tour.gallery.length > 0 && (
              <div>
                <h2 className={`${secTitle} mb-4`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <Camera size={18} />} Galeri
                </h2>
                <GalleryZoom images={tour.gallery} />
              </div>
            )}

            {/* Itinerary — tampil lebih dulu, bisa dilipat & di-extend */}
            {itinerary.length > 0 && (
              <div>
                <h2 className={`${secTitle} mb-6`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <Route size={18} />} Itinerary
                </h2>

                {isAtlas ? (
                  /* Atlas: clean vertical timeline, black & white */
                  <ItineraryFold count={itinerary.length} accent="var(--at-text)">
                    <div className="space-y-0">
                      {itinerary.map((item, idx) => (
                        <div key={item.day} className="flex gap-5">
                          <div className="flex flex-col items-center">
                            <div
                              className="w-9 h-9 rounded-full border bg-white dark:bg-[#111] text-xs font-bold flex items-center justify-center shrink-0"
                              style={{ borderColor: "var(--at-border)", color: "var(--at-text)" }}
                            >
                              {String(item.day).padStart(2, "0")}
                            </div>
                            {idx < itinerary.length - 1 && (
                              <div className="w-px flex-1 bg-black/10 dark:bg-white/10 my-1 min-h-8" />
                            )}
                          </div>
                          <div className="pb-8 pt-1.5 flex-1">
                            <h3 className="font-semibold text-sm" style={{ color: "var(--at-text)" }}>{item.title}</h3>
                            {item.description && (
                              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ItineraryFold>
                ) : isOutlined ? (
                  /* Other outlined themes: card + pill badge */
                  <ItineraryFold count={itinerary.length} accent="var(--site-accent)">
                    <div className="space-y-3">
                      {itinerary.map((item) => (
                        <div key={item.day} className={`flex gap-4 ${pfx}-card p-4`}>
                          <span className={`${pfx}-pill shrink-0`} style={{ background: tMint, color: tText }}>Hari {item.day}</span>
                          <div>
                            <h3 className="font-black" style={{ color: tText }}>{item.title}</h3>
                            {item.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ItineraryFold>
                ) : (
                  /* Classic: blue circle + vertical line */
                  <ItineraryFold count={itinerary.length}>
                    <div className="space-y-3">
                      {itinerary.map((item) => (
                        <div key={item.day} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                              {item.day}
                            </span>
                            <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
                          </div>
                          <div className="pb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                            {item.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ItineraryFold>
                )}
              </div>
            )}

            {/* Inclusions & Exclusions — berdampingan termasuk di mobile */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {tour.inclusions.length > 0 && (
                <div className={isOutlined ? `${pfx}-card p-5` : ""}>
                  <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                    Sudah Termasuk
                  </h2>
                  <ul className="space-y-2">
                    {tour.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tour.exclusions.length > 0 && (
                <div className={isOutlined ? `${pfx}-card p-5` : ""}>
                  <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                    Tidak Termasuk
                  </h2>
                  <ul className="space-y-2">
                    {tour.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Hotel */}
            {hotelInfo && Object.keys(hotelInfo).length > 0 && (
              <div>
                <h2 className={`${secTitle} mb-4`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <Building2 size={18} />} Hotel
                </h2>
                <div className={isOutlined ? `${pfx}-card p-4` : "bg-gray-50 dark:bg-gray-800 rounded-xl p-4"}>
                  {Object.entries(hotelInfo).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0 text-sm">
                      <span className="text-gray-500 capitalize">{k}</span>
                      <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                        style={isOutlined ? { color: tText } : undefined}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visa Info */}
            {tour.visaInfo && (
              <div>
                <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <FileText size={18} />} Informasi Visa
                </h2>
                <p className={`text-sm leading-relaxed p-4 ${isOutlined ? `${pfx}-card` : "text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl"}`}
                  style={isOutlined ? { color: tSub } : undefined}>
                  {tour.visaInfo}
                </p>
              </div>
            )}

            {/* Notes */}
            {tour.notes && (
              <div>
                <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <ClipboardList size={18} />} Catatan Penting
                </h2>
                <p className={`text-sm leading-relaxed p-4 ${isOutlined ? `${pfx}-card` : "text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"}`}
                  style={isOutlined ? { background: tSun, color: tSub } : undefined}>
                  {tour.notes}
                </p>
              </div>
            )}

          </div>

          {/* Sidebar Booking */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className={isOutlined ? `${pfx}-card p-6` : "bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"}>
              {/* Price */}
              <div className="mb-5">
                {isOutlined ? (
                  <div className="mb-3">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Harga per orang</p>
                    <span className={`${pfx}-pill font-black`} style={{ background: tMint, color: tText, fontSize: "1.5rem", padding: "8px 20px" }}>
                      {formatCurrency(tour.promoPrice ?? tour.price)}
                    </span>
                    {tour.promoPrice && (
                      <p className="text-sm text-gray-400 line-through mt-2">{formatCurrency(tour.price)}</p>
                    )}
                    {tour.priceLandTour && (
                      <p className="text-xs mt-1">
                        <span className={`${pfx}-pill`} style={{ background: tSun, color: tText }}>Land Tour: {formatCurrency(tour.priceLandTour)}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">Harga per orang</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(tour.promoPrice ?? tour.price)}</p>
                    {tour.promoPrice && <p className="text-sm text-gray-400 line-through">{formatCurrency(tour.price)}</p>}
                    {tour.priceLandTour && <p className="text-xs text-gray-500 mt-1">Land Tour: {formatCurrency(tour.priceLandTour)}</p>}
                  </div>
                )}
              </div>

              {/* Rincian wajib — add-on WAJIB ikut total */}
              {mandatoryTotal > 0 && (
                <div className={`mb-5 -mt-1 p-3 text-xs rounded-xl ${isOutlined ? `${pfx}-card` : "bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700"}`}
                  style={isOutlined ? { background: tCard } : undefined}>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Paket</span>
                    <span>{formatCurrency(basePrice)}</span>
                  </div>
                  {mandatoryAddOns.map((a) => (
                    <div key={a.name} className="flex justify-between items-center gap-2 mt-1 text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="break-words">{a.name}</span>
                        <span className="shrink-0 px-1 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white">WAJIB</span>
                      </span>
                      <span className="shrink-0">+{formatCurrency(a.price)}</span>
                    </div>
                  ))}
                  <div className={`flex justify-between mt-2 pt-2 font-black text-gray-900 dark:text-white ${isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-200 dark:border-gray-700"}`}
                    style={isOutlined ? { borderColor: tBdr } : undefined}>
                    <span>Total mulai</span>
                    <span>{formatCurrency(startingTotal)}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">Sudah termasuk item wajib di atas, per orang.</p>
                </div>
              )}

              {/* CTA */}
              {isExpired ? (
                <div className={`w-full py-3 text-center font-black mb-3 flex items-center justify-center gap-2 ${isOutlined ? `${pfx}-card` : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-xl"}`}
                  style={isOutlined ? { background: tCard, color: tSub } : undefined}>
                  <CheckCircle size={16} /> Trip Selesai
                </div>
              ) : tour.status === "FULL" ? (
                <div className={`w-full py-3 text-center font-black mb-3 flex items-center justify-center gap-2 ${isOutlined ? `${pfx}-card` : "bg-red-100 text-red-700 rounded-xl"}`}
                  style={isOutlined ? { background: "#fee2e2", color: "#991b1b" } : undefined}>
                  <Ban size={16} /> FULLY BOOKED
                </div>
              ) : (
                <TourBookingCTA
                  waHref={`https://wa.me/${waNumber}?text=${waMessage}`}
                  destination={tour.title}
                  summary={waSummary}
                  buttonClassName={`w-full flex items-center justify-center gap-2 py-3 font-black mb-3 transition disabled:opacity-60 ${isOutlined ? `${pfx}-btn` : "bg-green-500 hover:bg-green-600 text-white rounded-xl"}`}
                  buttonStyle={isOutlined ? { background: "var(--site-accent)", color: "#fff", justifyContent: "center" } : undefined}
                />
              )}

              {/* Download itinerary PDF */}
              <a href={`/tours/${tour.id}/pdf`}
                className={`w-full flex items-center justify-center gap-2 py-3 font-bold mb-3 transition ${isOutlined ? `${pfx}-card` : "border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"}`}
                style={isOutlined ? { background: tCard, color: tText } : undefined}>
                <Download size={16} /> Unduh Itinerary PDF
              </a>

              <div className="text-xs text-center mb-5 font-black text-gray-400">
                Konsultasi gratis · Tanpa biaya tambahan
              </div>

              {/* Tour details grid */}
              <div className={`space-y-2 text-sm pt-4 ${isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-100 dark:border-gray-800"}`}
                style={isOutlined ? { borderColor: tBdr } : undefined}>
                {tour.tripDate && (
                  <div className="flex justify-between">
                    <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                      {sidebarLabel(<Plane size={12} />, "Keberangkatan")}
                    </span>
                    <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                      style={isOutlined ? { color: tText } : undefined}>{formatDate(tour.tripDate)}</span>
                  </div>
                )}
                {tour.duration && (
                  <div className="flex justify-between">
                    <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                      {sidebarLabel(<Clock size={12} />, "Durasi")}
                    </span>
                    <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                      style={isOutlined ? { color: tText } : undefined}>{tour.duration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                    {sidebarLabel(<Users size={12} />, "Sisa Seat")}
                  </span>
                  <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                    style={isOutlined ? { color: tText } : undefined}>{tour.seatsLeft}</span>
                </div>
              </div>

              {/* Add Ons — hanya yang opsional (WAJIB sudah dilipat ke Total mulai di atas) */}
              {optionalAddOns.length > 0 && (
                <div className={`mt-4 pt-4 ${isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-100 dark:border-gray-800"}`}
                  style={isOutlined ? { borderColor: tBdr } : undefined}>
                  <p className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isOutlined ? "font-black" : "font-semibold text-gray-500"}`}
                    style={isOutlined ? { color: tSub } : undefined}>
                    {isOutlined && <Package size={12} />} Add Ons <span className="font-normal normal-case tracking-normal text-gray-400">(opsional)</span>
                  </p>
                  <div className="space-y-2">
                    {optionalAddOns.map((item) => (
                      <div key={item.name} className="text-xs">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 min-w-0">
                            <span className="break-words">{item.name}</span>
                            {item.tag === "recommended" && (
                              <span className="flag-wave shrink-0 -translate-y-1 px-1 py-0.5 text-[6px] font-bold leading-none tracking-tight text-white">REKOMENDASI</span>
                            )}
                          </span>
                          <span className={`shrink-0 font-${isTropical ? "black" : "medium"} text-gray-900 dark:text-white`}>+{formatCurrency(item.price)}</span>
                        </div>
                        {item.desc && (
                          <p className="mt-0.5 text-[11px] leading-snug text-gray-400 dark:text-gray-500 break-words">{item.desc}</p>
                        )}
                        {resolveVisaHref(item.name) && (
                          <>
                            <p className="mt-0.5 text-[11px] leading-snug text-emerald-600 dark:text-emerald-400 break-words">
                              Harga bundling paket — lebih hemat dari urus visa terpisah.
                            </p>
                            <Link href={resolveVisaHref(item.name)!}
                              className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                              Bisa dibantu — cek info visa
                              <ArrowRight size={11} />
                            </Link>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <TourShareButtons
                tourTitle={tour.title}
                isOutlined={isOutlined}
                isAtlas={isAtlas}
                pfx={pfx}
                tText={tText}
                tCard={tCard}
                tBdr={tBdr}
                tSub={tSub}
                tMint={tMint}
              />
            </div>
          </div>
        </div>

        {/* Ulasan Peserta — full-width, paling bawah (setelah card harga) */}
        {reviewCount > 0 && (
          <div className="mt-12">
            <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
              {isOutlined && <Star size={18} />} Ulasan Peserta
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold" style={isOutlined ? { color: tText } : undefined}>{ratingValue.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(ratingValue) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"} />
                ))}
              </div>
              <span className="text-sm text-gray-400">({reviewCount} ulasan)</span>
            </div>
            {/* Mobile: carousel peek (~73% + 25% intip kartu berikutnya). Tablet/desktop: grid. */}
            <div className="no-scrollbar flex sm:grid snap-x snap-mandatory overflow-x-auto sm:overflow-visible gap-3 sm:grid-cols-2 lg:grid-cols-3 -mx-4 px-4 sm:mx-0 sm:px-0 pb-3 sm:pb-0">
              {reviews.map((r) => (
                <div key={r.id} className={`min-w-[80%] snap-start sm:min-w-0 ${isOutlined ? `${pfx}-card p-4` : "bg-gray-50 dark:bg-gray-800 rounded-xl p-4"}`}>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"} />
                    ))}
                  </div>
                  <p className={`text-sm leading-relaxed ${isOutlined ? "" : "text-gray-600 dark:text-gray-300"}`} style={isOutlined ? { color: tSub } : undefined}>
                    &ldquo;{r.content}&rdquo;
                  </p>
                  <p className={`text-xs font-semibold mt-2 ${isOutlined ? "" : "text-gray-900 dark:text-white"}`} style={isOutlined ? { color: tText } : undefined}>
                    {r.name}{r.role ? <span className="font-normal text-gray-400"> · {r.role}</span> : null}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
