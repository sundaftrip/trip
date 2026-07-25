import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import { buildWhatsAppHref } from "@/lib/utils";
import VisaLanding from "./VisaLanding";

// ISR: database visa jarang berubah — edit dari admin tampil maksimal 5 menit.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Info Visa Paspor Indonesia dan Jasa Urus Visa",
  description:
    "Database persyaratan visa 88 negara dan layanan jasa urus visa untuk pemegang paspor Indonesia, dikurasi dari sumber resmi oleh Sundaf Trip.",
  alternates: { canonical: "https://sundaftrip.com/visa" },
};

export default async function VisaPage() {
  // Keep the index payload deliberately compact. Rich country fields remain
  // on /visa/[slug], while this route only needs directory-card information.
  const [visaEntries, faqRows, companyRows] = await Promise.all([
    prisma.countryVisa.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        flag: true,
        name: true,
        en: true,
        region: true,
        visa: true,
        stay: true,
        cost: true,
        officialFee: true,
        servicePrice: true,
        notes: true,
        conditions: true,
        sourceUrl: true,
        lastVerifiedAt: true,
      },
    }),
    prisma.faq.findMany({
      where: { group: "visa", active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      take: 6,
      select: { id: true, question: true, answer: true },
    }),
    prisma.companyInfo.findMany({
      where: { key: "company_whatsapp" },
      select: { key: true, value: true },
    }),
  ]);

  const entries = visaEntries.map((entry) => ({
    ...entry,
    lastVerifiedAt: entry.lastVerifiedAt?.toISOString() ?? null,
  }));
  const serviceEntries = entries.filter((entry) => (
    entry.visa !== "bebas"
    && Boolean(
      entry.servicePrice?.trim()
      || entry.officialFee?.trim()
      || (entry.cost?.trim() && entry.cost.trim().toLowerCase() !== "gratis"),
    )
  ));
  const featured = (serviceEntries.length >= 4
    ? serviceEntries
    : entries.filter((entry) => entry.visa !== "bebas")
  ).slice(0, 4);
  const faqs = faqRows
    .map((faq) => ({ ...faq, answer: plainText(faq.answer) }))
    .filter((faq) => faq.question.trim() && faq.answer);
  const whatsapp = companyRows.find((row) => row.key === "company_whatsapp")?.value;
  const whatsappHref = buildWhatsAppHref(
    whatsapp,
    "Halo Sundaf Trip, saya ingin konsultasi persyaratan dan layanan visa.",
  );
  const faqSchema = faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": "https://sundaftrip.com/visa#faqpage",
        inLanguage: "id-ID",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
        ]}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <VisaLanding
        entries={entries}
        featured={featured}
        faqs={faqs}
        whatsappHref={whatsappHref}
      />
    </>
  );
}

function plainText(value: string) {
  return value
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n")
    .replace(/<\s*\/li\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
