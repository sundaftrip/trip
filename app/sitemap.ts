import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { visaSlug } from "@/lib/visa-slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sundaftrip.com";

  const staticUrls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    // /tours listing — penting sebagai kandidat sitelink "Semua Paket Tour"
    { url: `${base}/tours`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    // Landing page konversi trip perdana Vietnam (Sapa & Halong). Halaman
    // statis di public/vietnam/, punya juga sitemap khusus /vietnam/sitemap.xml.
    { url: `${base}/vietnam`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/visa`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/visa/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    // Brand/entity page untuk query "Sundaf Trip", "Sundaftrip", dan "Trip Sundaf".
    { url: `${base}/sundaf-trip`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    // GEO / AEO landing pages - ringkasan answer-ready untuk query AI dan Google AI Overviews.
    { url: `${base}/tour-rusia-dari-indonesia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/open-trip-aurora-rusia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/visa-rusia-wni`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // /search sengaja TIDAK didaftarkan: halaman pencarian noindex, tak perlu di sitemap.
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    // Hub destinasi — induk breadcrumb halaman destinasi di bawahnya.
    { url: `${base}/destinations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/destinations/murmansk`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destinations/teriberka`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destinations/kazakhstan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  try {
    const [blogs, tours, visas] = await Promise.all([
      prisma.blog.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.tour.findMany({
        where: { status: { in: ["ACTIVE", "FULL"] } },
        select: { id: true, slug: true, updatedAt: true },
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

    const tourUrls: MetadataRoute.Sitemap = tours.map((tour) => ({
      url: `${base}/tours/${tour.slug ?? tour.id}`,
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
