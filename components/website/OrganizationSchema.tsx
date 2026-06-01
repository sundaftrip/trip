import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const SITE_URL = "https://sundaftrip.com";
const DEFAULT_NAME = "Sundaf Trip";
const DEFAULT_LEGAL = "CV Sundaf Holiday Group";

/**
 * Ambil semua field company yang relevan untuk schema sekali jalan.
 * Cache 1 jam dengan tag "site-org-schema" supaya bisa di-revalidate
 * dari admin saat info perusahaan di-edit.
 */
const getOrgData = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: {
          key: {
            in: [
              "company_name",
              "company_logo",
              "company_address",
              "company_email",
              "company_phone",
              "company_whatsapp",
              "company_instagram",
              "company_nib",
              "company_description",
            ],
          },
        },
      });
      const map: Record<string, string> = {};
      rows.forEach((r) => {
        if (r.value) map[r.key] = r.value;
      });
      return map;
    } catch {
      return {} as Record<string, string>;
    }
  },
  ["site-org-schema"],
  { revalidate: 3600, tags: ["site-org-schema", "company-info"] }
);

/** Normalisasi URL: relative → absolute, http → https. */
function toAbsolute(url: string | undefined, base = SITE_URL): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://")) return "https://" + trimmed.slice(7);
  if (trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("//")) return "https:" + trimmed;
  if (trimmed.startsWith("/")) return base + trimmed;
  return base + "/" + trimmed;
}

/** Normalisasi handle IG ke URL profil. */
function toInstagramUrl(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const v = input.trim().replace(/^@/, "");
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://www.instagram.com/${v.replace(/^instagram\.com\//i, "").replace(/\/$/, "")}`;
}

/** Normalisasi nomor telepon ke format E.164 internasional (best-effort). */
function toE164(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("0")) return "+62" + digits.slice(1);
  if (digits.startsWith("62")) return "+" + digits;
  if (digits.startsWith("8")) return "+62" + digits;
  return "+" + digits;
}

export default async function OrganizationSchema() {
  const c = await getOrgData();

  const name = c["company_name"] || DEFAULT_NAME;
  const logoAbs = toAbsolute(c["company_logo"]) || `${SITE_URL}/favicon.svg`;
  const phoneE164 = toE164(c["company_phone"]);
  const waE164 = toE164(c["company_whatsapp"]);
  const igUrl = toInstagramUrl(c["company_instagram"]);
  const description =
    c["company_description"] ||
    "Spesialis perjalanan ke Rusia, Asia Tengah, dan aurora borealis untuk traveler Indonesia. Dari visa sampai itinerary, semua kami rancang.";

  const sameAs: string[] = [];
  if (igUrl) sameAs.push(igUrl);

  // ── Organization + TravelAgency JSON-LD ──
  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency"],
    "@id": `${SITE_URL}#organization`,
    name,
    alternateName: ["Sundaf Trip", "sundaftrip", "sundaftrip.com", "Sundaf", "Sundaf Holiday Group", DEFAULT_LEGAL],
    legalName: DEFAULT_LEGAL,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: logoAbs,
      contentUrl: logoAbs,
    },
    image: logoAbs,
    description,
    areaServed: { "@type": "Country", name: "Indonesia" },
    knowsLanguage: ["id", "en"],
  };

  if (c["company_address"]) {
    organization.address = {
      "@type": "PostalAddress",
      streetAddress: c["company_address"],
      addressLocality: "Jakarta Selatan",
      addressRegion: "DKI Jakarta",
      postalCode: "12940", // Karet Kuningan, lokasi Epiwalk Epicentrum
      addressCountry: "ID",
    };
  }

  // LocalBusiness butuh `telephone` di top-level Organization (bukan cuma
  // di contactPoint array). Pakai nomor WhatsApp Sundaf sebagai primary.
  if (waE164) {
    organization.telephone = waE164;
  } else if (phoneE164) {
    organization.telephone = phoneE164;
  }

  // Koordinat approximate Rasuna Epicentrum, Kuningan — bantu Knowledge
  // Panel render map embed.
  organization.geo = {
    "@type": "GeoCoordinates",
    latitude: -6.2236,
    longitude: 106.8333,
  };

  // Price range — bantu Google paham positioning Sundaf Trip
  organization.priceRange = "Rp 10.000.000 - Rp 50.000.000";

  // Jam operasional kantor (Senin-Jumat 09:00-17:00 WIB)
  organization.openingHoursSpecification = [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  ];

  const contactPoints: Record<string, unknown>[] = [];
  if (phoneE164) {
    contactPoints.push({
      "@type": "ContactPoint",
      telephone: phoneE164,
      contactType: "customer service",
      areaServed: "ID",
      availableLanguage: ["Indonesian", "English"],
    });
  }
  if (waE164 && waE164 !== phoneE164) {
    contactPoints.push({
      "@type": "ContactPoint",
      telephone: waE164,
      contactType: "sales",
      areaServed: ["ID", "Worldwide"],
      availableLanguage: ["Indonesian", "English"],
    });
  }
  if (c["company_email"]) {
    contactPoints.push({
      "@type": "ContactPoint",
      email: c["company_email"],
      contactType: "customer support",
      areaServed: "ID",
      availableLanguage: ["Indonesian", "English"],
    });
  }
  if (contactPoints.length) organization.contactPoint = contactPoints;

  if (c["company_nib"]) {
    organization.identifier = {
      "@type": "PropertyValue",
      propertyID: "NIB",
      value: c["company_nib"],
    };
  }

  if (sameAs.length) organization.sameAs = sameAs;

  // ── WebSite JSON-LD ──
  // Include SearchAction → /search?q={search_term_string} ada beneran,
  // jadi Google boleh kasih sitelinks search box di SERP brand query.
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name,
    alternateName: "sundaftrip",
    description,
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE_URL}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
