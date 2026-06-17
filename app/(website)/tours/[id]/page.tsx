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
  Utensils, Hotel, TrainFront, Ship, Bus, Car,
} from "lucide-react";
import { formatCurrency, formatDate, toWaNumber } from "@/lib/utils";
import { visaSlug, matchCountryFuzzy } from "@/lib/visa-slug";
import GalleryZoom from "@/components/website/GalleryZoom";
import ItineraryFold from "@/components/website/ItineraryFold";
import TourShareButtons from "@/components/website/TourShareButtons";
import TourBookingCTA from "@/components/website/TourBookingCTA";
import TourCard from "@/components/website/TourCard";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { localizePdfText } from "@/lib/itinerary-pdf-localization";
import { buildItineraryDisplay, type ItineraryInsight } from "@/lib/itinerary-insights";
import { stripLooseItineraryMarkup } from "@/lib/itinerary-markup";
import { buildTourPaymentPlan } from "@/lib/tour-payment-plan";

// Fallback ke domain produksi, bukan localhost — kalau env hilang saat build,
// canonical/OG/JSON-LD jangan sampai menunjuk localhost.
const siteUrl = process.env.NEXTAUTH_URL ?? "https://sundaftrip.com";

function cleanMetadataText(value?: string | null) {
  const localized = localizePdfText(value);
  const text = typeof localized === "string" ? localized : value ?? "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function firstMetadataText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const text = cleanMetadataText(value);
    if (text) return text;
  }
  return "";
}

function truncateMetadataText(text: string, maxLength = 165) {
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, maxLength - 1).replace(/\s+\S*$/, "").replace(/[,.:\s]+$/, "");
  return `${shortened}.`;
}

function buildTourMetadataDescription(tour: {
  title: string;
  country: string;
  cityHighlight?: string | null;
  duration?: string | null;
  description?: string | null;
  notes?: string | null;
  visaInfo?: string | null;
  price: number;
  promoPrice?: number | null;
  tripDate?: Date | null;
  status?: string;
}, companyName: string) {
  const explicitDescription = firstMetadataText(tour.description, tour.notes, tour.visaInfo);
  if (explicitDescription) return truncateMetadataText(explicitDescription);

  const title = cleanMetadataText(tour.title) || tour.title;
  const country = cleanMetadataText(tour.country) || tour.country;
  const city = cleanMetadataText(tour.cityHighlight);
  const duration = cleanMetadataText(tour.duration);
  const route = [country, city].filter(Boolean).join(" - ");
  const price = Number(tour.promoPrice ?? tour.price);
  const isPastTrip = !!tour.tripDate && tour.tripDate.getTime() < Date.now();
  const pricePart = price > 0 ? `mulai ${formatCurrency(price)}/orang` : "";
  const datePart = tour.tripDate
    ? `${isPastTrip ? "arsip keberangkatan" : "berangkat"} ${formatDate(tour.tripDate)}`
    : tour.status === "ACTIVE"
      ? "tanggal fleksibel"
      : "";
  const facts = [duration, datePart, isPastTrip ? "" : pricePart].filter(Boolean).join(", ");
  const pageKind = isPastTrip ? "dokumentasi paket tour" : "paket tour";

  return truncateMetadataText(
    `${title}: ${pageKind} ${route || country} bersama ${companyName || "Sundaf Trip"}${facts ? ` (${facts})` : ""}.`
  );
}

function itineraryInsightIcon(insight: ItineraryInsight) {
  if (insight.kind === "meals") return <Utensils size={16} />;
  if (insight.kind === "stay") return <Hotel size={16} />;
  if (insight.kind === "time") return <Clock size={16} />;
  if (insight.kind === "distance" || insight.kind === "ascent") return <Route size={16} />;

  if (insight.value.includes("Penerbangan")) return <Plane size={16} />;
  if (insight.value.includes("Kereta")) return <TrainFront size={16} />;
  if (insight.value.includes("Bus")) return <Bus size={16} />;
  if (insight.value.includes("Kapal")) return <Ship size={16} />;
  return <Car size={16} />;
}

function ItineraryInsightGrid({
  insights,
  isOutlined,
  tBdr,
  tSub,
  tText,
}: {
  insights: ItineraryInsight[];
  isOutlined: boolean;
  tBdr?: string;
  tSub?: string;
  tText?: string;
}) {
  if (insights.length === 0) return null;

  return (
    <div
      className={`mt-4 grid grid-cols-1 gap-x-5 gap-y-3 border-t pt-4 sm:grid-cols-2 ${isOutlined ? "border-dashed" : "border-gray-100 dark:border-gray-800"}`}
      style={isOutlined ? { borderColor: tBdr } : undefined}
    >
      {insights.map((insight) => (
        <div key={`${insight.kind}-${insight.value}`} className="flex min-w-0 items-start gap-2.5">
          <span
            className={`mt-0.5 shrink-0 ${isOutlined ? "" : "text-blue-600 dark:text-blue-400"}`}
            style={isOutlined ? { color: "var(--site-accent)" } : undefined}
          >
            {itineraryInsightIcon(insight)}
          </span>
          <span className="min-w-0">
            <span
              className="block text-[11px] font-semibold leading-none text-gray-400"
              style={isOutlined ? { color: tSub } : undefined}
            >
              {insight.label}
            </span>
            <span
              className="mt-1 block break-words text-sm font-semibold leading-snug text-gray-900 dark:text-white"
              style={isOutlined ? { color: tText } : undefined}
            >
              {insight.value}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function renderItineraryInline(
  text: string,
  {
    strongStyle,
    markStyle,
  }: {
    strongStyle?: React.CSSProperties;
    markStyle?: React.CSSProperties;
  },
) {
  const markerPattern = /(^|[\s([{])(\*{1,3})\s*([^*\n][^*\n]*?)\s*\2(?=$|[\s.,;:!?)}\]])/g;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  const renderMarked = (marker: string, content: string, key: string) => {
    if (marker.length === 1) {
      return (
        <mark key={key} className="px-0.5 font-medium" style={markStyle}>
          {content}
        </mark>
      );
    }

    if (marker.length === 2) {
      return (
        <strong key={key} className="font-semibold" style={strongStyle}>
          {content}
        </strong>
      );
    }

    return (
      <mark key={key} className="px-0.5 font-semibold" style={markStyle}>
        {content}
      </mark>
    );
  };

  const pushPlain = (value: string) => {
    const cleaned = stripLooseItineraryMarkup(value);
    if (cleaned) nodes.push(cleaned);
  };

  const looseOpening = text.match(/^\s*(\*{2,3})\s+(.+)$/);
  if (looseOpening) {
    const content = stripLooseItineraryMarkup(looseOpening[2] ?? "").trim();
    return content ? [renderMarked(looseOpening[1] ?? "", content, "loose-opening")] : [];
  }

  for (const match of text.matchAll(markerPattern)) {
    const matchIndex = match.index ?? 0;
    const prefix = match[1] ?? "";
    const marker = match[2] ?? "";
    const content = stripLooseItineraryMarkup(match[3] ?? "").trim();
    const markerStart = matchIndex + prefix.length;

    pushPlain(text.slice(cursor, markerStart));

    if (content) {
      nodes.push(renderMarked(marker, content, `marker-${index}`));
    }

    cursor = matchIndex + match[0].length;
    index += 1;
  }

  pushPlain(text.slice(cursor));
  return nodes;
}

function ItineraryRichText({
  text,
  className,
  style,
  strongStyle,
  markStyle,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  strongStyle?: React.CSSProperties;
  markStyle?: React.CSSProperties;
}) {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className={className} style={style}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 32)}-${index}`}>
          {renderItineraryInline(paragraph, { strongStyle, markStyle })}
        </p>
      ))}
    </div>
  );
}

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
      select: {
        id: true,
        slug: true,
        title: true,
        heroImg: true,
        description: true,
        notes: true,
        visaInfo: true,
        country: true,
        cityHighlight: true,
        duration: true,
        price: true,
        promoPrice: true,
        tripDate: true,
        status: true,
      },
    }),
    prisma.companyInfo.findFirst({ where: { key: "company_name" } }),
  ]);
  if (!tour) return {};

  const companyName = companyRow?.value ?? "Sundaftrip";
  const title = localizePdfText(tour.title) ?? tour.title;
  const description = buildTourMetadataDescription(tour, companyName);

  const canonicalPath = `/tours/${tour.slug ?? tour.id}`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}${canonicalPath}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonicalPath}`,
      type: "website",
      siteName: companyName,
      ...(tour.heroImg ? { images: [{ url: tour.heroImg, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
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
  const [companyRows, reviews, visaCountries, relatedRaw] = await Promise.all([
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "company_name", "site_theme"] } } }),
    prisma.testimonial.findMany({
      where: { tourId: tour.id, published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.countryVisa.findMany({ select: { name: true, en: true } }),
    // P1.3 internal linking: tour upcoming bookable lain (untuk "Tour Lainnya").
    // Khususnya berharga di halaman trip selesai → arahkan user ke yang masih bisa dipesan.
    prisma.tour.findMany({
      where: {
        id: { not: tour.id },
        status: { in: ["ACTIVE", "FULL"] },
        OR: [{ tripDate: { gte: new Date() } }, { tripDate: null }],
      },
      orderBy: { tripDate: "asc" },
      take: 6,
      select: {
        id: true, slug: true, title: true, country: true, cityHighlight: true,
        price: true, promoPrice: true, seatsLeft: true, tripDate: true,
        duration: true, heroImg: true, badge: true, status: true,
        notes: true, description: true,
      },
    }),
  ]);

  // Prioritaskan tour negara yang sama, lalu lengkapi dengan lainnya. Maks 3.
  const relatedTours = [
    ...relatedRaw.filter((t) => t.country === tour.country),
    ...relatedRaw.filter((t) => t.country !== tour.country),
  ].slice(0, 3);

  // Agregat rating dari ulasan ASLI tour ini (dasar AggregateRating JSON-LD).
  const reviewCount = reviews.length;
  const ratingValue = reviewCount
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
    : 0;

  const now = new Date();
  // Trip yang tanggalnya sudah lewat TIDAK lagi dialihkan, tetap dibuka dalam
  // mode "Trip Selesai" (read-only) supaya ulasan + rating tetap tampil & terindeks.
  const isExpired = !!tour.tripDate && tour.tripDate < now;
  const isFlexibleDate = !tour.tripDate && tour.status === "ACTIVE";
  const departureLabel = tour.tripDate ? formatDate(tour.tripDate) : isFlexibleDate ? "Tanggal fleksibel" : null;
  const capacityLabel = isFlexibleDate
    ? "Privat / sesuai permintaan"
    : tour.seatsLeft > 0
      ? `${tour.seatsLeft} seat tersisa`
      : "Sesuai permintaan";

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
  const itineraryStrongStyle: React.CSSProperties | undefined = isOutlined && tText ? { color: tText } : undefined;
  const itineraryMarkStyle: React.CSSProperties = {
    backgroundColor: "#fde68a",
    color: "#1f2937",
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
  };

  const rawItinerary = (tour.itinerary as { day: number; title: string; description: string }[] | null) ?? [];
  const rawAddOns = (tour.addOns as { name: string; price: number; tag?: "" | "wajib" | "recommended"; desc?: string }[] | null) ?? [];
  const hotelInfo = tour.hotel as Record<string, string> | null;
  const displayTitle = localizePdfText(tour.title) ?? tour.title;
  const displayCountry = localizePdfText(tour.country) ?? tour.country;
  const displayCityHighlight = localizePdfText(tour.cityHighlight);
  const displayDuration = localizePdfText(tour.duration);
  const displayDescription = localizePdfText(tour.description);
  const displayVisaInfo = localizePdfText(tour.visaInfo);
  const displayNotes = localizePdfText(tour.notes);
  const displayBadge = localizePdfText(tour.badge);
  const displayInclusions = tour.inclusions.map((item) => localizePdfText(item) ?? item);
  const displayExclusions = tour.exclusions.map((item) => localizePdfText(item) ?? item);
  const itinerary = rawItinerary.map((item) => ({
    ...item,
    title: localizePdfText(item.title) ?? item.title,
    description: localizePdfText(item.description) ?? item.description,
  })).map(buildItineraryDisplay);
  const addOns = rawAddOns.map((item) => ({
    ...item,
    name: localizePdfText(item.name) ?? item.name,
    desc: localizePdfText(item.desc) ?? item.desc,
  }));
  const displayRelatedTours = relatedTours.map((item) => ({
    ...item,
    title: localizePdfText(item.title) ?? item.title,
    country: localizePdfText(item.country) ?? item.country,
    cityHighlight: localizePdfText(item.cityHighlight),
    duration: localizePdfText(item.duration),
    notes: localizePdfText(item.notes),
    description: localizePdfText(item.description),
    badge: localizePdfText(item.badge),
  }));

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
  const paymentPlan = tour.status === "ACTIVE" && !isExpired
    ? buildTourPaymentPlan({
        totalAmount: startingTotal,
        departureDate: tour.tripDate,
        seatsLeft: tour.seatsLeft,
        paymentPlanConfig: tour.paymentPlan,
      })
    : null;

  const greeting = companyName ? `Halo ${companyName}` : "Halo";
  // P2.2: sisipkan tanggal keberangkatan ke prefill biar lead lebih kualified
  // (hanya untuk trip yang belum lewat — tanggal lampau tak relevan).
  const departureInfo = departureLabel && !isExpired ? ` (keberangkatan ${departureLabel})` : "";
  const waMessage = encodeURIComponent(
    `${greeting}, saya tertarik dengan paket *${displayTitle}*${departureInfo}. Mohon informasi lebih lanjut.` +
      (mandatoryTotal > 0
        ? `\n\nRincian harga:\n• Paket: ${formatCurrency(basePrice)}` +
          mandatoryAddOns.map((a) => `\n• ${a.name} (wajib): ${formatCurrency(a.price)}`).join("") +
          `\n• Estimasi total: ${formatCurrency(startingTotal)} / orang`
        : "")
  );
  const bookingWaHref = `https://wa.me/${waNumber}?text=${waMessage}`;

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
  // schema.org Duration wajib ISO 8601: "9 hari 7 malam" → "P9D".
  // Konversi HANYA untuk JSON-LD, teks UI tetap pakai string asli.
  // Kalau angka sebelum "hari" tak ketemu, duration di-skip (string bebas invalid).
  const durationDays = displayDuration?.match(/(\d+)\s*hari/i)?.[1];
  const isoDuration = durationDays ? `P${durationDays}D` : null;
  const tourJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: displayTitle,
    description: displayDescription ?? displayNotes ?? displayVisaInfo ?? undefined,
    image: tour.heroImg ? [tour.heroImg] : undefined,
    ...(tour.tripDate ? { startDate: tour.tripDate.toISOString() } : {}),
    ...(isoDuration ? { duration: isoDuration } : {}),
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
    name: displayTitle,
    description: (displayDescription || displayNotes || displayVisaInfo || `Paket tour ${displayCountry}`).trim(),
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
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Paket Tour", url: "/tours" },
          { name: displayTitle, url: `/tours/${tour.slug ?? tour.id}` },
        ]}
      />
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
          <Image src={tour.heroImg} alt={displayTitle} fill className="object-cover" priority />
        )}
        {/* Cinematic overlay: dark vignette top + strong bottom ramp */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.08) 100%)" }} />
        {/* Extra side vignette */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.30) 0%, transparent 50%, rgba(0,0,0,0.18) 100%)" }} />

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 max-w-7xl mx-auto">
          {displayBadge && (
            <span className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 border border-white/20 text-white/90"
              style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)" }}>
              {displayBadge}
            </span>
          )}

          {/* Hero title with Sundaf yellow highlighter and teal anchor */}
          <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-4 tracking-tight text-white drop-shadow-lg">
            <span className="sundaf-title-stabilo">{displayTitle}</span>
          </h1>

          {/* Info pills, frosted glass style, consistent across all themes */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { icon: <MapPin size={11} />, text: `${displayCountry}${displayCityHighlight ? ` · ${displayCityHighlight}` : ""}` },
              displayDuration  ? { icon: <Clock    size={11} />, text: displayDuration } : null,
              departureLabel ? { icon: <Calendar size={11} />, text: departureLabel } : null,
              { icon: <Users size={11} />, text: capacityLabel },
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
            {displayDescription && (
              <div>
                <div className={`text-[15px] lg:text-[16px] leading-relaxed whitespace-pre-line ${isOutlined ? "" : "text-gray-700 dark:text-gray-300"}`}
                  style={isOutlined ? { color: tSub } : undefined}>
                  {displayDescription}
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
                  {isOutlined && <Route size={18} />} Rencana Perjalanan
                </h2>

                {isAtlas ? (
                  /* Atlas: clean vertical timeline, black & white */
                  <ItineraryFold count={itinerary.length} accent="var(--at-text)">
                    <div className="space-y-0">
                      {itinerary.map((item, idx) => (
                        <div key={`${item.day}-${idx}`} className="flex gap-5">
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
                              <ItineraryRichText
                                text={item.description}
                                className="mt-2 space-y-3 text-sm leading-relaxed"
                                style={{ color: "var(--at-subtext)" }}
                                strongStyle={{ color: "var(--at-text)" }}
                                markStyle={itineraryMarkStyle}
                              />
                            )}
                            <ItineraryInsightGrid
                              insights={item.insights}
                              isOutlined={isOutlined}
                              tBdr={tBdr}
                              tSub={tSub}
                              tText={tText}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ItineraryFold>
                ) : isOutlined ? (
                  /* Other outlined themes: card + pill badge */
                  <ItineraryFold count={itinerary.length} accent="var(--site-accent)">
                    <div className="space-y-3">
                      {itinerary.map((item, idx) => (
                        <div key={`${item.day}-${idx}`} className={`flex gap-4 ${pfx}-card p-4`}>
                          <span className={`${pfx}-pill shrink-0`} style={{ background: tMint, color: tText }}>Hari {item.day}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black" style={{ color: tText }}>{item.title}</h3>
                            {item.description && (
                              <ItineraryRichText
                                text={item.description}
                                className="mt-2 space-y-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400"
                                style={isOutlined ? { color: tSub } : undefined}
                                strongStyle={itineraryStrongStyle}
                                markStyle={itineraryMarkStyle}
                              />
                            )}
                            <ItineraryInsightGrid
                              insights={item.insights}
                              isOutlined={isOutlined}
                              tBdr={tBdr}
                              tSub={tSub}
                              tText={tText}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ItineraryFold>
                ) : (
                  /* Classic: blue circle + vertical line */
                  <ItineraryFold count={itinerary.length}>
                    <div className="space-y-3">
                      {itinerary.map((item, idx) => (
                        <div key={`${item.day}-${idx}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                              {item.day}
                            </span>
                            <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />
                          </div>
                          <div className="min-w-0 flex-1 pb-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                            {item.description && (
                              <ItineraryRichText
                                text={item.description}
                                className="mt-2 space-y-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400"
                                markStyle={itineraryMarkStyle}
                              />
                            )}
                            <ItineraryInsightGrid
                              insights={item.insights}
                              isOutlined={isOutlined}
                              tBdr={tBdr}
                              tSub={tSub}
                              tText={tText}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ItineraryFold>
                )}
              </div>
            )}

            {/* Inclusions & Exclusions */}
            {(displayInclusions.length > 0 || displayExclusions.length > 0) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                {displayInclusions.length > 0 && (
                  <div className={isOutlined ? `${pfx}-card p-4 sm:p-5` : "rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"}>
                    <div className="mb-3">
                      <h2
                        className="min-w-0 text-[15px] font-black leading-tight text-gray-900 dark:text-white sm:text-lg"
                        style={isOutlined ? { color: tText } : undefined}
                      >
                        Sudah Termasuk
                      </h2>
                    </div>
                    <ul className="space-y-2">
                      {displayInclusions.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-[13px] leading-snug text-gray-600 dark:text-gray-400 sm:text-sm"
                          style={isOutlined ? { color: tSub } : undefined}
                        >
                          <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                          <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {displayExclusions.length > 0 && (
                  <div className={isOutlined ? `${pfx}-card p-4 sm:p-5` : "rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"}>
                    <div className="mb-3">
                      <h2
                        className="min-w-0 text-[15px] font-black leading-tight text-gray-900 dark:text-white sm:text-lg"
                        style={isOutlined ? { color: tText } : undefined}
                      >
                        Tidak Termasuk
                      </h2>
                    </div>
                    <ul className="space-y-2">
                      {displayExclusions.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-[13px] leading-snug text-gray-600 dark:text-gray-400 sm:text-sm"
                          style={isOutlined ? { color: tSub } : undefined}
                        >
                          <XCircle size={14} className="mt-0.5 shrink-0 text-rose-400" />
                          <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

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
            {displayVisaInfo && (
              <div>
                <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <FileText size={18} />} Informasi Visa
                </h2>
                <p className={`text-sm leading-relaxed p-4 ${isOutlined ? `${pfx}-card` : "text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl"}`}
                  style={isOutlined ? { color: tSub } : undefined}>
                  {displayVisaInfo}
                </p>
              </div>
            )}

            {/* Notes */}
            {displayNotes && (
              <div>
                <h2 className={`${secTitle} mb-3`} style={isOutlined ? { color: tText } : undefined}>
                  {isOutlined && <ClipboardList size={18} />} Catatan Penting
                </h2>
                <p className={`text-sm leading-relaxed p-4 ${isOutlined ? `${pfx}-card` : "text-gray-600 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"}`}
                  style={isOutlined ? { background: tSun, color: tSub } : undefined}>
                  {displayNotes}
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
                  <Ban size={16} /> Penuh
                </div>
              ) : (
                <TourBookingCTA
                  waHref={bookingWaHref}
                  destination={displayTitle}
                  summary={waSummary}
                  buttonClassName={`w-full flex items-center justify-center gap-2 py-3 font-black mb-3 transition disabled:opacity-60 ${isOutlined ? `${pfx}-btn` : "bg-green-500 hover:bg-green-600 text-white rounded-xl"}`}
                  buttonStyle={isOutlined ? { background: "var(--site-accent)", color: "#fff", justifyContent: "center" } : undefined}
                />
              )}

              {/* Download itinerary PDF */}
              <a href={`/tours/${tour.id}/pdf`}
                className={`w-full flex items-center justify-center gap-2 py-3 font-bold mb-3 transition ${isOutlined ? `${pfx}-card` : "border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"}`}
                style={isOutlined ? { background: tCard, color: tText } : undefined}>
                <Download size={16} /> Unduh Rencana Perjalanan PDF
              </a>

              <div className="text-xs text-center mb-5 font-black text-gray-400">
                Konsultasi gratis · Tanpa biaya tambahan
              </div>

              {/* Tour details grid */}
              <div className={`space-y-2 text-sm pt-4 ${isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-100 dark:border-gray-800"}`}
                style={isOutlined ? { borderColor: tBdr } : undefined}>
                {departureLabel && (
                  <div className="flex justify-between">
                    <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                      {sidebarLabel(<Plane size={12} />, "Keberangkatan")}
                    </span>
                    <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                      style={isOutlined ? { color: tText } : undefined}>{departureLabel}</span>
                  </div>
                )}
                {displayDuration && (
                  <div className="flex justify-between">
                    <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                      {sidebarLabel(<Clock size={12} />, "Durasi")}
                    </span>
                    <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                      style={isOutlined ? { color: tText } : undefined}>{displayDuration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: tSub ?? "" }} className={tSub ? "" : "text-gray-500"}>
                    {sidebarLabel(<Users size={12} />, isFlexibleDate ? "Kapasitas" : "Sisa Seat")}
                  </span>
                  <span className={`font-${isOutlined ? "black" : "medium"} text-gray-900 dark:text-white`}
                    style={isOutlined ? { color: tText } : undefined}>{capacityLabel}</span>
                </div>
              </div>

              {/* Add Ons — hanya yang opsional (WAJIB sudah dilipat ke Total mulai di atas) */}
              {optionalAddOns.length > 0 && (
                <div className={`mt-4 pt-4 ${isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-100 dark:border-gray-800"}`}
                  style={isOutlined ? { borderColor: tBdr } : undefined}>
                  <p className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isOutlined ? "font-black" : "font-semibold text-gray-500"}`}
                    style={isOutlined ? { color: tSub } : undefined}>
                    {isOutlined && <Package size={12} />} Add-on <span className="font-normal normal-case tracking-normal text-gray-400">(opsional)</span>
                  </p>
                  <div className="space-y-2">
                    {optionalAddOns.map((item) => (
                      <div key={item.name} className="text-xs">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 min-w-0">
                            <span className="break-words">{item.name}</span>
                            {item.tag === "recommended" && (
                              <span className="addon-recommendation-stabilo">REKOMENDASI</span>
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
                tourTitle={displayTitle}
                isOutlined={isOutlined}
                isAtlas={isAtlas}
                pfx={pfx}
                tText={tText}
                tCard={tCard}
                tBdr={tBdr}
                tSub={tSub}
              />
            </div>
          </div>
        </div>

        {paymentPlan && (
          <section
            id="skema-pembayaran"
            className={`mt-10 overflow-hidden ${isOutlined ? `${pfx}-card p-5 sm:p-7` : "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7"}`}
            style={isOutlined ? { background: tCard, color: tText } : undefined}
          >
            <div className="max-w-5xl">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={`text-2xl font-black tracking-tight ${isOutlined ? "" : "text-gray-900 dark:text-white"}`}
                  style={isOutlined ? { color: tText } : undefined}
                >
                  {paymentPlan.title}
                </h2>
                <CheckCircle size={20} className={isOutlined ? "" : "text-emerald-400"} style={isOutlined ? { color: "var(--site-accent)" } : undefined} />
              </div>

              <p
                className={`mt-4 max-w-4xl text-sm leading-relaxed sm:text-base ${isOutlined ? "" : "text-gray-600 dark:text-gray-300"}`}
                style={isOutlined ? { color: tSub } : undefined}
              >
                {paymentPlan.intro}
              </p>
              <p
                className={`mt-2 text-sm font-bold italic ${isOutlined ? "" : "text-gray-700 dark:text-gray-200"}`}
                style={isOutlined ? { color: tText } : undefined}
              >
                ({paymentPlan.paymentMethodsLabel})
              </p>

              <div className="mt-5 flex justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 border px-3 py-1 text-[11px] font-black uppercase tracking-wide ${isOutlined ? `${pfx}-pill` : "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"}`}
                  style={isOutlined ? { background: tMint, color: tText, borderColor: tBdr } : undefined}
                >
                  <CheckCircle size={13} />
                  {paymentPlan.urgencyLabel}
                </span>
              </div>

              <a
                href={bookingWaHref}
                className={`mt-4 flex w-full items-center justify-center px-5 py-3 text-sm font-black uppercase tracking-wide transition ${isOutlined ? `${pfx}-btn` : "rounded-full bg-yellow-300 text-gray-950 hover:bg-yellow-200"}`}
                style={isOutlined ? { background: "#FFD966", color: "#1f2937", borderColor: tBdr } : undefined}
              >
                Booking Sekarang
              </a>

              <div className="mt-8">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <p
                    className={`text-xs font-black uppercase tracking-[0.18em] ${isOutlined ? "" : "text-gray-500 dark:text-gray-400"}`}
                    style={isOutlined ? { color: tSub } : undefined}
                  >
                    Skema Pembayaran
                  </p>
                  <p
                    className={`text-xs font-semibold ${isOutlined ? "" : "text-gray-500 dark:text-gray-400"}`}
                    style={isOutlined ? { color: tSub } : undefined}
                  >
                    Total: {paymentPlan.totalLabel} / orang
                  </p>
                </div>
                <div className={`overflow-hidden border ${isOutlined ? "border-dashed" : "rounded-xl border-gray-200 dark:border-gray-800"}`} style={isOutlined ? { borderColor: tBdr } : undefined}>
                  <table className="w-full table-fixed text-left text-[11px] sm:text-sm">
                    <thead className={isOutlined ? "" : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200"}>
                      <tr>
                        <th className="w-[24%] border-b px-2 py-2 text-[10px] font-black uppercase tracking-wide sm:px-4 sm:py-3 sm:text-xs" style={isOutlined ? { borderColor: tBdr, color: tText } : undefined}>Tahap</th>
                        <th className="w-[36%] border-b px-2 py-2 text-[10px] font-black uppercase tracking-wide sm:px-4 sm:py-3 sm:text-xs" style={isOutlined ? { borderColor: tBdr, color: tText } : undefined}>Jatuh Tempo</th>
                        <th className="w-[40%] border-b px-2 py-2 text-right text-[10px] font-black uppercase tracking-wide sm:px-4 sm:py-3 sm:text-xs" style={isOutlined ? { borderColor: tBdr, color: tText } : undefined}>Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentPlan.steps.map((step) => (
                        <tr key={step.label}>
                          <td className="break-words border-b px-2 py-2 font-semibold sm:px-4 sm:py-3" style={isOutlined ? { borderColor: tBdr, color: tText } : undefined}>{step.label}</td>
                          <td className="break-words border-b px-2 py-2 sm:px-4 sm:py-3" style={isOutlined ? { borderColor: tBdr, color: tSub } : undefined}>{step.dueDateLabel}</td>
                          <td className="break-words border-b px-2 py-2 text-right font-bold sm:px-4 sm:py-3" style={isOutlined ? { borderColor: tBdr, color: tText } : undefined}>{step.amountLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {paymentPlan.finePrint && (
                  <p
                    className={`mt-3 text-xs leading-relaxed ${isOutlined ? "" : "text-gray-500 dark:text-gray-400"}`}
                    style={isOutlined ? { color: tSub } : undefined}
                  >
                    {paymentPlan.finePrint}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

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

        {/* P1.3: Tour Lainnya — internal linking ke paket upcoming yang masih bisa dipesan */}
        {displayRelatedTours.length > 0 && (
          <div className="mt-12">
            <h2 className={`${secTitle} mb-5`} style={isOutlined ? { color: tText } : undefined}>
              {isOutlined && <MapPin size={18} />} {isExpired ? "Tour yang Masih Bisa Dipesan" : "Tour Lainnya"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayRelatedTours.map((t) => (
                <TourCard key={t.id} tour={t} theme={siteTheme} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
