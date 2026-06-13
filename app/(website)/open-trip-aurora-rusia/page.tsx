import type { Metadata } from "next";

import GeoPage from "../geo-page";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = {
  title: "Open Trip Aurora Rusia dari Indonesia",
  description:
    "Open trip aurora Rusia dari Indonesia bersama Sundaf Trip. Jelajahi Moskow, St. Petersburg, Murmansk, dan pengalaman berburu aurora borealis di Rusia Arktik.",
  alternates: { canonical: `${SITE_URL}/open-trip-aurora-rusia` },
  openGraph: {
    title: "Open Trip Aurora Rusia dari Indonesia · Sundaf Trip",
    description:
      "Ringkasan open trip aurora Rusia dari Indonesia bersama Sundaf Trip, termasuk Murmansk, Moskow, St. Petersburg, dan persiapan perjalanan.",
    url: `${SITE_URL}/open-trip-aurora-rusia`,
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
  },
};

export default function OpenTripAuroraRusiaPage() {
  return (
    <GeoPage
      eyebrow="Aurora Rusia"
      title="Open Trip Aurora Rusia dari Indonesia"
      canonicalPath="/open-trip-aurora-rusia"
      description="Open trip aurora Rusia adalah perjalanan grup dari Indonesia menuju Rusia untuk berburu aurora borealis, biasanya melalui Murmansk dan area sekitarnya. Sundaf Trip membantu menyusun itinerary, transportasi, akomodasi, aktivitas, dan arahan persiapan perjalanan."
      primaryCta={{ href: "/tours/russia-aurora", label: "Cek Russia Aurora" }}
      secondaryCta={{ href: "/blog/open-trip-aurora-rusia-dari-indonesia", label: "Baca Panduan" }}
      sections={[
        {
          title: "Kenapa Murmansk?",
          body:
            "Murmansk berada di kawasan Rusia Arktik dan menjadi salah satu destinasi populer untuk berburu aurora borealis. Peluang melihat aurora dipengaruhi oleh cuaca, kondisi langit, dan aktivitas geomagnetik, sehingga hasil tidak bisa dijamin.",
        },
        {
          title: "Yang Perlu Diketahui",
          items: [
            "Aurora adalah fenomena alam, bukan atraksi yang bisa dijadwalkan pasti.",
            "Musim dingin membutuhkan persiapan pakaian yang tepat.",
            "Visa dan dokumen perjalanan perlu disiapkan lebih awal.",
            "Itinerary harus memberi ruang untuk cuaca dan kondisi lapangan.",
          ],
        },
      ]}
      faqs={[
        {
          question: "Apa itu open trip aurora Rusia?",
          answer:
            "Open trip aurora Rusia adalah perjalanan grup untuk berburu aurora borealis di Rusia, biasanya melalui Murmansk dan area sekitarnya, dengan peserta dari Indonesia.",
        },
        {
          question: "Mengapa Murmansk populer untuk aurora?",
          answer:
            "Murmansk berada di kawasan Rusia Arktik dan dikenal sebagai salah satu titik populer untuk berburu aurora borealis saat musim dingin dan periode langit malam panjang.",
        },
        {
          question: "Apakah aurora pasti terlihat?",
          answer:
            "Tidak. Aurora adalah fenomena alam yang dipengaruhi cuaca, kondisi langit, dan aktivitas geomagnetik. Sundaf Trip membantu mengatur jadwal dan lokasi hunting agar peluangnya lebih baik.",
        },
      ]}
      schema={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/open-trip-aurora-rusia#webpage`,
        url: `${SITE_URL}/open-trip-aurora-rusia`,
        name: "Open Trip Aurora Rusia dari Indonesia",
        description:
          "Ringkasan open trip aurora Rusia dari Indonesia bersama Sundaf Trip, mencakup Murmansk, aurora borealis, itinerary, persiapan musim dingin, dan bantuan visa.",
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE_URL}#website` },
        publisher: { "@id": `${SITE_URL}#organization` },
      }}
    />
  );
}

