import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import GeoPage from "../geo-page";
import { geoMetadata, geoPageSchema, getGeoPageContent } from "@/lib/geo-pages";
import { prisma } from "@/lib/prisma";
import { publicTourVisibilityWhere } from "@/lib/public-tours";
import { buildRussiaTourSummarySection, RUSSIA_GUIDE_PATH } from "@/lib/russia-tour-summary";

const ROUTE = RUSSIA_GUIDE_PATH;
export const revalidate = 300;

const getTours = unstable_cache(
  () => prisma.tour.findMany({
    where: {
      AND: [publicTourVisibilityWhere(), { status: "ACTIVE", tripDate: { gt: new Date() } }],
    },
    select: {
      id: true, slug: true, title: true, country: true, cityHighlight: true,
      price: true, promoPrice: true, seatsLeft: true, tripDate: true,
      duration: true, badge: true, status: true, addOns: true, hotel: true,
    },
  }),
  ["russia-guide-tours-v1"],
  // Tour CMS mutations already invalidate this shared public catalog tag.
  { revalidate: 300, tags: ["home-data"] },
);

export async function generateMetadata(): Promise<Metadata> {
  return geoMetadata(await getGeoPageContent(ROUTE));
}

export default async function TourRusiaDariIndonesiaPage() {
  const [content, tours] = await Promise.all([
    getGeoPageContent(ROUTE),
    // Do not cache a synthetic empty catalog when the database is unavailable.
    getTours().catch(() => null),
  ]);
  const summary = buildRussiaTourSummarySection(tours);
  return (
    <GeoPage
      eyebrow={content.eyebrow}
      title={content.title}
      canonicalPath={content.routePath}
      description={content.answer}
      primaryCta={{ href: content.primaryCtaHref || "/tours", label: content.primaryCtaLabel || "Lihat Paket Tour" }}
      secondaryCta={
        content.secondaryCtaHref && content.secondaryCtaLabel
          ? { href: content.secondaryCtaHref, label: content.secondaryCtaLabel }
          : undefined
      }
      sections={[summary, ...content.sections]}
      faqs={content.faqs}
      schema={geoPageSchema(content)}
    />
  );
}
