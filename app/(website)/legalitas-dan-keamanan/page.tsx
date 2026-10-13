import CompanyTransferDetails from "@/components/website/CompanyTransferDetails";

import { withPageSocialMetadata } from "@/lib/site-metadata";
export const revalidate = 300;

import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import { unstable_cache } from "next/cache";
import { ArrowRight, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import {
  APPOINTMENT_ONLY_LABEL,
  appointmentOnlyOfficeAddress,
} from "@/lib/business-identity";
import supportStyles from "@/components/website/clean/SupportPages.module.css";
import doc from "@/components/website/clean/DocFormat.module.css";

const SITE_URL = "https://sundaftrip.com";
const LEGAL_ENTITY_STATEMENT =
  "This website is owned and operated by CV Sundaf Holiday Group, operating under the Sundaf Trip brand.";

export const metadata: Metadata = withPageSocialMetadata({
  title: "Legalitas dan Keamanan Sundaf Trip",
  description:
    "Halaman verifikasi legalitas, kontak resmi, kanal komunikasi, dan panduan keamanan pemesanan Sundaf Trip.",
  alternates: { canonical: `${SITE_URL}/legalitas-dan-keamanan` },
});

const getCompany = unstable_cache(
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
  ["legal-security-company-v1"],
  { revalidate: 300, tags: ["company-info"] }
);

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

export default async function LegalitasKeamananPage() {
  const company = await getCompany();
  const brandName = company.company_name || "Sundaf Trip";
  const legalName = company.company_legal_name || "CV Sundaf Holiday Group";
  const nib = company.company_nib || "1601260060842";
  const email = company.company_email || "info@sundaftrip.com";
  const phoneRaw = company.company_whatsapp || company.company_phone || "081-775-2027-59";
  const phone = publicPhone(phoneRaw);
  const openingHours = "Senin-Jumat 09:00-17:00 WIB";
  const waHref = whatsappUrl(phoneRaw);
  const igUrl = instagramUrl(company.company_instagram);
  const officeAddress = appointmentOnlyOfficeAddress(company.company_address);

  const legalSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/legalitas-dan-keamanan#webpage`,
    url: `${SITE_URL}/legalitas-dan-keamanan`,
    name: "Legalitas dan Keamanan Sundaf Trip",
    description:
      "Halaman verifikasi legalitas, kontak resmi, kanal komunikasi, dan panduan keamanan pemesanan Sundaf Trip.",
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE_URL}#organization` },
    about: { "@id": `${SITE_URL}#organization` },
  };

  const facts = [
    { label: "Nama brand", value: brandName },
    { label: "Nama legal", value: legalName },
    { label: "NIB", value: nib },
    { label: "Website resmi", value: SITE_URL, href: SITE_URL },
    { label: "WhatsApp resmi", value: phone, href: waHref },
    { label: "Email resmi", value: email, href: `mailto:${email}` },
    { label: "Jam layanan", value: openingHours },
    { label: APPOINTMENT_ONLY_LABEL, value: officeAddress },
  ];

  const safeSteps = [
    "Pastikan domain yang dibuka adalah sundaftrip.com sebelum mengisi form, mengirim dokumen, atau melakukan pembayaran.",
    "Gunakan WhatsApp dan email resmi yang tercantum di halaman ini atau di media kit Sundaf Trip.",
    "Minta invoice atau ringkasan pesanan sebelum transfer, terutama untuk paket tour, visa, atau custom trip.",
    "Jangan kirim paspor, rekening, atau dokumen sensitif ke nomor yang tidak bisa diverifikasi dari situs resmi Sundaf Trip.",
    "Jika ada akun, nomor, atau rekening yang mengatasnamakan Sundaf tetapi tidak sesuai, konfirmasi dulu lewat WhatsApp resmi.",
  ];

  const officialPages = [
    { label: "Media kit", href: "/media-kit", desc: "Profil formal, identitas legal, dan rujukan resmi Sundaf Trip." },
    { label: "Review publik", href: "/reviews", desc: "Testimonial yang sudah dipublikasikan untuk bukti sosial." },
    { label: "Kebijakan privasi", href: "/privacy", desc: "Cara Sundaf Trip mengelola dan melindungi data pengguna." },
    { label: "Syarat & Ketentuan", href: "/terms", desc: "Ketentuan pemesanan, pembayaran, pembatalan, dan layanan." },
  ];

  const references = [
    {
      category: "Rujukan hukum data pribadi",
      label: "UU No. 27 Tahun 2022 - BPK RI",
      href: "https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022",
      desc: "Database peraturan BPK untuk Undang-Undang Pelindungan Data Pribadi.",
    },
    {
      category: "Rujukan hukum data pribadi",
      label: "UU No. 27 Tahun 2022 - JDIH Komdigi",
      href: "https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B202",
      desc: "Dokumen hukum Pelindungan Data Pribadi di JDIH Komdigi.",
    },
    {
      category: "Sumber resmi visa",
      label: "Kementerian Luar Negeri Rusia - e-Visa",
      href: "https://evisa.kdmid.ru/",
      desc: "Rujukan resmi untuk status dan syarat e-Visa Rusia.",
    },
    {
      category: "Direktori industri",
      label: "ASITA - Direktori anggota travel Indonesia",
      href: "https://asita.id/anggota/",
      desc: "Direktori publik asosiasi travel Indonesia untuk pengecekan mandiri. Tidak kami tampilkan sebagai klaim keanggotaan Sundaf Trip.",
    },
  ];

  return (
    <div className={`${supportStyles.atlasPage} min-h-screen`} style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Legalitas dan Keamanan", url: "/legalitas-dan-keamanan" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(legalSchema) }} />

      <section className={supportStyles.hero} aria-labelledby="legal-page-title">
        <p className={doc.eyebrow}>Verifikasi resmi / Sundaf Trip</p>
        <h1 id="legal-page-title" className={`${doc.title} ${supportStyles.title}`}>
          Legalitas dan Keamanan Sundaf Trip
        </h1>
        <p className={`${doc.lead} ${supportStyles.lede} mt-6`}>
          Gunakan halaman ini untuk memeriksa identitas resmi Sundaf Trip, kanal komunikasi yang valid, dan langkah aman sebelum mengirim data atau melakukan pembayaran.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          {LEGAL_ENTITY_STATEMENT}
        </p>
      </section>

      <section className={supportStyles.section} aria-labelledby="legal-facts-title">
        <h2 id="legal-facts-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Identitas dan kanal resmi</h2>
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
        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Model layanan: online untuk pelanggan di Indonesia. Kunjungan ke kantor hanya dengan janji temu sebelumnya (appointment only); kami tidak menerima kunjungan walk-in. Gunakan kanal resmi di halaman ini sebelum mengirim dokumen atau melakukan pembayaran.
        </p>
      </section>

      <section className={supportStyles.section} aria-labelledby="booking-safety-title">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h2 id="booking-safety-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Cek sebelum transfer atau kirim dokumen</h2>
            <div className="at-card p-6 lg:p-8">
              <div style={{ color: "var(--at-subtext)" }}>
                <CompanyTransferDetails />
              </div>
              <ul className={`${supportStyles.docList} mt-5`}>
                {safeSteps.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 content-start">
            <a href={waHref || undefined} target={waHref ? "_blank" : undefined} rel={waHref ? "noreferrer" : undefined} className="at-card p-5 transition hover:opacity-80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={supportStyles.label}>Konfirmasi cepat</p>
                  <h3 className={`${supportStyles.cardTitleSmall} mt-2`}>WhatsApp resmi</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{phone}</p>
                </div>
                <ArrowRight aria-hidden="true" size={17} className="shrink-0" style={{ color: "var(--site-accent)" }} />
              </div>
            </a>
            <a href={igUrl} target="_blank" rel="noreferrer" className="at-card p-5 transition hover:opacity-80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={supportStyles.label}>Kanal sosial</p>
                  <h3 className={`${supportStyles.cardTitleSmall} mt-2`}>Instagram resmi</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>@sundaf.trip</p>
                </div>
                <ArrowRight aria-hidden="true" size={17} className="shrink-0" style={{ color: "var(--site-accent)" }} />
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className={supportStyles.section} aria-labelledby="official-references-title">
        <h2 id="official-references-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Rujukan resmi yang dicatat</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {references.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="at-card p-5 transition hover:opacity-80">
              <p className={`${supportStyles.label} mb-3`}>{item.category}</p>
              <div className="flex items-start justify-between gap-4">
                <h3 className={supportStyles.cardTitleSmall}>{item.label}</h3>
                <ExternalLink aria-hidden="true" size={16} className="shrink-0" style={{ color: "var(--site-accent)" }} />
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className={supportStyles.section} aria-labelledby="official-support-pages-title">
        <h2 id="official-support-pages-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Halaman pendukung resmi</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {officialPages.map((item) => (
            <Link key={item.href} href={item.href} className="at-card p-5 transition hover:opacity-80">
              <div className="flex items-start justify-between gap-4">
                <h3 className={supportStyles.cardTitleSmall}>{item.label}</h3>
                <ArrowRight aria-hidden="true" size={17} className="shrink-0" style={{ color: "var(--site-accent)" }} />
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
