import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";

export const revalidate = 300;

const SITE_URL = "https://sundaftrip.com";
const CANONICAL = `${SITE_URL}/visa/asuransi-visa-protection`;

export const metadata: Metadata = {
  title: "Asuransi Visa Protection untuk Risiko Visa Ditolak",
  description:
    "Screening Asuransi Visa Protection untuk membantu mengurangi risiko biaya saat visa ditolak. Premi terpisah, manfaat mengikuti polis, dan bukan jaminan visa disetujui.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Asuransi Visa Protection untuk Risiko Visa Ditolak · Sundaf Trip",
    description:
      "Pelajari manfaat, batasan, syarat klaim, dan screening polis Visa Protection sebelum pengajuan visa.",
    url: CANONICAL,
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
};

const CHECKLIST = [
  "Dibeli sebelum pengajuan visa dan sebelum ada hasil/indikasi penolakan.",
  "Nama pemohon, tanggal perjalanan, negara tujuan, dan nilai manfaat sesuai polis.",
  "Alasan penolakan tidak termasuk pengecualian polis.",
  "Ada surat penolakan resmi dari kedutaan, konsulat, visa center, atau otoritas terkait.",
  "Ada bukti pembayaran biaya yang ingin diklaim dan biaya itu memang non-refundable.",
];

const EXCLUSIONS = [
  "Dokumen palsu, informasi tidak benar, atau riwayat imigrasi yang disembunyikan.",
  "Pengajuan terlambat, dokumen tidak lengkap, atau salah memilih jenis visa.",
  "Visa sudah pernah ditolak sebelum polis dibeli atau risiko penolakan sudah diketahui.",
  "Biaya yang tidak tercantum sebagai manfaat polis.",
  "Keputusan klaim yang ditolak insurer karena alasan masuk pengecualian.",
];

const STEPS = [
  {
    icon: FileCheck2,
    title: "Screening profil",
    body: "Kami cek negara tujuan, jenis visa, tanggal keberangkatan, usia pemohon, dan riwayat visa sebelum menyarankan produk.",
  },
  {
    icon: ReceiptText,
    title: "Cek manfaat polis",
    body: "Kami cocokkan apakah manfaat visa refusal atau visa rejection benar-benar tertulis di polis, termasuk batas klaim dan dokumen yang diminta.",
  },
  {
    icon: ShieldCheck,
    title: "Beli sebelum submit",
    body: "Jika cocok, polis harus aktif sebelum pengajuan visa. Jangan membeli setelah dokumen bermasalah atau hasil visa sudah keluar.",
  },
];

const FAQS = [
  {
    question: "Apakah Visa Protection menjamin visa disetujui?",
    answer:
      "Tidak. Visa Protection tidak memengaruhi keputusan kedutaan, konsulat, visa center, atau otoritas imigrasi. Produk ini hanya membantu mengurangi risiko finansial tertentu bila visa ditolak dan manfaatnya tertulis di polis.",
  },
  {
    question: "Apakah semua biaya akan kembali kalau visa ditolak?",
    answer:
      "Tidak otomatis. Penggantian hanya berlaku untuk biaya yang termasuk manfaat polis, sampai batas klaim, dan dengan dokumen klaim lengkap. Biaya layanan, biaya kedutaan, tiket, hotel, atau biaya lain harus dicek satu per satu terhadap polis.",
  },
  {
    question: "Berapa estimasi premi Visa Protection?",
    answer:
      "Target produk yang Sundaf Trip screening berada di kisaran sekitar Rp400.000-Rp650.000 per orang bila tersedia dan cocok. Ada produk pasar yang bisa lebih murah atau lebih mahal tergantung durasi, negara tujuan, usia, nilai manfaat, dan kanal pembelian.",
  },
  {
    question: "Kapan harus membeli Visa Protection?",
    answer:
      "Sebelum pengajuan visa. Untuk banyak produk, pembelian setelah submit, setelah appointment, atau setelah ada indikasi penolakan bisa membuat klaim tidak valid. Karena itu screening sebaiknya dilakukan bersamaan dengan review dokumen visa.",
  },
];

export default async function VisaProtectionPage() {
  const companyRows = await prisma.companyInfo.findMany({
    where: { key: { in: ["company_whatsapp"] } },
  });
  const wa = toWaNumber(companyRows.find((r) => r.key === "company_whatsapp")?.value ?? "");
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        "Halo, saya ingin cek Asuransi Visa Protection sebelum pengajuan visa.",
      )}`
    : "/visa";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${CANONICAL}#faqpage`,
    inLanguage: "id-ID",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${CANONICAL}#service`,
    name: "Screening Asuransi Visa Protection",
    serviceType: "Travel insurance screening for visa rejection risk",
    provider: { "@id": `${SITE_URL}#organization` },
    areaServed: { "@type": "Country", name: "Indonesia" },
    audience: {
      "@type": "Audience",
      audienceType: "Pemegang paspor Indonesia yang akan mengajukan visa perjalanan",
    },
    url: CANONICAL,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 400000,
        maxPrice: 650000,
        priceCurrency: "IDR",
      },
      availability: "https://schema.org/LimitedAvailability",
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 text-gray-900 dark:bg-gray-950 dark:text-white">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
          { name: "Asuransi Visa Protection", url: "/visa/asuransi-visa-protection" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <section className="border-b border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-gray-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/visa"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowRight size={14} className="rotate-180" aria-hidden /> Kembali ke Info Visa
          </Link>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                Add-on pengajuan visa
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                Asuransi Visa Protection untuk risiko visa ditolak
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                Produk ini bukan jaminan visa lolos. Fungsinya membantu mengurangi risiko
                biaya tertentu jika visa ditolak, selama manfaatnya tertulis di polis dan
                syarat klaim terpenuhi.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={waHref}
                  target={wa ? "_blank" : undefined}
                  rel={wa ? "noreferrer" : undefined}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "var(--site-accent,#2d6a4f)" }}
                >
                  <MessageCircle size={17} aria-hidden />
                  Cek kecocokan polis
                </a>
                <Link
                  href="/jasa-urus-visa-terpercaya"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
                >
                  Review dokumen visa
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                Dibahas sebelum submit
              </p>
              <p className="mt-2 text-2xl font-black leading-tight text-gray-900 dark:text-white">
                Cek polis sebelum visa diajukan
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Produk harus dibeli sebelum pengajuan dan sebelum ada hasil penolakan. Tim kami
                akan bantu cek apakah manfaat visa rejection benar-benar tertulis di polis.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                >
                  <Icon size={22} className="text-amber-600 dark:text-amber-300" aria-hidden />
                  <h2 className="mt-4 text-base font-black">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={22} aria-hidden />
              <div>
                <h2 className="text-lg font-black">Biasanya perlu dicek sebelum beli</h2>
                <ul className="mt-4 space-y-3">
                  {CHECKLIST.map((item) => (
                    <li key={item} className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 shrink-0 text-rose-600" size={22} aria-hidden />
              <div>
                <h2 className="text-lg font-black">Yang sering tidak dicover</h2>
                <ul className="mt-4 space-y-3">
                  {EXCLUSIONS.map((item) => (
                    <li key={item} className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-300" size={22} aria-hidden />
            <div>
              <h2 className="text-lg font-black">Posisi Sundaf Trip</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Sundaf Trip bukan perusahaan asuransi dan tidak memutuskan klaim. Peran kami
                adalah membantu membaca kebutuhan perjalanan, mencocokkan manfaat polis, dan
                mengingatkan dokumen klaim sejak awal. Keputusan penerbitan polis dan pembayaran
                klaim tetap berada pada insurer sesuai syarat polis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xl font-black">FAQ Asuransi Visa Protection</h2>
          <div className="mt-4 space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold">
                  <span>{faq.question}</span>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-gray-400 transition-transform group-open:rotate-90"
                    aria-hidden
                  />
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
