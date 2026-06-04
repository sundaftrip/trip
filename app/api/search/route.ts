import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visaSlug, similarity } from "@/lib/visa-slug";

/* Pencarian global untuk modal search di navbar.
   Hasil terkelompok: tour, layanan visa, pertanyaan (FAQ).
   - Tour cocok via judul/negara/kota/deskripsi DAN isi itinerary
   - Kata intent ("tersedia/aktif/upcoming") -> tampilkan tour aktif
   - Toleran typo (fuzzy) + saran "mungkin maksud Anda" ala Google */

const ACTIVE_WORDS = ["tersedia", "aktif", "available", "active", "upcoming", "ada"];
const FUZZY = 0.8; // ambang kemiripan untuk toleransi typo

function norm(s: string) {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function words(s: string) {
  return norm(s).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length >= 3);
}

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (raw.length < 2) {
    return NextResponse.json({ tours: [], visa: [], faqs: [], suggestion: null });
  }

  const q = norm(raw);
  const tokens = q.split(/\s+/).filter(Boolean);
  const wantActive = tokens.some((t) => ACTIVE_WORDS.includes(t));
  const contentTokens = tokens.filter((t) => !ACTIVE_WORDS.includes(t));
  const like = { contains: raw, mode: "insensitive" as const };
  const now = new Date();

  const [allTours, allVisa, faqs] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { not: "DRAFT" } },
      select: {
        id: true, slug: true, title: true, country: true, cityHighlight: true,
        duration: true, description: true, itinerary: true, status: true, tripDate: true,
      },
    }),
    prisma.countryVisa.findMany({ select: { name: true, en: true } }),
    prisma.faq.findMany({
      where: { active: true, OR: [{ question: like }, { answer: like }] },
      select: { id: true, question: true, section: true },
      orderBy: [{ section: "asc" }, { order: "asc" }],
      take: 6,
    }),
  ]);

  // Kosakata untuk saran ejaan ("mungkin maksud Anda")
  const vocab = new Map<string, string>(); // norm -> original
  const addVocab = (text: string) => {
    norm(text).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).forEach((w, i, arr) => {
      // simpan dengan kapitalisasi dari teks asli kalau bisa
      if (w.length >= 4 && !vocab.has(w)) vocab.set(w, capitalize(arr[i] ?? w));
    });
  };
  // token matcher toleran typo
  const matchToken = (hayWords: string[], tok: string): number => {
    if (tok.length < 4) return hayWords.some((w) => w.includes(tok) || tok.includes(w)) ? 1 : 0;
    let best = 0;
    for (const w of hayWords) {
      if (w.includes(tok) || tok.includes(w)) return 1;
      if (Math.abs(w.length - tok.length) <= 2) best = Math.max(best, similarity(tok, w));
    }
    return best;
  };

  const toursPrepared = allTours.map((t) => {
    const itinText = Array.isArray(t.itinerary)
      ? (t.itinerary as { title?: string; description?: string }[])
          .map((d) => `${d?.title ?? ""} ${d?.description ?? ""}`).join(" ")
      : "";
    const blob = [t.title, t.country, t.cityHighlight, t.duration, t.description, itinText].join(" ");
    addVocab(blob);
    return {
      t,
      hayStr: norm(blob),
      hayWords: Array.from(new Set(words(blob))),
      expired: !!t.tripDate && t.tripDate < now,
      isActive: !(t.tripDate && t.tripDate < now) && t.status === "ACTIVE",
    };
  });
  allVisa.forEach((v) => { addVocab(v.name); addVocab(v.en); });

  // Apakah tiap token cocok (substring/fuzzy) di seluruh korpus? Untuk deteksi typo.
  let anyTypo = false;
  for (const tok of contentTokens) {
    const exactSomewhere = toursPrepared.some((p) => p.hayStr.includes(tok)) ||
      allVisa.some((v) => norm(v.name).includes(tok) || norm(v.en).includes(tok));
    if (!exactSomewhere) anyTypo = true;
  }

  // Saran ejaan: kata kosakata terdekat untuk token typo terpanjang
  let suggestion: string | null = null;
  if (anyTypo && contentTokens.length) {
    const typoTok = [...contentTokens].sort((a, b) => b.length - a.length)[0];
    let bestW = "", bestScore = 0;
    for (const [nw, orig] of vocab) {
      if (Math.abs(nw.length - typoTok.length) > 3) continue;
      const s = similarity(typoTok, nw);
      if (s > bestScore) { bestScore = s; bestW = orig; }
    }
    if (bestScore >= FUZZY && norm(bestW) !== typoTok) suggestion = bestW;
  }

  const tours = toursPrepared
    .filter(({ hayStr, hayWords, isActive }) => {
      const textMatch = contentTokens.length === 0 || contentTokens.every((tok) => {
        if (hayStr.includes(tok)) return true;
        const m = matchToken(hayWords, tok);
        return m === 1 || m >= FUZZY;
      });
      if (wantActive) return isActive && textMatch;
      return textMatch;
    })
    .sort((a, b) => {
      const rank = (x: typeof a) => (x.expired ? 2 : x.isActive ? 0 : 1);
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const ta = a.t.tripDate ? a.t.tripDate.getTime() : 0;
      const tb = b.t.tripDate ? b.t.tripDate.getTime() : 0;
      return a.expired ? tb - ta : ta - tb;
    })
    .slice(0, 6)
    .map(({ t, expired, isActive }) => ({
      title: t.title,
      country: t.country,
      href: `/tours/${t.slug ?? t.id}`,
      statusLabel: expired ? "Selesai" : t.status === "FULL" ? "Penuh" : t.status === "CANCELLED" ? "Dibatalkan" : "Tersedia",
      active: isActive,
      dateLabel: t.tripDate ? dateFmt.format(t.tripDate) : null,
    }));

  // Visa: substring atau fuzzy (toleran typo nama negara)
  const visa = allVisa
    .map((v) => {
      const nn = norm(v.name), ne = norm(v.en);
      let score = 0;
      if (nn.includes(q) || ne.includes(q)) score = 1;
      else score = Math.max(similarity(q, nn), similarity(q, ne));
      return { v, score };
    })
    .filter((x) => x.score >= FUZZY)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ v }) => ({ name: v.name, en: v.en, href: `/visa/${visaSlug(v.en)}` }));

  // Saran hanya relevan kalau hasil eksak kosong tapi typo terdeteksi
  const totalExact = tours.length + visa.length;
  return NextResponse.json({
    tours,
    visa,
    faqs: faqs.map((f) => ({ question: f.question, section: f.section, href: `/faq` })),
    suggestion: totalExact > 0 && !anyTypo ? null : suggestion,
  });
}

function capitalize(w: string) {
  return w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}
