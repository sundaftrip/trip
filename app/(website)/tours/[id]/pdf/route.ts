/* GET /tours/[id]/pdf, generates a branded itinerary PDF on the fly
   from the Tour record and streams it back as a one-click download. */
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { isPublicTourVisible } from "@/lib/public-tours";
import {
  fetchPdfImageDataUrl,
  PDF_IMAGE_MAX_BYTES,
  pdfImageBytesToDataUrl,
  validatePdfImageDataUrl,
} from "@/lib/safe-image-url";
import { localizePdfTour } from "@/lib/itinerary-pdf-localization";
import { ITINERARY_PDF_HEADERS } from "@/lib/itinerary-pdf-download";
import { formatCurrency, formatDate } from "@/lib/utils";
import { resolveCompanyPhone } from "@/lib/company-phone";
import { buildTourPaymentPlan } from "@/lib/tour-payment-plan";
import { getCommerceTourStatus } from "@/lib/tour-commerce";
import {
  getCanadaRockiesPreviewTour,
  resolveCanadaRockiesPdfNotes,
  selectCanadaRockiesTourSource,
} from "@/lib/canada-catalog-preview";
import { ItineraryPDF, type PdfAddOn } from "@/components/pdf/ItineraryPDF";
import { readTourItinerary } from "@/lib/tour-visa-plan";
import { assessCatalogVisas, getTourVisaCountries } from "@/lib/tour-visa-data";
import { buildTourVisaCatalogNotes, buildTourVisaPdfAddOns } from "@/lib/tour-visa-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PDF_GALLERY_FALLBACKS = [
  "/trip-photos/trip-1.jpg",
  "/trip-photos/trip-2.jpg",
  "/trip-photos/trip-3.jpg",
  "/trip-photos/trip-4.jpg",
  "/trip-photos/trip-5.jpg",
  "/trip-photos/trip-6.jpg",
  "/trip-photos/cp-1.jpg",
  "/trip-photos/cp-2.jpg",
];
const MAX_PDF_GALLERY_IMAGES = 7;

function slugify(s: string) {
  return s.normalize("NFKD").replace(/[^\w\s-]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 70) || "itinerary";
}

function parseStory(raw?: string): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  } catch { /* not JSON, treat as single paragraph */ }
  return [raw];
}

function fallbackHeroForTour(tour: { title: string; country: string; cityHighlight?: string | null }) {
  const text = `${tour.title} ${tour.country} ${tour.cityHighlight ?? ""}`.toLowerCase();
  if (text.includes("vietnam") && text.includes("sapa")) return "/vietnam/assets/hero-sapa.jpg";
  if (text.includes("vietnam") && text.includes("hanoi")) return "/vietnam/assets/hanoi-street.jpg";
  if (text.includes("vietnam")) return "/vietnam/assets/halong-sunset.jpg";
  return null;
}

function mimeForFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  return null;
}

type PdfImageOptions = {
  preserveTransparency?: boolean;
};

function toPdfRemoteImageSrc(
  src: string,
  { preserveTransparency = false }: PdfImageOptions = {},
) {
  try {
    const url = new URL(src);
    if (
      url.hostname.toLowerCase().replace(/\.$/, "") !== "res.cloudinary.com"
      || !url.pathname.includes("/image/upload/")
    ) {
      return src;
    }

    const transformation = preserveTransparency
      ? "w_1400,c_fit,q_auto:best,f_png"
      : "w_1400,c_fill,g_auto,q_auto:good,f_jpg";
    url.pathname = url.pathname.replace(
      "/image/upload/",
      `/image/upload/${transformation}/`,
    );
    return url.href;
  } catch {
    return src;
  }
}

async function toPdfImageSrc(
  src?: string | null,
  options: PdfImageOptions = {},
) {
  if (!src) return null;
  if (/^data:/i.test(src)) {
    try {
      return validatePdfImageDataUrl(src);
    } catch {
      return null;
    }
  }
  if (/^https?:\/\//i.test(src)) {
    try {
      return await fetchPdfImageDataUrl(toPdfRemoteImageSrc(src, options));
    } catch {
      return null;
    }
  }
  if (!src.startsWith("/")) return null;

  try {
    const publicDir = await realpath(path.resolve(process.cwd(), "public"));
    const requestedPath = path.resolve(publicDir, src.replace(/^\/+/, ""));
    if (!requestedPath.startsWith(`${publicDir}${path.sep}`)) return null;

    const filePath = await realpath(requestedPath);
    if (!filePath.startsWith(`${publicDir}${path.sep}`)) return null;

    const mime = mimeForFile(filePath);
    if (!mime) return null;

    const fileStats = await stat(filePath);
    if (!fileStats.isFile() || fileStats.size > PDF_IMAGE_MAX_BYTES) return null;

    const bytes = await readFile(filePath);
    return pdfImageBytesToDataUrl(bytes, mime);
  } catch {
    return null;
  }
}

function uniqueImages(images: Array<string | null | undefined>) {
  return [...new Set(images.filter((item): item is string => Boolean(item)))];
}

type RawAddOn = {
  name?: unknown;
  price?: unknown;
  tag?: unknown;
  desc?: unknown;
};

function normalizePdfAddOns(raw: unknown): PdfAddOn[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const addOn = item as RawAddOn;
    const name = typeof addOn.name === "string" ? addOn.name.trim() : "";
    if (!name) return [];

    const price = Number(addOn.price);
    const tag = addOn.tag === "wajib" || addOn.tag === "recommended" ? addOn.tag : "";
    const desc = typeof addOn.desc === "string" && addOn.desc.trim()
      ? addOn.desc.trim()
      : null;

    return [{
      name,
      price: Number.isFinite(price) ? price : 0,
      priceLabel: formatCurrency(Number.isFinite(price) ? price : 0),
      tag,
      desc,
    }];
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const previewTour = getCanadaRockiesPreviewTour(id);
  const standalonePreview = Boolean(previewTour && !process.env.DATABASE_URL);
  const [databaseTour, companyRows, visaCountries] = standalonePreview ? [null, [], []] : await Promise.all([
    prisma.tour.findFirst({ where: { OR: [{ id }, { slug: id }] } }),
    prisma.companyInfo.findMany({
      where: { key: { in: [
        "company_name", "company_logo", "company_whatsapp", "company_phone",
        "company_email", "company_website", "company_nib",
        "company_instagram", "about_tagline", "about_story",
      ] } },
    }),
    getTourVisaCountries(),
  ]);
  const tour = selectCanadaRockiesTourSource(databaseTour, previewTour);

  if (!tour || (process.env.NODE_ENV === "production" && !isPublicTourVisible(tour))) {
    return new Response("Tour tidak ditemukan", { status: 404 });
  }

  const ci: Record<string, string> = {};
  companyRows.forEach((c) => { ci[c.key] = c.value; });
  const faqUrl = "https://sundaftrip.com/faq";

  const itinerary = readTourItinerary(tour.itinerary);
  const visaAssessment = assessCatalogVisas(tour, visaCountries);
  const basePrice = tour.promoPrice ?? tour.price;
  const priceLabel = formatCurrency(basePrice);
  const priceCoretLabel = tour.promoPrice
    ? `${formatCurrency(tour.price)}  -  hemat ${formatCurrency(tour.price - tour.promoPrice)}`
    : null;
  const landTourLabel = tour.priceLandTour ? formatCurrency(tour.priceLandTour) : null;
  const normalizedAddOns = normalizePdfAddOns(tour.addOns);
  const mandatoryAddOns = normalizedAddOns.filter((item) => item.tag === "wajib");
  const mandatoryAddOnTotal = mandatoryAddOns
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const inclusivePrice = basePrice + mandatoryAddOnTotal;
  const inclusivePriceLabel = formatCurrency(inclusivePrice);
  const inclusivePriceCoretLabel = tour.promoPrice
    ? `${formatCurrency(tour.price + mandatoryAddOnTotal)}  -  hemat ${formatCurrency(tour.price - tour.promoPrice)}`
    : null;
  const commerceStatus = getCommerceTourStatus(tour);
  const isPurchasable = ["available", "last_seats", "confirmed", "flexible"].includes(
    commerceStatus,
  );
  const paymentPlan = isPublicTourVisible(tour) && tour.status !== "CANCELLED" && isPurchasable
    ? buildTourPaymentPlan({
        totalAmount: inclusivePrice,
        departureDate: tour.tripDate,
        seatsLeft: tour.seatsLeft,
        paymentPlanConfig: tour.paymentPlan,
      })
    : null;
  const fallbackHero = fallbackHeroForTour(tour);
  const rawHero = tour.heroImg || fallbackHero;
  const storedGallery = uniqueImages([
    rawHero,
    ...tour.gallery,
  ]).slice(0, MAX_PDF_GALLERY_IMAGES);
  const fallbackGallery = uniqueImages([
    fallbackHero,
    ...PDF_GALLERY_FALLBACKS,
  ]).filter((image) => !storedGallery.includes(image));
  const imageCache = new Map<string, Promise<string | null>>();
  const resolveImage = (src?: string | null) => {
    if (!src) return Promise.resolve(null);
    const cached = imageCache.get(src);
    if (cached) return cached;
    const pending = toPdfImageSrc(src);
    imageCache.set(src, pending);
    return pending;
  };
  const [resolvedHero, storedImages, resolvedLogo, logoOnDark] = await Promise.all([
    resolveImage(rawHero),
    Promise.all(storedGallery.map(resolveImage)),
    toPdfImageSrc(ci["company_logo"] || "/logo.png", { preserveTransparency: true }),
    toPdfImageSrc("/vietnam/assets/logo-dark.png", { preserveTransparency: true }),
  ]);
  const logo = resolvedLogo
    || await toPdfImageSrc("/logo.png", { preserveTransparency: true });
  const heroImg = resolvedHero || await resolveImage(fallbackHero);
  let gallery = uniqueImages(storedImages);
  if (gallery.length < MAX_PDF_GALLERY_IMAGES) {
    const fallbackImages = await Promise.all(fallbackGallery.map(resolveImage));
    gallery = uniqueImages([...gallery, ...fallbackImages]).slice(0, MAX_PDF_GALLERY_IMAGES);
  }
  const pdfTour = localizePdfTour({
    title: tour.title,
    country: tour.country,
    cityHighlight: tour.cityHighlight,
    seatsLeft: tour.seatsLeft,
    tripDateLabel: tour.tripDate ? formatDate(tour.tripDate) : null,
    duration: tour.duration,
    itinerary,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    heroImg,
    gallery: uniqueImages(gallery),
    visaInfo: buildTourVisaCatalogNotes(visaAssessment),
    notes: resolveCanadaRockiesPdfNotes(tour.notes, tour.slug),
    addOns: [...normalizedAddOns, ...buildTourVisaPdfAddOns(visaAssessment)],
  });
  const localizedMandatoryAddOns = (pdfTour.addOns ?? [])
    .filter((item) => item.tag === "wajib");
  const localizedOptionalAddOns = (pdfTour.addOns ?? [])
    .filter((item) => item.tag !== "wajib");

  // ItineraryPDF returns a <Document>; cast satisfies renderToBuffer's
  // strict element typing without leaking `any`.
  type PdfElement = Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(
    createElement(ItineraryPDF, {
      tour: {
        ...pdfTour,
        addOns: localizedOptionalAddOns,
      },
      priceLabel,
      priceCoretLabel,
      mandatoryAddOns: localizedMandatoryAddOns,
      inclusivePriceLabel,
      inclusivePriceCoretLabel,
      landTourLabel,
      paymentPlan,
      commerceStatus,
      company: {
        name: ci["company_name"] || "Sundaf Trip",
        logo,
        logoOnDark,
        tagline: ci["about_tagline"],
        story: parseStory(ci["about_story"]),
        phone: resolveCompanyPhone(ci["company_phone"]),
        whatsapp: ci["company_whatsapp"] || "6281775202759",
        email: ci["company_email"] || "info@sundaftrip.com",
        website: ci["company_website"] || "www.sundaftrip.com",
        instagram: ci["company_instagram"] || "sundaf.trip",
        nib: ci["company_nib"],
      },
      faqUrl,
    }) as unknown as PdfElement,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Rencana-Perjalanan-${slugify(pdfTour.title)}.pdf"`,
      ...ITINERARY_PDF_HEADERS,
      // Jangan sampai PDF terindex sebagai duplikat halaman tour di Google.
      "X-Robots-Tag": "noindex",
    },
  });
}
