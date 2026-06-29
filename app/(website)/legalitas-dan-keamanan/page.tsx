export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

const SITE_URL = "https://sundaftrip.com";
const LEGAL_ENTITY_STATEMENT =
  "This website is owned and operated by CV Sundaf Holiday Group, operating under the Sundaf Trip brand.";

export const metadata: Metadata = {
  title: "Legalitas dan Keamanan Sundaf Trip",
  description:
    "Halaman verifikasi legalitas, kontak resmi, kanal komunikasi, dan panduan keamanan pemesanan Sundaf Trip.",
  alternates: { canonical: `${SITE_URL}/legalitas-dan-keamanan` },
};

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
              "company_address",
              "company_phone",
              "company_whatsapp",
              "company_email",
              "company_instagram",
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
  const address = company.company_address || "Jakarta, DKI Jakarta, Indonesia";
  const openingHours = "Senin-Jumat 09:00-17:00 WIB";
  const waHref = whatsappUrl(phoneRaw);
  const igUrl = instagramUrl(company.company_instagram);

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
    { icon: Building2, label: "Nama brand", value: brandName },
    { icon: FileText, label: "Nama legal", value: legalName },
    { icon: ShieldCheck, label: "NIB", value: nib },
    { icon: Globe2, label: "Website resmi", value: SITE_URL, href: SITE_URL },
    { icon: Phone, label: "WhatsApp resmi", value: phone, href: waHref },
    { icon: Mail, label: "Email resmi", value: email, href: `mailto:${email}` },
    { icon: Clock, label: "Jam layanan", value: openingHours },
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
      category: "Calon rujukan industri",
      label: "ASITA - Direktori anggota travel Indonesia",
      href: "https://asita.id/anggota/",
      desc: "Kandidat rujukan asosiasi travel Indonesia, bukan klaim keanggotaan Sundaf Trip.",
    },
  ];

  return (
    <div className="min-h-screen pt-24 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Legalitas dan Keamanan", url: "/legalitas-dan-keamanan" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(legalSchema) }} />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <span className="at-pill mb-5 inline-flex text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--at-subtext)" }}>
          Verifikasi Resmi
        </span>
        <h1 className="max-w-4xl text-4xl lg:text-6xl font-black leading-tight" style={{ color: "var(--at-text)" }}>
          Legalitas dan Keamanan Sundaf Trip
        </h1>
        <p className="mt-6 max-w-3xl text-base lg:text-lg leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Gunakan halaman ini untuk memeriksa identitas resmi Sundaf Trip, kanal komunikasi yang valid, dan langkah aman sebelum mengirim data atau melakukan pembayaran.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          {LEGAL_ENTITY_STATEMENT}
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Basis layanan: {address}. Sundaf Trip melayani pelanggan dari Indonesia melalui kanal online dan komunikasi resmi.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="at-card p-6 lg:p-8">
            <AlertTriangle size={24} style={{ color: "var(--site-accent)" }} />
            <h2 className="mt-4 text-2xl font-black" style={{ color: "var(--at-text)" }}>Cek sebelum transfer atau kirim dokumen</h2>
            <ul className="mt-5 space-y-3">
              {safeSteps.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            <a href={waHref || undefined} target={waHref ? "_blank" : undefined} rel={waHref ? "noreferrer" : undefined} className="at-card p-5 transition hover:opacity-80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>Konfirmasi cepat</p>
                  <h3 className="mt-2 text-lg font-black" style={{ color: "var(--at-text)" }}>WhatsApp resmi</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{phone}</p>
                </div>
                <ArrowRight size={17} className="shrink-0" style={{ color: "var(--site-accent)" }} />
              </div>
            </a>
            <a href={igUrl} target="_blank" rel="noreferrer" className="at-card p-5 transition hover:opacity-80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>Kanal sosial</p>
                  <h3 className="mt-2 text-lg font-black" style={{ color: "var(--at-text)" }}>Instagram resmi</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>@sundaf.trip</p>
                </div>
                <ArrowRight size={17} className="shrink-0" style={{ color: "var(--site-accent)" }} />
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-5 flex items-center gap-3">
          <ExternalLink size={22} style={{ color: "var(--site-accent)" }} />
          <h2 className="text-2xl font-black" style={{ color: "var(--at-text)" }}>Rujukan resmi yang dicatat</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {references.map((item) => (
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
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-5 flex items-center gap-3">
          <ShieldCheck size={22} style={{ color: "var(--site-accent)" }} />
          <h2 className="text-2xl font-black" style={{ color: "var(--at-text)" }}>Halaman pendukung resmi</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
      </section>
    </div>
  );
}
