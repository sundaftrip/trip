/* Country-specific visa detail. Content remains CMS-driven while the
   presentation follows the public Atlas shell and mobile accessibility rules. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronDown, CheckCircle2, FileText, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { defaultOpenGraphImages, defaultTwitterImages } from "@/lib/site-metadata";
import { toWaNumber } from "@/lib/utils";
import { findBySlug } from "@/lib/visa-slug";
import {
  mergeVisaFaqs,
  VISA_PROTECTION_PATH,
  visaDefaultsForCountry,
  type VisaDocument,
  type VisaFaq,
} from "@/lib/visa-defaults";
import { FlagIcon } from "@/lib/flag-icon";
import TestimonialSection from "@/components/website/TestimonialSection";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import VisaConsultationForm from "../VisaConsultationForm";
import VisaDetailTabs from "../VisaDetailTabs";
import styles from "../VisaPages.module.css";

// ISR 5 menit: konten visa jarang berubah, force-dynamic bikin TTFB lambat
// & boros koneksi DB. Halaman ini tidak pakai cookies()/headers()/searchParams.
export const revalidate = 300;

type VisaKey = "bebas" | "voa" | "evisa" | "wajib" | "conditional";

const VISA_LABEL: Record<VisaKey, string> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
  conditional: "Bersyarat",
};

function isVisaKey(s: string): s is VisaKey {
  return s === "bebas" || s === "voa" || s === "evisa" || s === "wajib" || s === "conditional";
}

function isAssistedDocument(doc: VisaDocument) {
  const text = `${doc.name} ${doc.hint ?? ""}`.toLowerCase();
  return (
    text.includes("kami bantu") ||
    text.includes("booking akomodasi") ||
    text.includes("booking hotel") ||
    text.includes("bukti akomodasi")
  );
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
  if (!country) notFound();
  const summary = country.notes.replace(/^Layanan kami:\s*/i, "").slice(0, 140);
  // Suffix "· Sundaf Trip" TIDAK ditulis manual — root layout sudah punya
  // title template `%s · Sundaf Trip` (kalau ditulis lagi jadi dobel).
  const title = `Visa ${country.name} untuk WNI, Layanan Pengurusan`;
  const description = `Informasi & layanan pengurusan visa ${country.name} (${country.en}) untuk pemegang paspor Indonesia. ${summary}`;
  const pageUrl = `https://sundaftrip.com/visa/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    // Override OG agar share ke WhatsApp/IG menampilkan judul halaman ini,
    // bukan preview beranda (pola sama dengan /tours).
    openGraph: {
      title: `${title} · Sundaf Trip`,
      description,
      url: pageUrl,
      siteName: "Sundaf Trip",
      locale: "id_ID",
      type: "website",
      images: defaultOpenGraphImages(title),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Sundaf Trip`,
      description,
      images: defaultTwitterImages(),
    },
  };
}

export default async function VisaDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // FAQ tidak diambil dari tabel global Faq lagi, pertanyaan spesifik
  // (mis. "Berapa lama proses visa Rusia?") akan bocor ke semua halaman
  // negara. Sumber FAQ per-negara: country.faqs (Json di DB) atau
  // visaDefaultsForCountry(country) sebagai fallback.
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

  // Ekstrak "proses X hari/minggu/bulan" dari notes, buat badge, timeline,
  // dan FAQ fallback yang lebih spesifik per negara.
  const processMatch = country.notes.match(
    /proses\s+([\d–\-]+\s*(?:hari|minggu|bulan)(?:\s+kerja)?)/i,
  );
  const processTime = processMatch?.[1].trim() ?? null;

  const officialFee = country.officialFee?.trim() || null;
  const servicePrice = country.servicePrice?.trim() || null;
  const conditions = Array.isArray(country.conditions) ? country.conditions : [];

  // Eligibility / documents / faqs: pakai data per-negara kalau ada,
  // kalau kosong fallback ke template per-kategori visa yang dipersonalisasi.
  const defaults = visaDefaultsForCountry({
    category: country.visa,
    countryName: country.name,
    countryEnglishName: country.en,
    region: country.region,
    stay: country.stay,
    officialFee,
    servicePrice,
    processTime,
    conditions,
    notes: country.notes,
  });
  const eligibility =
    Array.isArray(country.eligibility) && country.eligibility.length > 0
      ? country.eligibility
      : defaults.eligibility;
  const docsRaw = (country.documents as unknown as VisaDocument[]) ?? [];
  const documents: VisaDocument[] =
    Array.isArray(docsRaw) && docsRaw.length > 0 ? docsRaw : defaults.documents;
  const faqsRaw = (country.faqs as unknown as VisaFaq[]) ?? [];
  let countryFaqs: VisaFaq[] =
    Array.isArray(faqsRaw) && faqsRaw.length > 0
      ? mergeVisaFaqs(defaults.faqs, faqsRaw)
      : defaults.faqs;

  const wa = toWaNumber(companyRows.find((r) => r.key === "company_whatsapp")?.value ?? "");
  const protectionWaHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        `Halo, saya ingin cek Asuransi Visa Protection untuk pengajuan visa ${country.name}.`,
      )}`
    : "";
  const rawTheme = companyRows.find((r) => r.key === "site_theme")?.value || "classic";
  const theme = rawTheme === "console" ? "atlas" : rawTheme;

  const visaKey: VisaKey = isVisaKey(country.visa) ? country.visa : "wajib";
  const visaLabel = VISA_LABEL[visaKey];

  const costRaw =
    country.servicePrice?.trim() || country.officialFee?.trim() || country.cost?.trim() || "Gratis";
  const isFree = costRaw === "Gratis";
  const costMain = costRaw.replace(/^mulai\s+/i, "");
  const verifiedLabel = formatVerified(country.lastVerifiedAt);

  // "Layanan kami: …" → buang prefiks, sisanya jadi paragraf layanan.
  const layananText = country.notes.replace(/^Layanan kami:\s*/i, "").trim();

  const isRussia = slug === "russia" || country.en.toLowerCase() === "russia";
  if (isRussia) {
    countryFaqs = russiaVisaFaqs(costMain, processTime, country.stay);
  }

  // FAQPage JSON-LD dari FAQ per-negara yang sama dengan yang dirender
  // sebagai <details> di bawah — bantu AI & Google AI Overviews
  // (pola sama dengan /visa/faq).
  const faqSchema =
    countryFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `https://sundaftrip.com/visa/${slug}#faqpage`,
          inLanguage: "id-ID",
          mainEntity: countryFaqs.map((f) => ({
            "@type": "Question" as const,
            name: f.question,
            acceptedAnswer: { "@type": "Answer" as const, text: f.answer },
          })),
        }
      : null;

  const serviceSchema =
    isRussia
      ? {
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": "https://sundaftrip.com/visa/russia#service",
          name: "Layanan Pengurusan Visa Rusia untuk WNI",
          serviceType: "Visa assistance",
          provider: { "@id": "https://sundaftrip.com#organization" },
          areaServed: { "@type": "Country", name: "Indonesia" },
          audience: {
            "@type": "Audience",
            audienceType: "Pemegang paspor Indonesia yang ingin berkunjung ke Rusia",
          },
          url: "https://sundaftrip.com/visa/russia",
          offers: {
            "@type": "Offer",
            price: costMain.replace(/\D/g, "") || undefined,
            priceCurrency: "IDR",
            availability: "https://schema.org/InStock",
            url: "https://sundaftrip.com/visa/russia",
          },
        }
      : null;

  return (
    <article className={`${styles.page} ${styles.detailPage}`}>
      <a className={styles.skipLink} href="#visa-detail-content">
        Lewati ke informasi visa
      </a>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
          { name: `Visa ${country.name}`, url: `/visa/${slug}` },
        ]}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {serviceSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      )}
      {/* ─── HERO ─── */}
      <section className={styles.detailHero} aria-labelledby="visa-country-title">
        <div className={styles.shell}>
          <Link href="/visa" className={styles.backLink}>
            <ChevronLeft size={16} aria-hidden="true" /> Semua negara
          </Link>

          <div className={styles.detailHeroGrid}>
            <FlagIcon
              flag={country.flag}
              label={`Bendera ${country.name}`}
              width={112}
              className={styles.detailFlag}
            />
            <div>
              <p className={styles.detailEyebrow}>{country.region}</p>
              <h1 className={styles.detailTitle} id="visa-country-title">
                Visa {country.name}
              </h1>
              <p className={styles.detailSubtitle}>
                Untuk pemegang paspor Indonesia &middot; {country.en}
              </p>
              <div className={styles.detailChips}>
                <span className={styles.detailChip}>{visaLabel}</span>
                <span className={styles.detailChip}>
                  Maks. tinggal: {country.stay}
                </span>
                {processTime && (
                  <span className={styles.detailChip}>
                    Estimasi proses: {processTime}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.detailMeta}>
              <p>
                {verifiedLabel
                  ? `Informasi terakhir diverifikasi ${verifiedLabel}.`
                  : "Konfirmasi kembali ketentuan sebelum pengajuan."}
              </p>
              <p>
                Persetujuan visa sepenuhnya menjadi kewenangan otoritas terkait.
              </p>
              {country.sourceUrl && (
                <a
                  className={styles.sourceLink}
                  href={country.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buka sumber resmi
                  <span className="sr-only">, membuka tab baru</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ANCHOR NAV ─── */}
      <VisaDetailTabs />

      {/* ─── CONTENT + STICKY PRICING ─── */}
      <div className={`${styles.shell} ${styles.detailGrid}`} id="visa-detail-content" tabIndex={-1}>
        <div className={styles.detailContent}>
          {/* OVERVIEW */}
          <section
            className={styles.detailSection}
            id="overview"
            aria-labelledby="overview-title"
          >
            <h2 id="overview-title" className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Ringkasan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {overviewText(visaKey, country.name, country.stay)}
            </p>
            {conditions.length > 0 && (
              <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  Kondisi penting
                </p>
                <ul className="mt-3 space-y-2">
                  {conditions.map((condition) => (
                    <li
                      key={condition}
                      className="flex items-start gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-500" />
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isRussia && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                  Jawaban singkat
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  WNI memerlukan visa untuk masuk ke Rusia. Sundaf Trip membantu pengurusan
                  e-Visa Rusia untuk pemegang paspor Indonesia, termasuk pengecekan dokumen,
                  pengajuan, dan arahan persiapan perjalanan.
                </p>
                <Link
                  href="/visa-rusia-wni"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-800 underline-offset-4 hover:underline dark:text-amber-200"
                >
                  Baca ringkasan visa Rusia untuk WNI <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </section>

          {/* ELIGIBILITY */}
          <section
            className={styles.detailSection}
            id="eligibility"
            aria-labelledby="eligibility-title"
          >
            <h2 id="eligibility-title" className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
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
          <section
            className={styles.detailSection}
            id="dokumen"
            aria-labelledby="documents-title"
          >
            <h2 id="documents-title" className="text-xl font-bold mb-1.5 text-gray-900 dark:text-white">
              Dokumen Wajib
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-2xl leading-relaxed">
              Kamu cukup siapkan dokumen pribadi. Yang bertanda
              {" "}<span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full align-middle"
                style={{
                  background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 10%, #fff)",
                  color: "color-mix(in srgb, var(--site-accent,#2d6a4f) 62%, #000)",
                }}
              ><CheckCircle2 size={11} /> Kami bantu</span>{" "}
             , seperti formulir, itinerary, dan booking akomodasi, Sundaf yang siapkan & susun. Kamu tidak mengerjakannya sendiri.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {documents.map((doc, i) => {
                const assisted = isAssistedDocument(doc);
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
                            style={{
                              background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 10%, #fff)",
                              color: "color-mix(in srgb, var(--site-accent,#2d6a4f) 62%, #000)",
                            }}
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
              className="group mt-4 flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{
                background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 12%, transparent)",
                border: "1.5px solid color-mix(in srgb, var(--site-accent,#2d6a4f) 55%, transparent)",
              }}
            >
              <span
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 10%, #fff)",
                  color: "color-mix(in srgb, var(--site-accent,#2d6a4f) 62%, #000)",
                }}
              >
                <HelpCircle size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-gray-900 dark:text-white">
                  Kasus khusus? Lihat FAQ Teknis Visa
                </span>
                <span className="block text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                  Cerai, anak di bawah 18, apostille, sponsor pasangan, rekening kecil
                </span>
              </span>
              <span
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 10%, #fff)",
                  color: "color-mix(in srgb, var(--site-accent,#2d6a4f) 62%, #000)",
                }}
              >
                Buka
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </span>
            </Link>
          </section>

          {/* LAYANAN */}
          <section
            className={styles.detailSection}
            id="layanan"
            aria-labelledby="service-title"
          >
            <h2 id="service-title" className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Layanan &amp; Harga
            </h2>
            {(officialFee || servicePrice) && (
              <dl className="mb-4 grid gap-3 sm:grid-cols-2">
                {officialFee && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600">
                      Biaya resmi
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {officialFee}
                    </dd>
                  </div>
                )}
                {servicePrice && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-600">
                      Harga layanan Sundaf
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {servicePrice}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {country.variants.length > 0 ? (
              <>
                <div className="space-y-3">
                  {country.variants.map((v) => {
                    const variantWa = wa
                      ? `https://wa.me/${wa}?text=${encodeURIComponent(
                          `Halo, saya tertarik dengan layanan visa ${country.name}, paket "${v.name}". Mohon dibantu cek persyaratan dan biaya terkini.`,
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
                              rel="noopener noreferrer"
                              className="shrink-0 min-h-11 inline-flex items-center px-3 py-2 rounded-lg text-white text-xs font-semibold transition hover:opacity-90"
                              style={{ background: "#075E54" }}
                            >
                              Tanya paket
                              <span className="sr-only">, membuka tab baru</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  Harga paket berasal dari data layanan saat ini. Tarif resmi dapat berubah;
                  konfirmasi rincian sebelum pengajuan.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{layananText}</p>
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  Biaya dan ketersediaan layanan dapat berubah. Tim akan mengonfirmasi
                  rincian sebelum dokumen diproses.
                </p>
              </>
            )}
          </section>

          {/* VISA PROTECTION */}
          <section
            className={styles.detailSection}
            id="protection"
            aria-labelledby="protection-title"
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <span className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
                  <ShieldCheck size={21} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                    Add-on terpisah
                  </p>
                  <h2 id="protection-title" className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    Asuransi Visa Protection
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    Untuk visa yang berisiko ditolak, Sundaf Trip dapat membantu screening
                    produk Visa Protection sebelum pengajuan. Manfaat bisa membantu mengurangi
                    kerugian biaya tertentu jika visa ditolak, tetapi hanya berlaku sesuai polis
                    dan tidak menjamin approval visa.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={VISA_PROTECTION_PATH}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                      style={{ background: "var(--site-accent,#2d6a4f)" }}
                    >
                      Pelajari Visa Protection <ArrowRight size={15} aria-hidden />
                    </Link>
                    {protectionWaHref && (
                      <a
                        href={protectionWaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950"
                      >
                        Cek kecocokan polis
                        <span className="sr-only">, membuka tab baru</span>
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-amber-800/80 dark:text-amber-200/80">
                    Ketersediaan, premi, manfaat, dan pengecualian mengikuti negara tujuan,
                    durasi, usia, profil perjalanan, dan ketentuan perusahaan asuransi.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* PROSES */}
          <section
            className={styles.detailSection}
            id="proses"
            aria-labelledby="process-title"
          >
            <h2 id="process-title" className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Proses Pengurusan
            </h2>
            <ol className="relative space-y-3 text-sm">
              {[
                "Konsultasi via WhatsApp, pilih jenis layanan sesuai kebutuhan",
                "Kirim dokumen scan via WhatsApp atau email",
                "Untuk visa yang butuh paspor fisik (mis. Eropa & Amerika): antar paspor ke kantor kami, atau cukup kirim via Gojek, tim kami yang terima",
                "Tim kami review dokumen & ajukan ke konsulat/sistem online",
                processTime
                  ? `Pantau hasil permohonan dengan estimasi proses ${processTime}`
                  : "Pantau hasil permohonan sesuai estimasi otoritas terkait",
                "Jika proses selesai, dokumen dikembalikan sesuai metode yang sudah disepakati",
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
          <section
            className={styles.detailSection}
            id="faq"
            aria-labelledby="country-faq-title"
          >
            <h2 id="country-faq-title" className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              FAQ
            </h2>
            <div className={styles.faqList}>
              {countryFaqs.map((f, i) => (
                <details
                  key={`country-${i}`}
                  className={styles.faqItem}
                >
                  <summary className={styles.faqSummary}>
                    <span>{f.question}</span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                    />
                  </summary>
                  <div className={styles.faqAnswer}>
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Ulasan layanan visa (category="visa") dirender full-width
              di bawah grid, lihat <TestimonialSection> setelah </aside>. */}
        </div>

        {/* STICKY ORDER FORM */}
        <aside
          className={styles.orderAside}
          aria-label={`Konsultasi visa ${country.name}`}
        >
          <VisaConsultationForm
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
      return `Pemegang paspor Indonesia tercatat bebas visa untuk masuk ${name} dengan masa tinggal maksimal ${stay}. Bebas visa bukan berarti bebas syarat: petugas imigrasi dapat meminta tiket pulang-pergi, bukti akomodasi, dana yang cukup, atau dokumen pendukung lain. Tim dapat membantu menyiapkan rencana perjalanan dan mengecek kelengkapan sebelum berangkat.`;
    case "voa":
      return `${name} menyediakan jalur Visa on Arrival (VOA) untuk pemegang paspor Indonesia dengan masa tinggal maksimal ${stay}. Proses dilakukan saat kedatangan dan tetap mengikuti pemeriksaan petugas imigrasi. Tim dapat membantu menjelaskan dokumen pelengkap dan syarat yang tercatat.`;
    case "evisa":
      return `Visa ${name} diajukan secara elektronik sebelum keberangkatan dengan masa tinggal maksimal ${stay}. Tim dapat membantu mengecek dokumen dan memproses pengajuan melalui kanal yang berlaku. Hasil permohonan tetap ditentukan oleh otoritas terkait.`;
    case "wajib":
      return `Visa ${name} perlu diajukan sebelum berangkat melalui kanal resmi yang berlaku. Masa tinggal mengikuti visa yang diberikan. Tim dapat membantu pengecekan formulir, penjadwalan bila diperlukan, dan alur penyerahan dokumen tanpa menjanjikan persetujuan.`;
    case "conditional":
      return `Aturan masuk ${name} bersyarat untuk pemegang paspor Indonesia. Sebagian traveler bisa memakai jalur bebas visa, waiver, e-Visa, atau ETA jika memenuhi kondisi tertentu; di luar kondisi itu, visa reguler tetap perlu disiapkan. Masa tinggal yang ditampilkan: ${stay}.`;
  }
}

function formatVerified(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function russiaVisaFaqs(costLabel: string, processTime: string | null, stay: string): VisaFaq[] {
  return [
    {
      question: "Apakah WNI perlu visa untuk ke Rusia?",
      answer:
        "Ya. Pemegang paspor Indonesia perlu visa untuk masuk ke Rusia. Untuk perjalanan wisata tertentu, WNI dapat mengajukan e-Visa Rusia jika memenuhi syarat yang berlaku.",
    },
    {
      question: "Apakah Sundaf Trip membantu pengurusan visa Rusia?",
      answer:
        "Ya. Sundaf Trip membantu pengurusan e-Visa Rusia untuk WNI, termasuk pengecekan dokumen, pengisian pengajuan, dan arahan persiapan sebelum keberangkatan.",
    },
    {
      question: "Berapa biaya layanan visa Rusia di Sundaf Trip?",
      answer: `Biaya layanan e-Visa Rusia yang ditampilkan di situs Sundaf Trip adalah ${costLabel}. Harga dapat berubah, jadi calon traveler sebaiknya konfirmasi ulang sebelum pengajuan.`,
    },
    {
      question: "Berapa lama proses e-Visa Rusia?",
      answer: `Estimasi proses e-Visa Rusia yang ditampilkan di situs Sundaf Trip adalah ${processTime ?? "mengikuti estimasi sistem pengajuan"}. Untuk perjalanan yang sudah dekat, sebaiknya konsultasi lebih awal agar ada waktu koreksi dokumen.`,
    },
    {
      question: "Berapa lama masa tinggal dengan e-Visa Rusia?",
      answer: `Masa tinggal yang ditampilkan di halaman Sundaf Trip adalah ${stay}. Aturan visa dapat berubah, sehingga detail final perlu dikonfirmasi sebelum pengajuan.`,
    },
    {
      question: "Kalau e-Visa Rusia ditolak, apakah biaya bisa kembali?",
      answer: `Biaya resmi dan biaya layanan tidak otomatis refundable setelah proses berjalan. Jika ingin mengurangi risiko biaya saat visa ditolak, cek dulu Asuransi Visa Protection di ${VISA_PROTECTION_PATH}. Manfaat hanya berlaku sesuai polis dan harus dibeli sebelum pengajuan, bukan setelah ada indikasi penolakan.`,
    },
  ];
}
