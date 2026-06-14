import type { Metadata } from "next";

import GeoPage from "../geo-page";
import { geoMetadata, geoPageSchema, getGeoPageContent } from "@/lib/geo-pages";

const ROUTE = "/open-trip-vietnam";

export async function generateMetadata(): Promise<Metadata> {
  return geoMetadata(await getGeoPageContent(ROUTE));
}

export default async function OpenTripVietnamPage() {
  const content = await getGeoPageContent(ROUTE);
  return (
    <GeoPage
      eyebrow={content.eyebrow}
      title={content.title}
      canonicalPath={content.routePath}
      description={content.answer}
      primaryCta={{ href: content.primaryCtaHref || "/vietnam", label: content.primaryCtaLabel || "Buka Landing Vietnam" }}
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
