import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visaSlug } from "@/lib/visa-slug";

/* Pencarian global ringkas untuk modal search di navbar.
   Mengembalikan hasil terkelompok: tour, layanan visa, pertanyaan (FAQ). */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ tours: [], visa: [], faqs: [] });
  }

  const like = { contains: q, mode: "insensitive" as const };

  const [tours, visa, faqs] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { not: "DRAFT" }, OR: [{ title: like }, { country: like }, { cityHighlight: like }] },
      select: { id: true, slug: true, title: true, country: true, duration: true, heroImg: true },
      orderBy: { tripDate: "desc" },
      take: 6,
    }),
    prisma.countryVisa.findMany({
      where: { OR: [{ name: like }, { en: like }] },
      select: { name: true, en: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
    prisma.faq.findMany({
      where: { active: true, OR: [{ question: like }, { answer: like }] },
      select: { id: true, question: true, section: true },
      orderBy: [{ section: "asc" }, { order: "asc" }],
      take: 6,
    }),
  ]);

  return NextResponse.json({
    tours: tours.map((t) => ({
      title: t.title,
      country: t.country,
      duration: t.duration,
      heroImg: t.heroImg,
      href: `/tours/${t.slug ?? t.id}`,
    })),
    visa: visa.map((v) => ({
      name: v.name,
      en: v.en,
      href: `/visa/${visaSlug(v.en)}`,
    })),
    faqs: faqs.map((f) => ({
      question: f.question,
      section: f.section,
      href: `/faq`,
    })),
  });
}
