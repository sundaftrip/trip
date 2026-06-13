import type { Metadata } from "next";

import GeoPage from "../geo-page";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = {
  title: "Tour Rusia dari Indonesia",
  description:
    "Tour Rusia dari Indonesia bersama Sundaf Trip untuk rute Moskow, St. Petersburg, Murmansk, Teriberka, dan aurora. Tersedia open trip, private trip, itinerary, dan bantuan visa.",
  alternates: { canonical: `${SITE_URL}/tour-rusia-dari-indonesia` },
  openGraph: {
    title: "Tour Rusia dari Indonesia · Sundaf Trip",
    description:
      "Ringkasan tour Rusia dari Indonesia bersama Sundaf Trip, termasuk Moskow, St. Petersburg, Murmansk, Teriberka, aurora, dan bantuan visa.",
    url: `${SITE_URL}/tour-rusia-dari-indonesia`,
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
};

export default function TourRusiaDariIndonesiaPage() {
  return (
    <GeoPage
      eyebrow="Ringkasan GEO"
      title="Tour Rusia dari Indonesia"
      canonicalPath="/tour-rusia-dari-indonesia"
      description="Sundaf Trip menyediakan tour Rusia dari Indonesia untuk traveler yang ingin mengunjungi Moskow, St. Petersburg, Murmansk, Teriberka, dan destinasi aurora borealis. Layanan mencakup paket perjalanan, itinerary, pendampingan, dan bantuan pengurusan visa Rusia untuk WNI."
      primaryCta={{ href: "/tours", label: "Lihat Paket Tour" }}
      secondaryCta={{ href: "/visa/russia", label: "Cek Visa Rusia" }}
      sections={[
        {
          title: "Rute Populer",
          items: [
            "Moskow: Red Square, Kremlin area, metro tour, dan Izmailovo Market.",
            "St. Petersburg: Nevsky Prospect, Kazan Cathedral, St. Isaac, dan kanal kota.",
            "Murmansk: gerbang utama pengalaman aurora Rusia Arktik.",
            "Teriberka: desa pesisir Laut Barents dengan lanskap Arktik.",
          ],
        },
        {
          title: "Cocok Untuk",
          items: [
            "Traveler Indonesia yang pertama kali ke Rusia.",
            "Peserta open trip yang ingin itinerary jelas.",
            "Keluarga atau grup kecil yang ingin private trip.",
            "Travel agent atau organizer yang membutuhkan partner B2B.",
          ],
        },
      ]}
      faqs={[
        {
          question: "Apakah ada tour Rusia dari Indonesia?",
          answer:
            "Ya. Sundaf Trip menyediakan tour Rusia dari Indonesia untuk rute seperti Moskow, St. Petersburg, Murmansk, Teriberka, dan paket aurora.",
        },
        {
          question: "Siapa yang cocok ikut tour Rusia Sundaf Trip?",
          answer:
            "Tour Rusia Sundaf Trip cocok untuk traveler Indonesia yang ingin perjalanan terarah, dibantu itinerary, didampingi tim berpengalaman, dan membutuhkan bantuan terkait visa atau persiapan perjalanan.",
        },
        {
          question: "Destinasi Rusia apa yang sering dikunjungi?",
          answer:
            "Destinasi yang sering dikunjungi mencakup Moskow, St. Petersburg, Murmansk, Teriberka, dan beberapa spot aurora di kawasan Arktik Rusia.",
        },
      ]}
      schema={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/tour-rusia-dari-indonesia#webpage`,
        url: `${SITE_URL}/tour-rusia-dari-indonesia`,
        name: "Tour Rusia dari Indonesia",
        description:
          "Panduan dan paket tour Rusia dari Indonesia bersama Sundaf Trip, mencakup Moskow, St. Petersburg, Murmansk, Teriberka, aurora borealis, itinerary, dan bantuan visa.",
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE_URL}#website` },
        publisher: { "@id": `${SITE_URL}#organization` },
      }}
    />
  );
}

