import { prisma } from "@/lib/prisma";
import { CRAWL_PROFILE, formatCrawlTour, formatCrawlVisaFees } from "@/lib/crawl-catalog";
import { publicTourVisibilityWhere } from "@/lib/public-tours";
import { visaSlug } from "@/lib/visa-slug";

export const revalidate = 300;

const VISA_LABEL: Record<string, string> = {
  bebas: "Bebas visa", voa: "Visa on Arrival", evisa: "E-Visa", wajib: "Visa wajib", conditional: "Bersyarat",
};

function htmlToText(html: string) {
  return html.replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

export async function GET() {
  const now = new Date();
  const [tours, countries, faqs, posts] = await Promise.all([
    prisma.tour.findMany({
      where: publicTourVisibilityWhere(),
      select: { id: true, slug: true, title: true, country: true, duration: true, tripDate: true, price: true, promoPrice: true, addOns: true, hotel: true, status: true },
      orderBy: { tripDate: "asc" },
    }).catch(() => []),
    prisma.countryVisa.findMany({
      select: { name: true, en: true, visa: true, stay: true, cost: true, officialFee: true, servicePrice: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }).catch(() => []),
    prisma.faq.findMany({
      where: { group: "visa", active: true }, orderBy: { order: "asc" },
      select: { question: true, answer: true },
    }).catch(() => []),
    prisma.blog.findMany({
      where: { published: true }, orderBy: { date: "desc" },
      select: { slug: true, title: true, excerpt: true },
    }).catch(() => []),
  ]);
  const sections = [CRAWL_PROFILE];
  if (tours.length) sections.push(`## Semua paket dan arsip perjalanan\n${tours.map((tour) => formatCrawlTour(tour, now)).join("\n")}\n`);
  if (countries.length) sections.push(
    `## Visa untuk paspor Indonesia (${countries.length} negara)\n` +
    `Harga layanan mengikuti jenis visa; periksa cakupan biaya dan tanggal pembaruan pada halaman negara.\n` +
    countries.map((country) => `- [${country.name}](https://sundaftrip.com/visa/${visaSlug(country.en)}): ${[VISA_LABEL[country.visa] ?? country.visa, country.stay ? `masa tinggal ${country.stay}` : null, formatCrawlVisaFees(country)].filter(Boolean).join("; ")}`).join("\n") + "\n",
  );
  if (faqs.length) sections.push(`## FAQ visa\n${faqs.map((faq) => `### ${faq.question}\n${htmlToText(faq.answer)}`).join("\n\n")}\n`);
  if (posts.length) sections.push(`## Artikel perjalanan\n${posts.map((post) => `- [${post.title}](https://sundaftrip.com/blog/${post.slug})${post.excerpt?.trim() ? `: ${htmlToText(post.excerpt)}` : ""}`).join("\n")}\n`);
  sections.push("Harga, jadwal, dan persyaratan dapat berubah. Gunakan halaman layanan dan sumber resmi sebagai rujukan sebelum memesan atau mengajukan visa. [Sitemap situs](https://sundaftrip.com/sitemap.xml).\n");
  return new Response(sections.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
