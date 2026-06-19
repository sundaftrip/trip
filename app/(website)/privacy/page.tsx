export const revalidate = 300;

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import {
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = {
  title: "Kebijakan Privasi Sundaf Trip",
  description:
    "Kebijakan privasi Sundaf Trip tentang data yang dikumpulkan, tujuan penggunaan, pembagian data, penyimpanan, keamanan, dan hak pengguna.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const getCompany = unstable_cache(
  async () => {
    try {
      const rows = await prisma.companyInfo.findMany({
        where: {
          key: {
            in: [
              "company_legal_name",
              "company_nib",
              "company_email",
              "company_phone",
              "company_whatsapp",
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
  ["privacy-company-v1"],
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

export default async function PrivacyPage() {
  const company = await getCompany();
  const legalName = company.company_legal_name || "CV Sundaf Holiday Group";
  const nib = company.company_nib || "1601260060842";
  const email = company.company_email || "info@sundaftrip.com";
  const phoneRaw = company.company_whatsapp || company.company_phone || "081-775-2027-59";
  const phone = publicPhone(phoneRaw);
  const waHref = whatsappUrl(phoneRaw);

  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/privacy#webpage`,
    url: `${SITE_URL}/privacy`,
    name: "Kebijakan Privasi Sundaf Trip",
    inLanguage: "id-ID",
    dateModified: "2026-06-20",
    publisher: { "@id": `${SITE_URL}#organization` },
    about: { "@id": `${SITE_URL}#organization` },
  };

  const dataItems = [
    "Data kontak seperti nama, nomor WhatsApp, email, kota asal, dan preferensi komunikasi.",
    "Data rencana perjalanan seperti destinasi, tanggal keberangkatan, jumlah peserta, kebutuhan hotel, budget, dan catatan khusus.",
    "Data dokumen perjalanan atau visa hanya jika calon traveler mengirimkannya untuk konsultasi, pengecekan, atau pengurusan layanan.",
    "Data transaksi seperti bukti pembayaran, invoice, status booking, dan catatan administrasi yang diperlukan untuk layanan.",
    "Data teknis dasar seperti halaman yang dibuka, perangkat, browser, dan sumber kunjungan untuk keamanan dan evaluasi performa situs.",
  ];

  const useItems = [
    "Menjawab konsultasi, membuat penawaran, dan menyiapkan itinerary atau layanan visa yang diminta.",
    "Mengelola booking, pembayaran, jadwal keberangkatan, perubahan layanan, dan komunikasi operasional.",
    "Menyusun dokumen pendukung perjalanan atau visa sesuai persetujuan dan kebutuhan layanan.",
    "Meningkatkan keamanan, mencegah penyalahgunaan formulir, dan menjaga kualitas layanan pelanggan.",
    "Memenuhi kewajiban administrasi, pembukuan, dan kepatuhan hukum yang berlaku.",
  ];

  const shareItems = [
    "Mitra perjalanan seperti hotel, transport lokal, DMC, asuransi, atau penyedia layanan visa hanya bila diperlukan untuk menjalankan layanan.",
    "Penyedia sistem operasional seperti hosting, email, analytics, payment/admin tools, dan CRM jika digunakan untuk memproses layanan.",
    "Otoritas atau pihak berwenang jika diwajibkan oleh hukum, proses visa, keamanan perjalanan, atau permintaan resmi yang sah.",
  ];

  return (
    <div className="min-h-screen pt-24 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Kebijakan Privasi", url: "/privacy" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }} />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <span className="at-pill mb-5 inline-flex text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--at-subtext)" }}>
          Privasi Data
        </span>
        <h1 className="max-w-4xl text-4xl lg:text-6xl font-black leading-tight" style={{ color: "var(--at-text)" }}>
          Kebijakan Privasi Sundaf Trip
        </h1>
        <p className="mt-6 max-w-3xl text-base lg:text-lg leading-relaxed" style={{ color: "var(--at-subtext)" }}>
          Halaman ini menjelaskan bagaimana Sundaf Trip mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi calon traveler, peserta trip, partner, dan pengguna situs.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="at-card p-5">
            <ShieldCheck size={22} style={{ color: "var(--site-accent)" }} />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>Pengelola data</p>
            <p className="mt-2 text-sm font-black" style={{ color: "var(--at-text)" }}>{legalName}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--at-subtext)" }}>NIB {nib}</p>
          </div>
          <div className="at-card p-5">
            <Mail size={22} style={{ color: "var(--site-accent)" }} />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>Email resmi</p>
            <a href={`mailto:${email}`} className="mt-2 block break-words text-sm font-black underline underline-offset-4" style={{ color: "var(--at-text)" }}>{email}</a>
          </div>
          <div className="at-card p-5">
            <Phone size={22} style={{ color: "var(--site-accent)" }} />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>WhatsApp resmi</p>
            <a href={waHref || undefined} target={waHref ? "_blank" : undefined} rel={waHref ? "noreferrer" : undefined} className="mt-2 block break-words text-sm font-black underline underline-offset-4" style={{ color: "var(--at-text)" }}>{phone}</a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="at-card p-6">
            <Database size={24} style={{ color: "var(--site-accent)" }} />
            <h2 className="mt-4 text-2xl font-black" style={{ color: "var(--at-text)" }}>Data yang dapat kami kumpulkan</h2>
            <ul className="mt-5 space-y-3">
              {dataItems.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="at-card p-6">
            <LockKeyhole size={24} style={{ color: "var(--site-accent)" }} />
            <h2 className="mt-4 text-2xl font-black" style={{ color: "var(--at-text)" }}>Tujuan penggunaan data</h2>
            <ul className="mt-5 space-y-3">
              {useItems.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent)" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="at-card p-6 lg:p-8">
          <FileText size={24} style={{ color: "var(--site-accent)" }} />
          <h2 className="mt-4 text-2xl font-black" style={{ color: "var(--at-text)" }}>Pembagian data kepada pihak terkait</h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
            Sundaf Trip tidak menjual data pribadi. Data hanya dibagikan sejauh diperlukan untuk menjalankan layanan yang diminta, menjaga keamanan, atau memenuhi kewajiban hukum.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {shareItems.map((item) => (
              <div key={item} className="rounded-lg border p-4" style={{ borderColor: "var(--at-border)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="at-card p-6">
            <h2 className="text-xl font-black" style={{ color: "var(--at-text)" }}>Penyimpanan dan keamanan</h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              Data disimpan selama diperlukan untuk layanan, administrasi, pembukuan, penyelesaian sengketa, dan kewajiban hukum. Akses dibatasi pada tim atau penyedia layanan yang memerlukannya untuk menjalankan tugas.
            </p>
          </div>
          <div className="at-card p-6">
            <h2 className="text-xl font-black" style={{ color: "var(--at-text)" }}>Hak dan permintaan pengguna</h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              Pengguna dapat meminta akses, koreksi, atau penghapusan data yang tidak lagi diperlukan, sepanjang permintaan tersebut tidak bertentangan dengan kewajiban hukum, administrasi, atau keamanan layanan.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="at-card p-6">
          <h2 className="text-xl font-black" style={{ color: "var(--at-text)" }}>Rujukan hukum</h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
            Kebijakan ini disusun dengan memperhatikan prinsip pelindungan data pribadi di Indonesia, termasuk UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4" style={{ color: "var(--at-text)" }}>
              UU PDP - BPK RI <ExternalLink size={14} />
            </a>
            <a href="https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B202" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4" style={{ color: "var(--at-text)" }}>
              UU PDP - JDIH Komdigi <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
