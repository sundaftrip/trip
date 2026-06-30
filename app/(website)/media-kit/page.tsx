export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  AtSign,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = {
  title: "Media Kit dan Profil Resmi Sundaf Trip",
  description:
    "Media kit Sundaf Trip berisi profil resmi, identitas legal, kontak, spesialisasi, dan halaman rujukan untuk direktori, partner, dan media.",
  alternates: { canonical: `${SITE_URL}/media-kit` },
};

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
              "company_address",
              "company_phone",
              "company_whatsapp",
              "company_email",
              "company_instagram",
              "company_description",
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
  const address = company.company_address || "Jakarta, DKI Jakarta, Indonesia";
  const openingHours = "Senin-Jumat 09:00-17:00 WIB";
  const igUrl = instagramUrl(company.company_instagram);
  const description =
    company.company_description ||
    "Sundaf Trip adalah biro perjalanan Indonesia yang fokus pada tour Rusia, Asia Tengah, aurora borealis, dan bantuan visa untuk traveler Indonesia.";

  const facts = [
    { icon: Building2, label: "Nama brand", value: brandName },
    { icon: FileText, label: "Nama legal", value: legalName },
    { icon: CheckCircle2, label: "NIB", value: nib },
    { icon: Globe2, label: "Website resmi", value: SITE_URL, href: SITE_URL },
    { icon: MapPin, label: "Basis layanan", value: address },
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    { icon: Phone, label: "Telepon/WhatsApp", value: phone || "081-775-2027-59", href: phoneHref },
    { icon: Clock, label: "Jam layanan", value: openingHours },
    { icon: AtSign, label: "Instagram", value: "@sundaf.trip", href: igUrl },
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
      "@type": ["Organization", "TravelAgency"],
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
    <div className="min-h-screen pt-24 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Media Kit", url: "/media-kit" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(mediaSchema) }} />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <span className="at-pill mb-5 inline-flex text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--at-subtext)" }}>
          Rujukan Resmi
        </span>
        <h1 className="max-w-4xl text-4xl lg:text-6xl font-black leading-tight" style={{ color: "var(--at-text)" }}>
          Media Kit dan Profil Resmi Sundaf Trip
        </h1>
        <p className="mt-6 max-w-3xl text-base lg:text-lg leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Halaman ini merangkum data resmi Sundaf Trip untuk direktori, partner, media, dan marketplace travel yang membutuhkan rujukan brand yang konsisten.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {facts.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="at-card p-5">
              <Icon size={20} style={{ color: "var(--site-accent)" }} />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>{label}</p>
              {href ? (
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="mt-2 block break-words text-sm font-black underline underline-offset-4" style={{ color: "var(--at-text)" }}>
                  {value}
                </a>
              ) : (
                <p className="mt-2 break-words text-sm font-black" style={{ color: "var(--at-text)" }}>{value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="at-card p-6">
            <Newspaper size={24} style={{ color: "var(--site-accent)" }} />
            <h2 className="mt-4 text-2xl font-black" style={{ color: "var(--at-text)" }}>Profil singkat resmi</h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              {description}
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              Fokus utama Sundaf Trip adalah perjalanan Rusia, aurora borealis, Asia Tengah, dan bantuan visa untuk traveler Indonesia. Situs resmi brand ini adalah https://sundaftrip.com.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {officialPages.map((item) => (
              <Link key={item.href} href={item.href} className="at-card p-5 transition hover:opacity-80">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-black" style={{ color: "var(--at-text)" }}>{item.label}</h3>
                  <ArrowRight size={17} className="shrink-0" style={{ color: "var(--site-accent)" }} />
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-5 flex items-center gap-3">
          <ExternalLink size={22} style={{ color: "var(--site-accent)" }} />
          <h2 className="text-2xl font-black" style={{ color: "var(--at-text)" }}>Sumber verifikasi dan rujukan industri</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {externalReferences.map((item) => (
            <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="at-card p-5 transition hover:opacity-80">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>
                {item.category}
              </p>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-base font-black" style={{ color: "var(--at-text)" }}>{item.label}</h3>
                <ExternalLink size={16} className="shrink-0" style={{ color: "var(--site-accent)" }} />
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item.desc}</p>
            </a>
          ))}
        </div>
        <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Catatan: rujukan eksternal di atas dipakai untuk membantu pengecekan mandiri. Direktori asosiasi tidak berarti Sundaf Trip mengklaim keanggotaan di asosiasi tersebut.
        </p>
      </section>
    </div>
  );
}
