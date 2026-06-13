const SITE_URL = "https://sundaftrip.com";

export type Crumb = { name: string; url: string };

/**
 * BreadcrumbList JSON-LD untuk inner pages.
 * Bantu Google paham hierarchy situs → tingkatkan probability sitelinks
 * di SERP brand query.
 *
 * Usage:
 *   <BreadcrumbSchema crumbs={[
 *     { name: "Beranda", url: "/" },
 *     { name: "Paket Tour", url: "/tours" },
 *     { name: "Russia Autumn Wonders", url: "/tours/abc123" },
 *   ]} />
 */
export default function BreadcrumbSchema({ crumbs }: { crumbs: Crumb[] }) {
  if (!crumbs.length) return null;

  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http")
        ? c.url
        : `${SITE_URL}${c.url.startsWith("/") ? c.url : "/" + c.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
