export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/website/HeroSection";
import WhySection from "@/components/website/WhySection";
import ToursSection from "@/components/website/ToursSection";
import BlogSection from "@/components/website/BlogSection";
import ContactSection from "@/components/website/ContactSection";

async function getData() {
  const [texts, tours, posts] = await Promise.all([
    prisma.siteText.findMany(),
    prisma.tour.findMany({ where: { status: "ACTIVE" }, take: 6, orderBy: { createdAt: "desc" } }),
    prisma.blog.findMany({ where: { published: true }, take: 3, orderBy: { date: "desc" } }),
  ]);
  const t: Record<string, { id?: string; en?: string }> = {};
  texts.forEach((x) => { t[x.key] = { id: x.valueId ?? undefined, en: x.valueEn ?? undefined }; });
  return { texts: t, tours, posts };
}

export default async function HomePage() {
  const { texts, tours, posts } = await getData();
  return (
    <>
      <HeroSection texts={texts} />
      <WhySection texts={texts} />
      <ToursSection tours={tours} />
      <BlogSection posts={posts} />
      <ContactSection texts={texts} />
    </>
  );
}
