import type { Metadata } from "next";

import GeoPage from "../geo-page";
import { geoMetadata, geoPageSchema, getGeoPageContent } from "@/lib/geo-pages";

const ROUTE = "/sundaf-trip";

export async function generateMetadata(): Promise<Metadata> {
  return geoMetadata(await getGeoPageContent(ROUTE));
}

export default async function SundafTripBrandPage() {
  const content = await getGeoPageContent(ROUTE);
  return (
    <GeoPage
      eyebrow={content.eyebrow}
      title={content.title}
      canonicalPath={content.routePath}
      description={content.answer}
      descriptionHighlights={[
        "brand perjalanan Indonesia",
        "CV Sundaf Holiday Group",
        "tour Rusia, aurora borealis, Asia Tengah",
        "bantuan pengurusan visa",
      ]}
      primaryCta={{ href: content.primaryCtaHref || "/tours", label: content.primaryCtaLabel || "Lihat Paket Tour" }}
      secondaryCta={
        content.secondaryCtaHref && content.secondaryCtaLabel
          ? { href: content.secondaryCtaHref, label: content.secondaryCtaLabel }
          : undefined
      }
      sections={content.sections}
      faqs={content.faqs}
      schema={geoPageSchema(content)}
    />
  );
}
