import { prisma } from "@/lib/prisma";
import { CRAWL_PROFILE, formatCrawlTour, isCrawlTourBookable } from "@/lib/crawl-catalog";
import { publicTourVisibilityWhere } from "@/lib/public-tours";

export const revalidate = 300;

export async function GET() {
  const now = new Date();
  const [tours, posts, contacts] = await Promise.all([
    prisma.tour.findMany({
      where: { AND: [publicTourVisibilityWhere(), { status: { not: "FULL" } }, { OR: [{ tripDate: null }, { tripDate: { gt: now } }] }] },
      select: { id: true, slug: true, title: true, country: true, duration: true, tripDate: true, price: true, promoPrice: true, addOns: true, hotel: true, exclusions: true, status: true, badge: true },
      orderBy: { tripDate: "asc" },
      take: 12,
    }).catch(() => []),
    prisma.blog.findMany({
      where: { published: true }, orderBy: { date: "desc" }, take: 5,
      select: { slug: true, title: true },
    }).catch(() => []),
    prisma.companyInfo.findMany({
      where: { key: { in: ["company_whatsapp", "company_phone", "company_email"] } },
    }).catch(() => []),
  ]);
  const bookableTours = tours.filter((tour) => isCrawlTourBookable(tour, now));
  const labels: Record<string, string> = { company_whatsapp: "WhatsApp", company_phone: "Telepon", company_email: "Email" };
  const body = [
    CRAWL_PROFILE,
    contacts.length ? `## Kontak\n${contacts.filter((row) => row.value.trim()).map((row) => `- ${labels[row.key]}: ${row.value.trim()}`).join("\n")}\n` : "",
    bookableTours.length ? `## Paket yang dapat dipesan\n${bookableTours.map((tour) => formatCrawlTour(tour, now)).join("\n")}\n` : "",
    posts.length ? `## Artikel terbaru\n${posts.map((post) => `- [${post.title}](https://sundaftrip.com/blog/${post.slug})`).join("\n")}\n` : "",
    "## Data lengkap\nHarga dan ketersediaan dapat berubah. Halaman paket memuat rincian kamar, biaya wajib, dan pilihan tambahan. Konfirmasikan pemesanan melalui kontak resmi.\n- [Katalog lengkap tour, visa, FAQ, dan artikel](https://sundaftrip.com/llms-full.txt)\n- [Sitemap](https://sundaftrip.com/sitemap.xml)\n",
  ].filter(Boolean).join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
