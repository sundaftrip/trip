import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publicTourVisibilityWhere } from "@/lib/public-tours";
import { visaSlug } from "@/lib/visa-slug";
import { canonicalTourPath, isSubstantialArchivedTour } from "@/lib/seo-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sundaftrip.com";

  const staticUrls: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    // /tours listing — penting sebagai kandidat sitelink "Semua Paket Tour"
    { url: `${base}/tours`, changeFrequency: "daily", priority: 0.95 },
    // Landing page konversi trip perdana Vietnam (Sapa & Halong). Halaman
    // statis di public/vietnam/, punya juga sitemap khusus /vietnam/sitemap.xml.
    { url: `${base}/vietnam`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/open-trip-vietnam`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/visa`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/custom-trip`, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/jasa-urus-visa-eropa`, changeFrequency: "monthly", priority: 0.86 },
    { url: `${base}/jasa-urus-visa-amerika-canada`, changeFrequency: "monthly", priority: 0.86 },
    { url: `${base}/jasa-urus-visa-terpercaya`, changeFrequency: "monthly", priority: 0.86 },
    { url: `${base}/visa/asuransi-visa-protection`, changeFrequency: "monthly", priority: 0.84 },
    { url: `${base}/visa/faq`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.6 },
    // Brand/entity page untuk query "Sundaf Trip", "Sundaftrip", dan "Trip Sundaf".
    { url: `${base}/sundaf-trip`, changeFrequency: "monthly", priority: 0.9 },
    // Halaman bukti sosial dan rujukan resmi untuk memperkuat entity Sundaf Trip.
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.78 },
    { url: `${base}/media-kit`, changeFrequency: "monthly", priority: 0.76 },
    { url: `${base}/legalitas-dan-keamanan`, changeFrequency: "monthly", priority: 0.62 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/partnership-relation`, changeFrequency: "monthly", priority: 0.62 },
    // GEO / AEO landing pages - ringkasan answer-ready untuk query AI dan Google AI Overviews.
    { url: `${base}/open-trip-rusia-dari-jakarta`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/tour-rusia-dari-indonesia`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/open-trip-aurora-rusia`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/visa-rusia-wni`, changeFrequency: "monthly", priority: 0.8 },
    // /search sengaja TIDAK didaftarkan: halaman pencarian noindex, tak perlu di sitemap.
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    // Hub destinasi — induk breadcrumb halaman destinasi di bawahnya.
    { url: `${base}/destinations`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/destinations/murmansk`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destinations/teriberka`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destinations/kazakhstan`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destinations/rusia-aurora`, changeFrequency: "weekly", priority: 0.84 },
    { url: `${base}/destinations/asia-tengah`, changeFrequency: "weekly", priority: 0.84 },
    { url: `${base}/destinations/vietnam`, changeFrequency: "weekly", priority: 0.82 },
    { url: `${base}/destinations/jepang`, changeFrequency: "weekly", priority: 0.82 },
  ];

  try {
    const [blogs, tours, visas] = await Promise.all([
      prisma.blog.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.tour.findMany({
        where: publicTourVisibilityWhere(),
        select: {
          id: true,
          slug: true,
          updatedAt: true,
          tripDate: true,
          description: true,
          notes: true,
          gallery: true,
          itinerary: true,
          inclusions: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.countryVisa.findMany({
        select: { en: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const blogUrls: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${base}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const tourUrls: MetadataRoute.Sitemap = tours
      .filter((tour) => isSubstantialArchivedTour(tour))
      .map((tour) => ({
      url: `${base}${canonicalTourPath(tour)}`,
      lastModified: tour.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
      }));

    const visaUrls: MetadataRoute.Sitemap = visas.map((visa) => ({
      url: `${base}/visa/${visaSlug(visa.en)}`,
      lastModified: visa.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [
      ...staticUrls,
      ...visaUrls,
      ...tourUrls,
      ...blogUrls,
    ];
  } catch {
    return staticUrls;
  }
}
