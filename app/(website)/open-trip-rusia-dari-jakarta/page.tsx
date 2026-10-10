import type { Metadata } from "next";

import GeoPage from "../geo-page";
import { geoMetadata, geoPageSchema, getGeoPageContent } from "@/lib/geo-pages";
import { getRussiaPublicTours } from "@/lib/russia-public-tours";
import { selectRussiaGuideTours } from "@/lib/russia-tour-summary";
import { canonicalTourPath } from "@/lib/seo-routes";
import RussiaDepartureTable from "@/components/website/clean/RussiaDepartureTable";

const ROUTE = "/open-trip-rusia-dari-jakarta";
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return geoMetadata(await getGeoPageContent(ROUTE));
}

export default async function OpenTripRusiaDariJakartaPage() {
  const [content, tours] = await Promise.all([
    getGeoPageContent(ROUTE),
    getRussiaPublicTours().catch(() => null),
  ]);
  const now = new Date();
  const nearest = selectRussiaGuideTours(tours ?? [], now)[0];
  return (
    <GeoPage
      eyebrow={content.eyebrow}
      title={content.title}
      canonicalPath={content.routePath}
      description={content.answer}
      primaryCta={nearest
        ? { href: canonicalTourPath(nearest), label: "Lihat keberangkatan terdekat" }
        : { href: "/tours?destination=rusia", label: "Lihat katalog Rusia" }}
      secondaryCta={{ href: "/tour-rusia-dari-indonesia", label: "Panduan rute dan biaya Rusia" }}
      sections={content.sections}
      faqs={content.faqs}
      schema={geoPageSchema(content)}
    >
      <RussiaDepartureTable tours={tours} now={now} />
    </GeoPage>
  );
}
