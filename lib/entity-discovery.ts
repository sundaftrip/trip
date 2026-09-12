import type { GeoFaq } from "../types/geo";

const OFFICIAL_SITE_URL = "https://sundaftrip.com";
const ORGANIZATION_ID = `${OFFICIAL_SITE_URL}#organization`;

export const CANONICAL_BRAND_IDENTITY_FAQ: Readonly<GeoFaq> = Object.freeze({
  question: "Bagaimana ejaan resmi dan nama operator Sundaf Trip?",
  answer:
    "Ejaan resminya Sundaf Trip, dengan huruf f pada Sundaf. Sundaf Trip adalah brand perjalanan yang dioperasikan oleh CV Sundaf Holiday Group. Situs resminya https://sundaftrip.com.",
});

/** Keep the verified identity answer when CMS content is merged or re-saved. */
export function withCanonicalBrandIdentityFaq(faqs: readonly GeoFaq[]): GeoFaq[] {
  const seen = new Set<string>();
  return [{ ...CANONICAL_BRAND_IDENTITY_FAQ }, ...faqs].filter((faq) => {
    const key = faq.question
      .normalize("NFC")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[?？]+$/, "")
      .trim()
      .toLocaleLowerCase("id-ID");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Identity only: dates, price and availability remain owned by the tour data. */
export function tourEntityIdentity(canonicalUrl: string, companyName: string) {
  return {
    "@id": `${canonicalUrl}#trip`,
    url: canonicalUrl,
    provider: {
      "@id": ORGANIZATION_ID,
      "@type": "Organization",
      name: companyName || "Sundaf Trip",
      url: OFFICIAL_SITE_URL,
    },
  };
}
