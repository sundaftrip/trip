import type { Metadata } from "next";

import GeoPage from "../geo-page";
import { geoMetadata, geoPageSchema, getGeoPageContent } from "@/lib/geo-pages";
import { getRussiaPublicTours } from "@/lib/russia-public-tours";
import { buildRussiaTourSummarySection, RUSSIA_GUIDE_PATH } from "@/lib/russia-tour-summary";

const ROUTE = RUSSIA_GUIDE_PATH;
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return geoMetadata(await getGeoPageContent(ROUTE));
}

export default async function TourRusiaDariIndonesiaPage() {
  const [content, tours] = await Promise.all([
    getGeoPageContent(ROUTE),
    // Do not cache a synthetic empty catalog when the database is unavailable.
    getRussiaPublicTours().catch(() => null),
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
