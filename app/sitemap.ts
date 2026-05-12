import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sundaftrip.com";

  const blogs = await prisma.blog.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const blogUrls: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${base}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/destinations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/tour`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...blogUrls,
  ];
}
