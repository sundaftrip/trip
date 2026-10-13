import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import { ArrowRight, ChevronLeft, MessageCircle } from "lucide-react";

import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import StableDetails from "@/components/website/clean/StableDetails";
import doc from "@/components/website/clean/DocFormat.module.css";
import styles from "./VisaProtection.module.css";
import { prisma } from "@/lib/prisma";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import { defaultOpenGraphImages, defaultTwitterImages } from "@/lib/site-metadata";
import { toWaNumber } from "@/lib/utils";

export const revalidate = 300;

const SITE_URL = "https://sundaftrip.com";
const CANONICAL = `${SITE_URL}/visa/asuransi-visa-protection`;

export const metadata: Metadata = {
  title: "Asuransi Visa Protection untuk Risiko Visa Ditolak",
  description:
    "Screening dan pembelian Asuransi Visa Protection untuk membantu mengurangi risiko biaya saat visa ditolak. Premi terpisah, klaim dibantu, dan manfaat mengikuti polis.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Asuransi Visa Protection untuk Risiko Visa Ditolak · Sundaf Trip",
    description:
      "Pelajari manfaat, batasan, syarat klaim, pembelian polis, dan bantuan klaim Visa Protection sebelum pengajuan visa.",
    url: CANONICAL,
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
    images: defaultOpenGraphImages("Asuransi Visa Protection Sundaf Trip"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Asuransi Visa Protection untuk Risiko Visa Ditolak · Sundaf Trip",
    description:
      "Pelajari manfaat, batasan, syarat klaim, pembelian polis, dan bantuan klaim Visa Protection sebelum pengajuan visa.",
    images: defaultTwitterImages(),
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
    title: "Screening profil",
    body: "Kami cek negara tujuan, jenis visa, tanggal keberangkatan, usia pemohon, dan riwayat visa sebelum menyarankan produk.",
  },
  {
    title: "Cek manfaat polis",
    body: "Kami cocokkan apakah manfaat visa refusal atau visa rejection benar-benar tertulis di polis, termasuk batas klaim dan dokumen yang diminta.",
  },
  {
    title: "Beli sebelum submit",
    body: "Jika cocok, polis bisa dibeli melalui Sundaf Trip dan harus aktif sebelum pengajuan visa. Jangan membeli setelah dokumen bermasalah atau hasil visa sudah keluar.",
  },
];

const BENEFITS = [
  {
    title: "Mengurangi risiko biaya non-refundable",
    body: "Jika polisnya sesuai, manfaat dapat membantu mengganti biaya tertentu yang sudah dibayar dan tidak bisa dikembalikan saat visa ditolak.",
  },
  {
    title: "Membantu memilih polis yang relevan",
    body: "Tidak semua asuransi perjalanan punya manfaat visa refusal atau visa rejection. Screening membantu memastikan manfaat itu benar-benar tertulis.",
  },
  {
    title: "Mengingatkan waktu pembelian",
    body: "Banyak polis mensyaratkan pembelian sebelum pengajuan visa. Ini mencegah traveler membeli perlindungan ketika risikonya sudah terlambat.",
  },
  {
    title: "Membuat dokumen klaim lebih siap",
    body: "Traveler bisa tahu lebih awal dokumen apa yang biasanya diminta, seperti surat penolakan resmi, bukti pembayaran, dan detail perjalanan.",
  },
  {
    title: "Dibantu pembelian dan proses klaim",
    body: "Sundaf Trip dapat membantu pembelian polis yang cocok dan mendampingi proses klaim administratif bila visa ditolak sesuai ketentuan polis.",
  },
  {
    title: "Membantu budgeting sebelum submit",
    body: "Premi, batas klaim, dan pengecualian bisa dipertimbangkan sejak awal sehingga keputusan pengajuan visa lebih realistis.",
  },
];

const FAQS = [
  {
    question: "Apa itu Visa Protection?",
    answer:
      "Visa Protection adalah add-on perlindungan atau asuransi perjalanan yang manfaatnya dapat membantu mengurangi kerugian biaya tertentu jika visa ditolak. Produk ini bukan jaminan visa disetujui dan hanya berlaku sesuai isi polis.",
  },
  {
    question: "Apa manfaat utama Visa Protection?",
    answer:
      "Manfaat utamanya adalah membantu mengurangi risiko biaya non-refundable, membantu memilih polis yang benar-benar mencakup visa refusal atau visa rejection, membantu pembelian polis, dan membuat dokumen klaim lebih siap sebelum pengajuan visa dilakukan.",
  },
  {
    question: "Apakah polis Visa Protection bisa dibeli lewat Sundaf Trip?",
    answer:
      "Ya. Setelah screening, Sundaf Trip dapat menawarkan dan membantu pembelian polis Visa Protection yang sesuai dengan kebutuhan perjalanan. Premi dibayar terpisah dari biaya visa dan manfaat tetap mengikuti isi polis.",
  },
  {
    question: "Apakah klaimnya dibantu Sundaf Trip?",
    answer:
      "Ya. Jika visa ditolak dan manfaat klaim tersedia di polis, Sundaf Trip membantu menyiapkan alur klaim administratif, mengingatkan dokumen yang dibutuhkan, dan mendampingi proses komunikasi. Keputusan dan pembayaran klaim tetap berada pada insurer sesuai syarat polis.",
  },
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
    <div className={styles.page}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
          { name: "Asuransi Visa Protection", url: "/visa/asuransi-visa-protection" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }}
      />

      <section className={`${styles.shell} ${styles.hero}`} aria-labelledby="visa-protection-title">
        <Link href="/visa" className={styles.back}>
          <ChevronLeft size={14} aria-hidden="true" /> Kembali ke Info Visa
        </Link>
        <div className={styles.heroGrid}>
          <div>
            <p className={doc.eyebrow}>Add-on pengajuan visa / Sundaf Trip</p>
            <h1 id="visa-protection-title" className={`${doc.title} ${styles.title}`}>
              Asuransi Visa Protection untuk risiko visa ditolak
            </h1>
            <p className={styles.lede}>
              Produk ini bukan jaminan visa lolos. Fungsinya membantu mengurangi risiko
              biaya tertentu jika visa ditolak, selama manfaatnya tertulis di polis dan
              syarat klaim terpenuhi.
            </p>
            <div className={styles.actions}>
              <a
                href={waHref}
                target={wa ? "_blank" : undefined}
                rel={wa ? "noreferrer" : undefined}
                className={doc.button}
              >
                <MessageCircle aria-hidden="true" />
                Cek kecocokan polis
              </a>
              <Link href="/jasa-urus-visa-terpercaya" className={styles.secondary}>
                Review dokumen visa
              </Link>
            </div>
          </div>

          <aside className={`${doc.boxSand} ${styles.box}`}>
            <p className={doc.subhead}>Dibahas sebelum submit</p>
            <p className={styles.boxTitle}>Cek polis sebelum visa diajukan</p>
            <p>
              Produk harus dibeli sebelum pengajuan dan sebelum ada hasil penolakan. Tim kami
              akan bantu cek manfaat, pembelian polis, dan alur klaim bila visa ditolak.
            </p>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-label="Tentang Visa Protection">
        <div className={styles.pair}>
          <div className={`${doc.boxSage} ${styles.box}`}>
            <p className={doc.subhead}>Apa itu Visa Protection?</p>
            <h2 className={styles.boxTitle}>Perlindungan finansial, bukan jaminan approval visa</h2>
            <p>
              Visa Protection adalah add-on perlindungan atau asuransi perjalanan yang
              dirancang untuk membantu mengurangi kerugian biaya tertentu jika pengajuan
              visa ditolak. Jika cocok, polisnya dapat dibeli melalui Sundaf Trip.
            </p>
            <p>
              Manfaatnya hanya bisa dipakai bila risiko visa refusal atau visa rejection
              tertulis jelas di polis, polis dibeli sebelum pengajuan, alasan penolakan
              memenuhi syarat, dan dokumen klaim lengkap.
            </p>
            <p className={styles.strong}>
              Jadi fokusnya bukan membuat visa pasti lolos, tetapi membantu traveler
              memahami risiko biaya sebelum dokumen disubmit, sekaligus punya pendampingan
              administratif jika perlu klaim.
            </p>
          </div>

          <div className={`${doc.boxSand} ${styles.box}`}>
            <p className={doc.subhead}>Manfaat yang perlu dipahami</p>
            <h2 className={styles.boxTitle}>Membantu mengelola risiko sebelum biaya visa keluar</h2>
            <div className={styles.benefits}>
              {BENEFITS.map((benefit) => (
                <div key={benefit.title}>
                  <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                  <p>{benefit.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="visa-protection-steps-title">
        <h2 id="visa-protection-steps-title" className={doc.tag}>Cara kerjanya</h2>
        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-label="Cakupan polis">
        <div className={styles.pair}>
          <div className={`${doc.boxSage} ${styles.box}`}>
            <h2 className={styles.boxTitle}>Biasanya perlu dicek sebelum beli</h2>
            <ul className={styles.list}>
              {CHECKLIST.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className={`${doc.boxSand} ${styles.box}`}>
            <h2 className={styles.boxTitle}>Yang sering tidak dicover</h2>
            <ul className={`${styles.list} ${styles.listMuted}`}>
              {EXCLUSIONS.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="visa-protection-position-title">
        <h2 id="visa-protection-position-title" className={doc.tag}>Posisi Sundaf Trip</h2>
        <div className={`${doc.boxSage} ${styles.box}`}>
          <p>
            Sundaf Trip menawarkan dan membantu pembelian polis Visa Protection yang sesuai
            setelah screening. Kami juga mendampingi proses klaim administratif jika visa
            ditolak. Sundaf Trip bukan perusahaan asuransi dan tidak memutuskan klaim;
            keputusan penerbitan polis serta pembayaran klaim tetap berada pada insurer
            sesuai syarat polis.
          </p>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`} aria-labelledby="visa-protection-faq-title">
        <h2 id="visa-protection-faq-title" className={doc.tag}>FAQ Asuransi Visa Protection</h2>
        <div className={styles.faqRows}>
          {FAQS.map((faq) => (
            <StableDetails key={faq.question} className={styles.faqRow}>
              <summary>
                <span>{faq.question}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </StableDetails>
          ))}
        </div>
      </section>
      <div className={styles.end} aria-hidden="true" />
    </div>
  );
}
