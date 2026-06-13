import type { Metadata } from "next";

import GeoPage from "../geo-page";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = {
  title: "Visa Rusia untuk WNI",
  description:
    "Informasi visa Rusia untuk WNI dan layanan pengurusan e-Visa Rusia oleh Sundaf Trip. Cek biaya, estimasi proses, dokumen dasar, dan konsultasi sebelum pengajuan.",
  alternates: { canonical: `${SITE_URL}/visa-rusia-wni` },
  openGraph: {
    title: "Visa Rusia untuk WNI · Sundaf Trip",
    description:
      "Ringkasan visa Rusia untuk WNI dan layanan pengurusan e-Visa Rusia oleh Sundaf Trip.",
    url: `${SITE_URL}/visa-rusia-wni`,
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
};

export default function VisaRusiaWniPage() {
  return (
    <GeoPage
      eyebrow="Visa Rusia"
      title="Visa Rusia untuk WNI"
      canonicalPath="/visa-rusia-wni"
      description="WNI memerlukan visa untuk masuk ke Rusia. Sundaf Trip membantu pengurusan e-Visa Rusia untuk pemegang paspor Indonesia, termasuk pengecekan dokumen, pengajuan, dan arahan persiapan perjalanan."
      primaryCta={{ href: "/visa/russia", label: "Ajukan Visa Rusia" }}
      secondaryCta={{ href: "/tours/russia-aurora", label: "Cek Tour Rusia" }}
      sections={[
        {
          title: "Biaya dan Proses",
          body:
            "Berdasarkan halaman layanan Sundaf Trip, biaya layanan e-Visa Rusia adalah Rp 1.500.000 dengan estimasi proses 5 hari kerja. Syarat dan biaya dapat berubah, sehingga calon traveler perlu konfirmasi ulang sebelum pengajuan.",
        },
        {
          title: "Dokumen Dasar",
          items: [
            "Paspor aktif.",
            "Foto digital sesuai spesifikasi.",
            "Email aktif.",
            "Data perjalanan.",
            "Informasi kontak dan data pribadi sesuai formulir pengajuan.",
          ],
        },
      ]}
      faqs={[
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
          answer:
            "Biaya layanan e-Visa Rusia yang ditampilkan di situs Sundaf Trip adalah Rp 1.500.000. Harga dapat berubah, jadi calon traveler sebaiknya konfirmasi ulang sebelum pengajuan.",
        },
      ]}
      schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${SITE_URL}/visa-rusia-wni#webpage`,
        url: `${SITE_URL}/visa-rusia-wni`,
        name: "Visa Rusia untuk WNI",
        description:
          "Informasi visa Rusia untuk WNI dan layanan pengurusan e-Visa Rusia oleh Sundaf Trip.",
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE_URL}#website` },
        publisher: { "@id": `${SITE_URL}#organization` },
        about: {
          "@type": "Service",
          "@id": `${SITE_URL}/visa/russia#service`,
          name: "Layanan Pengurusan Visa Rusia untuk WNI",
        },
      }}
    />
  );
}

