import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { visaSlug } from "@/lib/visa-slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sundaftrip.com";

  const [blogs, tours, visas] = await Promise.all([
    prisma.blog.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.tour.findMany({
      where: { status: { in: ["ACTIVE", "FULL"] } },
      select: { id: true, updatedAt: true },
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
    url: `${base}/tours/${tour.id}`,
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
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    // /tours listing — penting sebagai kandidat sitelink "Semua Paket Tour"
    { url: `${base}/tours`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/visa`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/visa/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/destinations/murmansk`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/destinations/kazakhstan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...visaUrls,
    ...tourUrls,
    ...blogUrls,
  ];
}
