import { withPageSocialMetadata } from "@/lib/site-metadata";
export const revalidate = 300;

import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import { unstable_cache } from "next/cache";
import { ArrowRight, ExternalLink } from "lucide-react";
import supportStyles from "@/components/website/clean/SupportPages.module.css";
import doc from "@/components/website/clean/DocFormat.module.css";
import { prisma } from "@/lib/prisma";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import {
  APPOINTMENT_ONLY_LABEL,
  appointmentOnlyOfficeAddress,
} from "@/lib/business-identity";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = withPageSocialMetadata({
  title: "Media Kit dan Profil Resmi Sundaf Trip",
  description:
    "Media kit Sundaf Trip berisi profil resmi, identitas legal, kontak, spesialisasi, dan halaman rujukan untuk direktori, partner, dan media.",
  alternates: { canonical: `${SITE_URL}/media-kit` },
});

const getData = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: {
          key: {
            in: [
              "company_name",
              "company_legal_name",
              "company_nib",
              "company_phone",
              "company_whatsapp",
              "company_email",
              "company_instagram",
              "company_description",
              "company_address",
            ],
          },
        },
      });
      const company: Record<string, string> = {};
      rows.forEach((row) => {
        if (row.value) company[row.key] = row.value;
      });
      return company;
    } catch {
      return {} as Record<string, string>;
    }
  },
  ["media-kit-company-v1"],
  { revalidate: 300, tags: ["company-info"] }
);

function instagramUrl(value: string | undefined) {
  const fallback = "sundaf.trip";
  const raw = (value || fallback).trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/+$/, "");
  return raw ? `https://www.instagram.com/${raw}` : "https://www.instagram.com/sundaf.trip";
}

function publicPhone(value: string | undefined) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("62")
    ? `0${digits.slice(2)}`
    : digits.startsWith("8")
      ? `0${digits}`
      : digits;
  if (/^08\d{10}$/.test(local)) {
    return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6, 10)}-${local.slice(10)}`;
  }
  return value.trim();
}

function whatsappUrl(value: string | undefined) {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("62")
      ? digits
      : digits.startsWith("8")
        ? `62${digits}`
        : digits;
  return normalized ? `https://wa.me/${normalized}` : "";
}

export default async function MediaKitPage() {
  const company = await getData();
  const brandName = company.company_name || "Sundaf Trip";
  const legalName = company.company_legal_name || "CV Sundaf Holiday Group";
  const nib = company.company_nib || "1601260060842";
  const phoneRaw = company.company_whatsapp || company.company_phone || "081-775-2027-59";
  const phone = publicPhone(phoneRaw);
  const phoneHref = whatsappUrl(phoneRaw);
  const email = company.company_email || "info@sundaftrip.com";
  const openingHours = "Senin-Jumat 09:00-17:00 WIB";
  const igUrl = instagramUrl(company.company_instagram);
  const officeAddress = appointmentOnlyOfficeAddress(company.company_address);
  const description =
    company.company_description ||
    "Sundaf Trip adalah biro perjalanan Indonesia yang fokus pada tour Rusia, Asia Tengah, aurora borealis, dan bantuan visa untuk traveler Indonesia.";

  const facts = [
    { label: "Nama brand", value: brandName },
    { label: "Nama legal", value: legalName },
    { label: "NIB", value: nib },
    { label: "Website resmi", value: SITE_URL, href: SITE_URL },
    { label: "Model layanan", value: "Online untuk pelanggan di Indonesia; kunjungan kantor hanya dengan janji temu" },
    { label: APPOINTMENT_ONLY_LABEL, value: officeAddress },
    { label: "Email", value: email, href: `mailto:${email}` },
    { label: "Telepon/WhatsApp", value: phone || "081-775-2027-59", href: phoneHref },
    { label: "Jam layanan", value: openingHours },
    { label: "Instagram", value: "@sundaf.trip", href: igUrl },
  ];

  const officialPages = [
    { label: "Profil brand/entity", href: "/sundaf-trip", desc: "Identitas resmi Sundaf Trip dan variasi nama brand." },
    { label: "Review publik", href: "/reviews", desc: "Testimonial published dari traveler dan pengguna layanan." },
    { label: "Tour Rusia dari Indonesia", href: "/tour-rusia-dari-indonesia", desc: "Panduan rute Rusia, visa WNI, biaya, dan aurora." },
    { label: "Open trip aurora Rusia", href: "/open-trip-aurora-rusia", desc: "Halaman rute Murmansk, Teriberka, dan aurora borealis." },
    { label: "Visa Rusia untuk WNI", href: "/visa-rusia-wni", desc: "Ringkasan kebutuhan visa Rusia untuk pemegang paspor Indonesia." },
    { label: "Legalitas & Keamanan", href: "/legalitas-dan-keamanan", desc: "Cara memverifikasi identitas, kontak resmi, dan keamanan pemesanan." },
    { label: "Kebijakan privasi", href: "/privacy", desc: "Cara Sundaf Trip mengelola dan melindungi data pengguna." },
    { label: "Semua paket tour", href: "/tours", desc: "Daftar paket aktif dan portfolio perjalanan." },
  ];

  const externalReferences = [
    {
      category: "Sumber resmi visa",
      label: "Kementerian Luar Negeri Rusia - e-Visa",
      href: "https://evisa.kdmid.ru/",
      desc: "Rujukan aturan e-Visa Rusia untuk traveler Indonesia, bukan direktori bisnis Sundaf Trip.",
    },
    {
      category: "Direktori industri",
      label: "ASITA - Direktori anggota travel Indonesia",
      href: "https://asita.id/anggota/",
      desc: "Direktori publik asosiasi travel Indonesia untuk pengecekan mandiri. Tidak kami tampilkan sebagai klaim keanggotaan Sundaf Trip.",
    },
    {
      category: "Rujukan hukum data pribadi",
      label: "UU No. 27 Tahun 2022 - BPK RI",
      href: "https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022",
      desc: "Rujukan resmi Undang-Undang Pelindungan Data Pribadi dari database peraturan BPK.",
    },
    {
      category: "Rujukan hukum data pribadi",
      label: "UU No. 27 Tahun 2022 - JDIH Komdigi",
      href: "https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B202",
      desc: "Rujukan JDIH Komdigi untuk dokumen hukum Pelindungan Data Pribadi.",
    },
  ];

  const mediaSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/media-kit#webpage`,
    url: `${SITE_URL}/media-kit`,
    name: "Media Kit dan Profil Resmi Sundaf Trip",
    description,
    inLanguage: "id-ID",
    isPartOf: { "@id": `${SITE_URL}#website` },
    publisher: { "@id": `${SITE_URL}#organization` },
    mainEntity: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: brandName,
      legalName,
      url: SITE_URL,
      identifier: { "@type": "PropertyValue", propertyID: "NIB", value: nib },
      sameAs: [igUrl],
      knowsAbout: [
        "Tour Rusia dari Indonesia",
        "Open trip aurora Rusia",
        "Murmansk",
        "Teriberka",
        "Asia Tengah",
        "Visa Rusia untuk WNI",
      ],
    },
    citation: externalReferences.map((item) => item.href),
    subjectOf: [
      { "@id": `${SITE_URL}/sundaf-trip#webpage` },
      { "@id": `${SITE_URL}/reviews#webpage` },
      { "@id": `${SITE_URL}/tour-rusia-dari-indonesia#webpage` },
      { "@id": `${SITE_URL}/open-trip-aurora-rusia#webpage` },
      { "@id": `${SITE_URL}/visa-rusia-wni#webpage` },
      { "@id": `${SITE_URL}/legalitas-dan-keamanan#webpage` },
      { "@id": `${SITE_URL}/privacy#webpage` },
    ],
  };

  return (
    <div className={`${supportStyles.atlasPage} min-h-screen`}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Media Kit", url: "/media-kit" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(mediaSchema) }} />

      <section className={supportStyles.hero} aria-labelledby="media-kit-title">
        <p className={doc.eyebrow}>Rujukan resmi / Sundaf Trip</p>
        <h1 id="media-kit-title" className={`${doc.title} ${supportStyles.title}`}>
          Media Kit dan Profil Resmi Sundaf Trip
        </h1>
        <p className={`${doc.lead} ${supportStyles.lede}`}>
          Halaman ini merangkum data resmi Sundaf Trip untuk direktori, partner, media, dan marketplace travel yang membutuhkan rujukan brand yang konsisten.
        </p>
      </section>

      <section className={supportStyles.section} aria-labelledby="media-kit-facts-title">
        <h2 id="media-kit-facts-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Data resmi</h2>
        <table className={`${doc.table} ${supportStyles.factsTable}`}>
          <tbody>
            {facts.map(({ label, value, href }) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className={doc.textLink}>
                      {value}
                    </a>
                  ) : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={supportStyles.section} aria-labelledby="media-kit-profile-title">
        <h2 id="media-kit-profile-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Profil singkat resmi</h2>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`${doc.boxSage} p-6`}>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              {description}
            </p>
          </div>

          <div className="grid gap-[3px] sm:grid-cols-2">
            {officialPages.map((item) => (
              <Link key={item.href} href={item.href} className="at-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className={supportStyles.cardTitleSmall}>{item.label}</h3>
                  <ArrowRight size={17} className="shrink-0" style={{ color: "var(--site-accent)" }} aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={supportStyles.section} aria-labelledby="media-kit-references-title">
        <h2 id="media-kit-references-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Sumber verifikasi dan rujukan industri</h2>
        <div className="grid gap-[3px] md:grid-cols-2">
          {externalReferences.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="at-card p-5">
              <p className={`${supportStyles.label} mb-3`}>{item.category}</p>
              <div className="flex items-start justify-between gap-4">
                <h3 className={supportStyles.cardTitleSmall}>{item.label}</h3>
                <ExternalLink size={16} className="shrink-0" style={{ color: "var(--site-accent)" }} aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.desc}</p>
            </a>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Catatan: rujukan eksternal di atas dipakai untuk membantu pengecekan mandiri. Direktori asosiasi tidak berarti Sundaf Trip mengklaim keanggotaan di asosiasi tersebut.
        </p>
      </section>
    </div>
  );
}
