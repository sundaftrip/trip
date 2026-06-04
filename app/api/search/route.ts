import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visaSlug } from "@/lib/visa-slug";

/* Pencarian global untuk modal search di navbar.
   Hasil terkelompok: tour, layanan visa, pertanyaan (FAQ).
   Tour: cocok via judul/negara/kota/deskripsi DAN isi itinerary, plus
   kata intent ("tersedia/aktif/upcoming") -> tampilkan tour aktif. */

const ACTIVE_WORDS = ["tersedia", "aktif", "available", "active", "upcoming", "ada"];

function norm(s: string) {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (raw.length < 2) {
    return NextResponse.json({ tours: [], visa: [], faqs: [] });
  }

  const q = norm(raw);
  const tokens = q.split(/\s+/).filter(Boolean);
  const wantActive = tokens.some((t) => ACTIVE_WORDS.includes(t));
  const contentTokens = tokens.filter((t) => !ACTIVE_WORDS.includes(t));
  const like = { contains: raw, mode: "insensitive" as const };
  const now = new Date();

  const [allTours, visa, faqs] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { not: "DRAFT" } },
      select: {
        id: true, slug: true, title: true, country: true, cityHighlight: true,
        duration: true, description: true, itinerary: true, status: true, tripDate: true,
      },
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

  const tours = allTours
    .map((t) => {
      const itinText = Array.isArray(t.itinerary)
        ? (t.itinerary as { title?: string; description?: string }[])
            .map((d) => `${d?.title ?? ""} ${d?.description ?? ""}`).join(" ")
        : "";
      const haystack = norm([t.title, t.country, t.cityHighlight, t.duration, t.description, itinText].join(" "));
      const expired = !!t.tripDate && t.tripDate < now;
      const isActive = !expired && t.status === "ACTIVE";
      return { t, haystack, expired, isActive };
    })
    .filter(({ haystack, isActive }) => {
      const textMatch = contentTokens.length === 0 || contentTokens.every((tok) => haystack.includes(tok));
      if (wantActive) return isActive && textMatch;
      return textMatch;
    })
    .sort((a, b) => {
      const rank = (x: typeof a) => (x.expired ? 2 : x.isActive ? 0 : 1);
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const ta = a.t.tripDate ? a.t.tripDate.getTime() : 0;
      const tb = b.t.tripDate ? b.t.tripDate.getTime() : 0;
      return a.expired ? tb - ta : ta - tb; // aktif: terdekat dulu; selesai: terbaru dulu
    })
    .slice(0, 6)
    .map(({ t, expired, isActive }) => {
      const statusLabel = expired
        ? "Selesai"
        : t.status === "FULL" ? "Penuh"
        : t.status === "CANCELLED" ? "Dibatalkan"
        : "Tersedia";
      return {
        title: t.title,
        country: t.country,
        href: `/tours/${t.slug ?? t.id}`,
        statusLabel,
        active: isActive,
        dateLabel: t.tripDate ? dateFmt.format(t.tripDate) : null,
      };
    });

  return NextResponse.json({
    tours,
    visa: visa.map((v) => ({ name: v.name, en: v.en, href: `/visa/${visaSlug(v.en)}` })),
    faqs: faqs.map((f) => ({ question: f.question, section: f.section, href: `/faq` })),
  });
}
