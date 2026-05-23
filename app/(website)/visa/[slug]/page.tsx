/* Halaman detail visa per-negara, terinspirasi spun.global.
   Layout: hero hitam + flag besar + badges, anchor nav sticky desktop,
   konten 2-kolom (sections kiri + sticky pricing card kanan), bottom CTA. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronDown, MessageCircle, CheckCircle2, FileText } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import { visaSlug, findBySlug } from "@/lib/visa-slug";
import { visaDefaults, type VisaDocument, type VisaFaq } from "@/lib/visa-defaults";

export const dynamic = "force-dynamic";

type VisaKey = "bebas" | "voa" | "evisa" | "wajib";

const VISA_LABEL: Record<VisaKey, string> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
};

const VISA_BADGE: Record<VisaKey, string> = {
  bebas: "bg-emerald-100 text-emerald-700",
  voa: "bg-blue-100 text-blue-700",
  evisa: "bg-amber-100 text-amber-700",
  wajib: "bg-rose-100 text-rose-700",
};

function isVisaKey(s: string): s is VisaKey {
  return s === "bebas" || s === "voa" || s === "evisa" || s === "wajib";
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const countries = await prisma.countryVisa.findMany({
    select: { name: true, en: true, notes: true },
  });
  const country = findBySlug(countries, slug);
  if (!country) return { title: "Visa tidak ditemukan" };
  const summary = country.notes.replace(/^Layanan kami:\s*/i, "").slice(0, 140);
  return {
    title: `Visa ${country.name} untuk WNI — Layanan Pengurusan | Sundaf Trip`,
    description: `Informasi & layanan pengurusan visa ${country.name} (${country.en}) untuk pemegang paspor Indonesia. ${summary}`,
  };
}

export default async function VisaDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [countries, faqs, testimonials, companyRows] = await Promise.all([
    prisma.countryVisa.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.faq.findMany({
      where: { active: true, section: { contains: "Visa" } },
      orderBy: { order: "asc" },
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.companyInfo.findMany({ where: { key: "company_whatsapp" } }),
  ]);

  const country = findBySlug(countries, slug);
  if (!country) notFound();

  // Eligibility / documents / faqs: pakai data per-negara kalau ada,
  // kalau kosong fallback ke template per-kategori visa.
  const defaults = visaDefaults(country.visa);
  const eligibility =
    Array.isArray(country.eligibility) && country.eligibility.length > 0
      ? country.eligibility
      : defaults.eligibility;
  const docsRaw = (country.documents as unknown as VisaDocument[]) ?? [];
  const documents: VisaDocument[] =
    Array.isArray(docsRaw) && docsRaw.length > 0 ? docsRaw : defaults.documents;
  const faqsRaw = (country.faqs as unknown as VisaFaq[]) ?? [];
  const countryFaqs: VisaFaq[] =
    Array.isArray(faqsRaw) && faqsRaw.length > 0 ? faqsRaw : defaults.faqs;

  const wa = toWaNumber(companyRows.find((r) => r.key === "company_whatsapp")?.value ?? "");
  const waMessage = `Halo, saya ingin tanya layanan visa ${country.name}.`;
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(waMessage)}` : "";

  const visaKey: VisaKey = isVisaKey(country.visa) ? country.visa : "wajib";
  const visaLabel = VISA_LABEL[visaKey];
  const visaBadge = VISA_BADGE[visaKey];

  const costRaw = country.cost?.trim() || "Gratis";
  const isFree = costRaw === "Gratis";
  const costStartsWithMulai = /^mulai\s+/i.test(costRaw);
  const costMain = costRaw.replace(/^mulai\s+/i, "");

  // "Layanan kami: …" → buang prefiks, sisanya jadi paragraf layanan.
  const layananText = country.notes.replace(/^Layanan kami:\s*/i, "").trim();

  // Ekstrak "proses X hari/minggu/bulan" dari notes — buat badge & timeline.
  const processMatch = country.notes.match(
    /proses\s+([\d–\-]+\s*(?:hari|minggu|bulan)(?:\s+kerja)?)/i,
  );
  const processTime = processMatch?.[1].trim() ?? null;

  return (
    <article className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
      {/* ─── HERO ─── */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black text-white py-10 sm:py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/visa"
            className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={14} aria-hidden /> Database Visa
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7">
            <div className="text-7xl sm:text-8xl leading-none shrink-0" aria-hidden>
              {country.flag}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1.5">
                {country.region}
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold mb-2 leading-tight">
                Visa {country.name}
              </h1>
              <p className="text-sm sm:text-base text-white/60 mb-5">
                {country.en} &middot; untuk pemegang paspor Indonesia
              </p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${visaBadge}`}
                >
                  {visaLabel}
                </span>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                  Maks. tinggal: {country.stay}
                </span>
                {processTime && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                    Proses: {processTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ANCHOR NAV (desktop) ─── */}
      <nav className="sticky top-20 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex gap-5 text-sm font-medium overflow-x-auto">
            {[
              ["#overview", "Overview"],
              ["#eligibility", "Kelayakan"],
              ["#dokumen", "Dokumen"],
              ["#layanan", "Layanan & Harga"],
              ["#proses", "Proses"],
              ["#faq", "FAQ"],
              ["#ulasan", "Ulasan"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-current transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ─── CONTENT + STICKY PRICING ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
        <main className="space-y-12 min-w-0">
          {/* OVERVIEW */}
          <section id="overview">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Overview</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {overviewText(visaKey, country.name, country.stay)}
            </p>
          </section>

          {/* ELIGIBILITY */}
          <section id="eligibility">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Syarat Kelayakan
            </h2>
            <ul className="space-y-2">
              {eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* DOKUMEN */}
          <section id="dokumen">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Dokumen Wajib
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
                >
                  <FileText
                    size={16}
                    className="text-gray-400 shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {doc.name}
                    </p>
                    {doc.hint && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                        {doc.hint}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Daftar standar — beberapa negara mungkin minta dokumen tambahan. Tim kami konfirmasi sebelum pengajuan.
            </p>
          </section>

          {/* LAYANAN */}
          <section id="layanan">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Layanan &amp; Harga
            </h2>
            {country.variants.length > 0 ? (
              <>
                <div className="space-y-3">
                  {country.variants.map((v) => {
                    const variantWa = wa
                      ? `https://wa.me/${wa}?text=${encodeURIComponent(
                          `Halo, saya ingin pesan visa ${country.name} — paket "${v.name}".`,
                        )}`
                      : "";
                    const priceLabel =
                      typeof v.priceIDR === "number" && v.priceIDR > 0
                        ? `Rp ${v.priceIDR.toLocaleString("id-ID")}`
                        : "Tanya Harga";
                    return (
                      <div
                        key={v.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">{v.name}</p>
                          {(v.processingTime || v.notes) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {[v.processingTime, v.notes].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white whitespace-nowrap">
                            {priceLabel}
                          </span>
                          {variantWa && (
                            <a
                              href={variantWa}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 px-3 py-2 rounded-lg text-white text-xs font-semibold transition hover:opacity-90"
                              style={{ background: "#25D366" }}
                            >
                              Pesan
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  Harga sudah termasuk biaya layanan kami. Tarif kedutaan bisa berubah sewaktu-waktu — konfirmasi sebelum pengajuan.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{layananText}</p>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  Harga sudah termasuk biaya layanan kami. Tarif kedutaan bisa berubah sewaktu-waktu — konfirmasi sebelum pengajuan.
                </p>
              </>
            )}
          </section>

          {/* PROSES */}
          <section id="proses">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Proses Pengurusan
            </h2>
            <ol className="space-y-3 text-sm">
              {[
                "Konsultasi via WhatsApp — pilih jenis layanan sesuai kebutuhan",
                "Kirim dokumen scan via WhatsApp atau email",
                "Tim kami review dokumen & ajukan ke konsulat/sistem online",
                processTime
                  ? `Visa terbit dalam ${processTime}`
                  : "Visa terbit sesuai estimasi konsulat",
                "Visa diantar ke alamatmu atau ambil di kantor kami",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ — per-negara (atau default kategori), plus global Visa FAQ di bawah */}
          <section id="faq">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">FAQ</h2>
            <div className="space-y-3">
              {countryFaqs.map((f, i) => (
                <details
                  key={`country-${i}`}
                  className="group border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900"
                >
                  <summary className="cursor-pointer list-none p-4 font-semibold text-sm flex items-center justify-between gap-3 text-gray-900 dark:text-white">
                    <span>{f.question}</span>
                    <ChevronDown
                      size={16}
                      className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                    {f.answer}
                  </div>
                </details>
              ))}
              {faqs.map((f) => (
                <details
                  key={f.id}
                  className="group border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900"
                >
                  <summary className="cursor-pointer list-none p-4 font-semibold text-sm flex items-center justify-between gap-3 text-gray-900 dark:text-white">
                    <span>{f.question}</span>
                    <ChevronDown
                      size={16}
                      className="shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* ULASAN */}
          {testimonials.length > 0 && (
            <section id="ulasan">
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                Ulasan Pelanggan
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {t.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-9 h-9 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200">
                          {t.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {t.name}
                        </p>
                        {t.role && <p className="text-xs text-gray-400 truncate">{t.role}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* STICKY PRICING CARD */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">
              {costStartsWithMulai ? "Mulai dari" : "Biaya"}
            </p>
            <p
              className={`text-3xl font-bold mb-1 ${
                isFree ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
              }`}
            >
              {costMain}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              {isFree
                ? "Tidak perlu visa untuk WNI"
                : "Sudah termasuk biaya layanan Sundaf Trip"}
            </p>

            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-6">
              {[
                "Dokumen di-review tim profesional",
                "Update progress via WhatsApp",
                "Antar/jemput dokumen Jabodetabek",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500 shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center px-5 py-3.5 rounded-xl text-white font-semibold transition hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#25D366" }}
              >
                Pesan via WhatsApp
              </a>
            ) : (
              <p className="text-center text-xs text-gray-400">
                Nomor WhatsApp belum di-set di CMS.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* BOTTOM CTA STRIP */}
      {waLink && (
        <section className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-10 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Siap urus visa {country.name}?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tim kami siap bantu dari konsultasi sampai visa terbit.
              </p>
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold transition hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#25D366" }}
            >
              <MessageCircle size={16} aria-hidden /> Mulai Konsultasi
            </a>
          </div>
        </section>
      )}
    </article>
  );
}

function overviewText(visa: VisaKey, name: string, stay: string): string {
  switch (visa) {
    case "bebas":
      return `Pemegang paspor Indonesia BEBAS VISA masuk ${name} dengan masa tinggal maksimal ${stay}. Cukup paspor berlaku min. 6 bulan, tiket pulang, dan bukti akomodasi. Tim kami siap bantu kalau kamu butuh dokumen pendamping atau itinerary terpercaya.`;
    case "voa":
      return `${name} memberikan Visa on Arrival (VOA) untuk pemegang paspor Indonesia. Visa diberikan saat tiba di bandara atau border, masa tinggal maksimal ${stay}. Layanan kami: bantu siapkan dokumen pelengkap dan informasi syarat terkini.`;
    case "evisa":
      return `Visa ${name} diurus secara elektronik (e-Visa) — diajukan online sebelum keberangkatan. Masa tinggal maksimal ${stay}. Tim kami yang uruskan pengajuan e-Visa-nya, kamu cukup kirim dokumen via WhatsApp dan tunggu visa elektronik terbit di email.`;
    case "wajib":
      return `Visa ${name} wajib diajukan terlebih dahulu sebelum berangkat — biasanya via kedutaan atau VFS Global. Masa tinggal sesuai visa yang diberikan. Tim kami dampingi seluruh proses: dari pengisian formulir, jadwal interview, sampai pengantaran paspor.`;
  }
}

