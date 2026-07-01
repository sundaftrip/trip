/* GET /tours/[id]/pdf, generates a branded itinerary PDF on the fly
   from the Tour record and streams it back as a one-click download. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { localizePdfTour } from "@/lib/itinerary-pdf-localization";
import { formatCurrency, formatDate } from "@/lib/utils";
import { buildTourPaymentPlan } from "@/lib/tour-payment-plan";
import { ItineraryPDF, type ItineraryDay, type PdfAddOn } from "@/components/pdf/ItineraryPDF";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

type PdfAssetLog = {
  src: string;
  status:
    | "data-url"
    | "remote-ok"
    | "remote-passthrough"
    | "remote-fetch-failed"
    | "local-ok"
    | "local-missing"
    | "unsupported";
  reason?: string;
  bytes?: number;
  contentType?: string;
};

function recordPdfAsset(
  assetLog: PdfAssetLog[],
  src: string,
  status: PdfAssetLog["status"],
  reason?: string,
  extra: Pick<PdfAssetLog, "bytes" | "contentType"> = {},
) {
  assetLog.push({ src: src.slice(0, 220), status, reason, ...extra });
}

function remoteImageMime(contentType: string | null) {
  const compact = contentType?.split(";")[0]?.trim().toLowerCase();
  if (compact === "image/jpeg" || compact === "image/png") return compact;
  return null;
}

async function fetchWithTimeout(src: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(src, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function toPdfImageSrc(src?: string | null, assetLog: PdfAssetLog[] = []) {
  if (!src) return null;
  if (/^data:image\/(?:png|jpe?g);base64,/i.test(src)) {
    recordPdfAsset(assetLog, "data:image/*;base64", "data-url");
    return src;
  }
  if (/^https?:\/\//i.test(src)) {
    try {
      const res = await fetchWithTimeout(src);
      const contentType = res.headers.get("content-type");
      const mime = remoteImageMime(contentType);
      if (!res.ok) {
        recordPdfAsset(assetLog, src, "remote-fetch-failed", `HTTP ${res.status}`, { contentType: contentType ?? undefined });
        return src;
      }
      if (!mime) {
        recordPdfAsset(assetLog, src, "remote-passthrough", "Remote image is not JPEG/PNG, passing URL through to react-pdf.", { contentType: contentType ?? undefined });
        return src;
      }
      const bytes = Buffer.from(await res.arrayBuffer());
      recordPdfAsset(assetLog, src, "remote-ok", undefined, { bytes: bytes.byteLength, contentType: mime });
      return `data:${mime};base64,${bytes.toString("base64")}`;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Remote fetch failed.";
      recordPdfAsset(assetLog, src, "remote-fetch-failed", reason);
    }
    return src;
  }
  if (!src.startsWith("/")) {
    recordPdfAsset(assetLog, src, "unsupported", "Only public-root, http(s), and image data URLs are supported.");
    return null;
  }

  const publicDir = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicDir, src.replace(/^\/+/, ""));
  if (!filePath.startsWith(`${publicDir}${path.sep}`)) {
    recordPdfAsset(assetLog, src, "unsupported", "Resolved outside public directory.");
    return null;
  }

  const mime = mimeForFile(filePath);
  if (!mime) {
    recordPdfAsset(assetLog, src, "unsupported", "Unsupported local image mime.");
    return null;
  }

  try {
    const bytes = await readFile(filePath);
    recordPdfAsset(assetLog, src, "local-ok");
    return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
  } catch {
    recordPdfAsset(assetLog, src, "local-missing", "Failed to read local public asset.");
    return null;
  }
}

function estimatePdfPageCount(buffer: Buffer) {
  const text = buffer.toString("latin1");
  return text.match(/\/Type\s*\/Page\b/g)?.length ?? null;
}

function failedPdfAssets(assetLog: PdfAssetLog[]) {
  return assetLog.filter((asset) =>
    asset.status === "local-missing" ||
    asset.status === "unsupported" ||
    asset.status === "remote-fetch-failed"
  );
}

function shouldWritePdfDebugFiles() {
  if (process.env.PDF_DEBUG !== "true") return false;
  if (process.env.VERCEL_ENV === "production" && process.env.PDF_DEBUG_ALLOW_PRODUCTION !== "true") {
    return false;
  }
  return true;
}

async function writePdfDebugArtifacts({
  id,
  title,
  pdfBuffer,
  assetLog,
  generateMs,
  pageCount,
}: {
  id: string;
  title: string;
  pdfBuffer: Buffer;
  assetLog: PdfAssetLog[];
  generateMs: number;
  pageCount: number | null;
}) {
  if (!shouldWritePdfDebugFiles()) return;

  const dir = process.env.PDF_DEBUG_DIR || "/tmp/pdf-debug";
  await mkdir(dir, { recursive: true });
  const fileBase = `${slugify(`${id}-${title}`) || id}-${Date.now()}`;
  await Promise.all([
    writeFile(path.join(dir, `${fileBase}.pdf`), pdfBuffer),
    writeFile(path.join(dir, `${fileBase}.json`), JSON.stringify({
      id,
      title,
      generateMs,
      sizeBytes: pdfBuffer.byteLength,
      pageCount,
      failedAssets: failedPdfAssets(assetLog),
      assetLog,
    }, null, 2)),
  ]);
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
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const startedAt = Date.now();
  const assetLog: PdfAssetLog[] = [];
  const { id } = await params;

  const [tour, companyRows] = await Promise.all([
    prisma.tour.findUnique({ where: { id } }),
    prisma.companyInfo.findMany({
      where: { key: { in: [
        "company_name", "company_logo", "company_whatsapp", "company_phone",
        "company_email", "company_website", "company_address", "company_nib",
        "company_instagram", "about_tagline", "about_story",
      ] } },
    }),
  ]);

  if (!tour || (tour.status === "DRAFT" && process.env.NODE_ENV === "production")) {
    return new Response("Tour tidak ditemukan", { status: 404 });
  }

  const ci: Record<string, string> = {};
  companyRows.forEach((c) => { ci[c.key] = c.value; });
  const faqUrl = `${new URL(req.url).origin}/faq`;

  const itinerary = (tour.itinerary as ItineraryDay[] | null) ?? [];
  const finalPrice = tour.promoPrice ?? tour.price;
  const priceLabel = formatCurrency(finalPrice);
  const priceCoretLabel = tour.promoPrice
    ? `${formatCurrency(tour.price)}  -  hemat ${formatCurrency(tour.price - tour.promoPrice)}`
    : null;
  const landTourLabel = tour.priceLandTour ? formatCurrency(tour.priceLandTour) : null;
  const normalizedAddOns = normalizePdfAddOns(tour.addOns);
  const mandatoryAddOnTotal = normalizedAddOns
    .filter((item) => item.tag === "wajib")
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const addOns = normalizedAddOns.filter((item) => item.tag !== "wajib");
  const paymentPlan = tour.status === "ACTIVE"
    ? buildTourPaymentPlan({
        totalAmount: finalPrice + mandatoryAddOnTotal,
        departureDate: tour.tripDate,
        seatsLeft: tour.seatsLeft,
        paymentPlanConfig: tour.paymentPlan,
      })
    : null;
  const rawHero = tour.heroImg || fallbackHeroForTour(tour);
  const rawGallery = uniqueImages([rawHero, ...tour.gallery, fallbackHeroForTour(tour)]);
  const [heroImg, gallery, logo] = await Promise.all([
    toPdfImageSrc(rawHero, assetLog),
    Promise.all(rawGallery.map((img) => toPdfImageSrc(img, assetLog))),
    toPdfImageSrc(ci["company_logo"], assetLog),
  ]);
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
    visaInfo: tour.visaInfo,
    notes: tour.notes,
    addOns,
  });

  // ItineraryPDF returns a <Document>; cast satisfies renderToBuffer's
  // strict element typing without leaking `any`.
  type PdfElement = Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(
    createElement(ItineraryPDF, {
      tour: pdfTour,
      priceLabel,
      priceCoretLabel,
      landTourLabel,
      paymentPlan,
      company: {
        name: ci["company_name"],
        logo,
        tagline: ci["about_tagline"],
        story: parseStory(ci["about_story"]),
        address: ci["company_address"],
        phone: ci["company_phone"],
        whatsapp: ci["company_whatsapp"],
        email: ci["company_email"],
        website: ci["company_website"],
        instagram: ci["company_instagram"],
        nib: ci["company_nib"],
      },
      faqUrl,
    }) as unknown as PdfElement,
  );
  const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const generateMs = Date.now() - startedAt;
  const pageCount = estimatePdfPageCount(pdfBuffer);

  console.info("[pdf:itinerary]", {
    tourId: id,
    title: pdfTour.title,
    generateMs,
    sizeBytes: pdfBuffer.byteLength,
    pageCount,
    failedAssets: failedPdfAssets(assetLog),
  });

  await writePdfDebugArtifacts({
    id,
    title: pdfTour.title,
    pdfBuffer,
    assetLog,
    generateMs,
    pageCount,
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Rencana-Perjalanan-${slugify(pdfTour.title)}.pdf"`,
      "Cache-Control": "no-store, must-revalidate",
      "X-PDF-Generate-Ms": String(generateMs),
      ...(pageCount ? { "X-PDF-Page-Count": String(pageCount) } : {}),
      // Jangan sampai PDF terindex sebagai duplikat halaman tour di Google.
      "X-Robots-Tag": "noindex",
    },
  });
}
