/* GET /tours/[id]/pdf — generates a branded itinerary PDF on the fly
   from the Tour record and streams it back as a one-click download. */
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ItineraryPDF, type ItineraryDay } from "@/components/pdf/ItineraryPDF";

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
  } catch { /* not JSON — treat as single paragraph */ }
  return [raw];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [tour, companyRows] = await Promise.all([
    prisma.tour.findUnique({ where: { id } }),
    prisma.companyInfo.findMany({
      where: { key: { in: [
        "company_name", "company_logo", "company_whatsapp", "company_phone",
        "company_email", "company_website", "company_address", "company_nib",
        "about_tagline", "about_story",
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

  // ItineraryPDF returns a <Document>; cast satisfies renderToBuffer's
  // strict element typing without leaking `any`.
  type PdfElement = Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(
    createElement(ItineraryPDF, {
      tour: {
        title: tour.title,
        category: tour.category,
        country: tour.country,
        cityHighlight: tour.cityHighlight,
        seatsLeft: tour.seatsLeft,
        tripDateLabel: tour.tripDate ? formatDate(tour.tripDate) : null,
        duration: tour.duration,
        itinerary,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        heroImg: tour.heroImg,
        visaInfo: tour.visaInfo,
        notes: tour.notes,
      },
      priceLabel,
      priceCoretLabel,
      landTourLabel,
      company: {
        name: ci["company_name"],
        logo: ci["company_logo"],
        tagline: ci["about_tagline"],
        story: parseStory(ci["about_story"]),
        address: ci["company_address"],
        phone: ci["company_phone"],
        whatsapp: ci["company_whatsapp"],
        email: ci["company_email"],
        website: ci["company_website"],
        nib: ci["company_nib"],
      },
      faqUrl,
    }) as unknown as PdfElement,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Itinerary-${slugify(tour.title)}.pdf"`,
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
