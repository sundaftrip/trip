import type { Metadata } from "next";

import GeoPage from "../geo-page";
import { geoMetadata, geoPageSchema, getGeoPageContent } from "@/lib/geo-pages";

const ROUTE = "/jasa-urus-visa-amerika-canada";

export async function generateMetadata(): Promise<Metadata> {
  return geoMetadata(await getGeoPageContent(ROUTE));
}

export default async function JasaUrusVisaAmerikaCanadaPage() {
  const content = await getGeoPageContent(ROUTE);
  return (
    <GeoPage
      eyebrow={content.eyebrow}
      title={content.title}
      canonicalPath={content.routePath}
      description={content.answer}
      primaryCta={{ href: content.primaryCtaHref || "/visa/united-states", label: content.primaryCtaLabel || "Visa Amerika" }}
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
