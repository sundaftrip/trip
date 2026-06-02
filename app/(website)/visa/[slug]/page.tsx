/* Halaman detail visa per-negara, terinspirasi spun.global.
   Layout: hero hitam + flag besar + badges, anchor nav sticky desktop,
   konten 2-kolom (sections kiri + sticky pricing card kanan), bottom CTA. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronDown, CheckCircle2, FileText, HelpCircle, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import { visaSlug, findBySlug } from "@/lib/visa-slug";
import { visaDefaults, type VisaDocument, type VisaFaq } from "@/lib/visa-defaults";
import { FlagIcon } from "@/lib/flag-icon";
import VisaOrderForm from "@/components/website/VisaOrderForm";
import TestimonialSection from "@/components/website/TestimonialSection";

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
    title: `Visa ${country.name} untuk WNI, Layanan Pengurusan | Sundaf Trip`,
    description: `Informasi & layanan pengurusan visa ${country.name} (${country.en}) untuk pemegang paspor Indonesia. ${summary}`,
  };
}

export default async function VisaDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // FAQ tidak diambil dari tabel global Faq lagi, pertanyaan spesifik
  // (mis. "Berapa lama proses visa Rusia?") akan bocor ke semua halaman
  // negara. Sumber FAQ per-negara: country.faqs (Json di DB) atau
  // visaDefaults(category) sebagai fallback.
  // Testimonial: hanya ulasan kategori "visa" (layanan pengurusan visa),
  // BUKAN ulasan trip rombongan, supaya relevan & tidak misleading.
  const [countries, companyRows, testimonials] = await Promise.all([
    prisma.countryVisa.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "site_theme"] } } }),
    prisma.testimonial.findMany({
      where: { published: true, category: "visa" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
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
  const rawTheme = companyRows.find((r) => r.key === "site_theme")?.value || "classic";
  const theme = rawTheme === "console" ? "atlas" : rawTheme;

  const visaKey: VisaKey = isVisaKey(country.visa) ? country.visa : "wajib";
  const visaLabel = VISA_LABEL[visaKey];
  const visaBadge = VISA_BADGE[visaKey];

  const costRaw = country.cost?.trim() || "Gratis";
  const isFree = costRaw === "Gratis";
  const costStartsWithMulai = /^mulai\s+/i.test(costRaw);
  const costMain = costRaw.replace(/^mulai\s+/i, "");

  // "Layanan kami: …" → buang prefiks, sisanya jadi paragraf layanan.
  const layananText = country.notes.replace(/^Layanan kami:\s*/i, "").trim();

  // Ekstrak "proses X hari/minggu/bulan" dari notes, buat badge & timeline.
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
            <FlagIcon
              flag={country.flag}
              rounded
              label={`Bendera ${country.name}`}
              width={112}
              className="shadow-2xl ring-1 ring-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1.5">
                {country.region}
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold mb-2 leading-tight">
                Visa {country.name}
              </h1>
              <p className="text-sm sm:text-base text-white/60 mb-5">
                Untuk pemegang paspor Indonesia &middot; {country.en}
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
            <h2 className="text-xl font-bold mb-1.5 text-gray-900 dark:text-white">
              Dokumen Wajib
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-2xl leading-relaxed">
              Kamu cukup siapkan dokumen pribadi. Yang bertanda
              {" "}<span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full align-middle"
                style={{ background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 16%, transparent)", color: "var(--site-accent-ink,#2d6a4f)" }}
              ><CheckCircle2 size={11} /> Kami bantu</span>{" "}
             , seperti formulir & itinerary, Sundaf yang siapkan & susun. Kamu tidak mengerjakannya sendiri.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {documents.map((doc, i) => {
                const assisted = (doc.hint ?? "").toLowerCase().includes("kami bantu");
                return (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {doc.name}
                        </p>
                        {assisted && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 16%, transparent)", color: "var(--site-accent-ink,#2d6a4f)" }}
                          >
                            <CheckCircle2 size={10} /> Kami bantu
                          </span>
                        )}
                      </div>
                      {doc.hint && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                          {doc.hint}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              Daftar standar, beberapa negara mungkin minta dokumen tambahan. Tim kami konfirmasi sebelum pengajuan.
            </p>

            {/* CTA ke FAQ teknis untuk kasus-kasus khusus */}
            <Link
              href="/visa/faq"
              className="group mt-4 flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 12%, transparent)",
                border: "1.5px solid color-mix(in srgb, var(--site-accent,#2d6a4f) 55%, transparent)",
              }}
            >
              <span
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 22%, transparent)", color: "var(--site-accent-ink,#2d6a4f)" }}
              >
                <HelpCircle size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-gray-900 dark:text-white">
                  Kasus khusus? Lihat FAQ Teknis Visa
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Cerai, anak di bawah 18, apostille, sponsor pasangan, rekening kecil
                </span>
              </span>
              <span
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full"
                style={{ background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 22%, transparent)", color: "var(--site-accent-ink,#2d6a4f)" }}
              >
                Buka
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
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
                          `Halo, saya ingin pesan visa ${country.name}, paket "${v.name}".`,
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
                  Harga sudah termasuk biaya layanan kami. Tarif kedutaan bisa berubah sewaktu-waktu, konfirmasi sebelum pengajuan.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{layananText}</p>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  Harga sudah termasuk biaya layanan kami. Tarif kedutaan bisa berubah sewaktu-waktu, konfirmasi sebelum pengajuan.
                </p>
              </>
            )}
          </section>

          {/* PROSES */}
          <section id="proses">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Proses Pengurusan
            </h2>
            <ol className="relative space-y-3 text-sm">
              {[
                "Konsultasi via WhatsApp, pilih jenis layanan sesuai kebutuhan",
                "Kirim dokumen scan via WhatsApp atau email",
                "Untuk visa yang butuh paspor fisik (mis. Eropa & Amerika): antar paspor ke kantor kami, atau cukup kirim via Gojek, tim kami yang terima",
                "Tim kami review dokumen & ajukan ke konsulat/sistem online",
                processTime
                  ? `Visa terbit dalam ${processTime}`
                  : "Visa terbit sesuai estimasi konsulat",
                "Paspor + visa bisa diambil langsung di kantor kami, atau kami kirim via Gojek/kurir ke alamatmu",
              ].map((step, i, arr) => (
                <li key={i} className="relative flex gap-3">
                  {i < arr.length - 1 && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-[8px] top-[14px] -bottom-5 w-3"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='18'%3E%3Cpath%20d='M6%200%20C10%204.5%202%2013.5%206%2018'%20fill='none'%20stroke='%2300ADB5'%20stroke-width='2'%20stroke-linecap='round'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "repeat-y",
                        backgroundPosition: "center top",
                        opacity: 0.55,
                      }}
                    />
                  )}
                  <span className="relative z-10 shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ, per-negara dari CMS, atau fallback default per-kategori. */}
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
            </div>
          </section>

          {/* Ulasan layanan visa (category="visa") dirender full-width
              di bawah grid, lihat <TestimonialSection> setelah </aside>. */}
        </main>

        {/* STICKY ORDER FORM */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <VisaOrderForm
            countryName={country.name}
            waNumber={wa}
            variants={country.variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceIDR: v.priceIDR,
              processingTime: v.processingTime,
            }))}
            fallbackCostLabel={costMain}
            fallbackIsFree={isFree}
          />
        </aside>
      </div>

      {/* ULASAN LAYANAN VISA, hanya testimoni category="visa" */}
      <TestimonialSection items={testimonials} theme={theme} />
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
      return `Visa ${name} diurus secara elektronik (e-Visa), diajukan online sebelum keberangkatan. Masa tinggal maksimal ${stay}. Tim kami yang uruskan pengajuan e-Visa-nya, kamu cukup kirim dokumen via WhatsApp dan tunggu visa elektronik terbit di email.`;
    case "wajib":
      return `Visa ${name} wajib diajukan terlebih dahulu sebelum berangkat, biasanya via kedutaan atau VFS Global. Masa tinggal sesuai visa yang diberikan. Tim kami dampingi seluruh proses: dari pengisian formulir, jadwal interview, sampai pengantaran paspor.`;
  }
}

