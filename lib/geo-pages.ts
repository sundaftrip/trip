import "server-only";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { GeoFaq, GeoPageContent, GeoSection } from "@/types/geo";

const SITE_URL = "https://sundaftrip.com";

export const GEO_FALLBACKS: Record<string, GeoPageContent> = {
  "/tour-rusia-dari-indonesia": {
    routePath: "/tour-rusia-dari-indonesia",
    title: "Tour Rusia dari Indonesia",
    eyebrow: "Ringkasan GEO",
    metaDescription:
      "Tour Rusia dari Indonesia bersama Sundaf Trip untuk rute Moskow, St. Petersburg, Murmansk, Teriberka, dan aurora. Tersedia open trip, private trip, itinerary, dan bantuan visa.",
    answer:
      "Sundaf Trip menyediakan tour Rusia dari Indonesia untuk traveler yang ingin mengunjungi Moskow, St. Petersburg, Murmansk, Teriberka, dan destinasi aurora borealis. Layanan mencakup paket perjalanan, itinerary, pendampingan, dan bantuan pengurusan visa Rusia untuk WNI.",
    primaryCtaLabel: "Lihat Paket Tour",
    primaryCtaHref: "/tours",
    secondaryCtaLabel: "Cek Visa Rusia",
    secondaryCtaHref: "/visa/russia",
    schemaType: "CollectionPage",
    published: true,
    sections: [
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
    ],
    faqs: [
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
    ],
  },
  "/open-trip-aurora-rusia": {
    routePath: "/open-trip-aurora-rusia",
    title: "Open Trip Aurora Rusia dari Indonesia",
    eyebrow: "Aurora Rusia",
    metaDescription:
      "Open trip aurora Rusia dari Indonesia bersama Sundaf Trip. Jelajahi Moskow, St. Petersburg, Murmansk, dan pengalaman berburu aurora borealis di Rusia Arktik.",
    answer:
      "Open trip aurora Rusia adalah perjalanan grup dari Indonesia menuju Rusia untuk berburu aurora borealis, biasanya melalui Murmansk dan area sekitarnya. Sundaf Trip membantu menyusun itinerary, transportasi, akomodasi, aktivitas, dan arahan persiapan perjalanan.",
    primaryCtaLabel: "Cek Russia Aurora",
    primaryCtaHref: "/tours/russia-aurora",
    secondaryCtaLabel: "Baca Panduan",
    secondaryCtaHref: "/blog/open-trip-aurora-rusia-dari-indonesia",
    schemaType: "CollectionPage",
    published: true,
    sections: [
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
    ],
    faqs: [
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
    ],
  },
  "/visa-rusia-wni": {
    routePath: "/visa-rusia-wni",
    title: "Visa Rusia untuk WNI",
    eyebrow: "Visa Rusia",
    metaDescription:
      "Informasi visa Rusia untuk WNI dan layanan pengurusan e-Visa Rusia oleh Sundaf Trip. Cek biaya, estimasi proses, dokumen dasar, dan konsultasi sebelum pengajuan.",
    answer:
      "WNI memerlukan visa untuk masuk ke Rusia. Sundaf Trip membantu pengurusan e-Visa Rusia untuk pemegang paspor Indonesia, termasuk pengecekan dokumen, pengajuan, dan arahan persiapan perjalanan.",
    primaryCtaLabel: "Ajukan Visa Rusia",
    primaryCtaHref: "/visa/russia",
    secondaryCtaLabel: "Cek Tour Rusia",
    secondaryCtaHref: "/tours/russia-aurora",
    schemaType: "WebPage",
    published: true,
    sections: [
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
    ],
    faqs: [
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
    ],
  },
  "/destinations/murmansk": {
    routePath: "/destinations/murmansk",
    title: "Wisata Murmansk & Aurora Borealis",
    eyebrow: "GEO Destinasi",
    metaDescription:
      "Panduan wisata Murmansk untuk traveler Indonesia: aurora borealis, cara ke sana, visa Rusia, musim terbaik, estimasi budget, dan paket tour Sundaf Trip.",
    answer:
      "Murmansk adalah kota besar di Rusia Arktik yang populer untuk berburu aurora borealis. Untuk traveler Indonesia, Murmansk biasanya dikunjungi bersama Moskow, St. Petersburg, dan Teriberka dengan bantuan itinerary, transportasi, dan visa Rusia.",
    primaryCtaLabel: "Lihat Paket Murmansk",
    primaryCtaHref: "#paket-tour",
    secondaryCtaLabel: "Cek Visa Rusia",
    secondaryCtaHref: "/visa/russia",
    schemaType: "Article",
    published: true,
    sections: [],
    faqs: [
      {
        question: "Kapan waktu terbaik melihat aurora di Murmansk?",
        answer: "Oktober sampai Maret. Puncaknya Desember-Februari karena langit lebih gelap dan malam lebih panjang.",
      },
      {
        question: "Apakah WNI perlu visa untuk ke Murmansk?",
        answer: "Ya. Murmansk berada di Rusia, sehingga pemegang paspor Indonesia perlu menyiapkan visa Rusia sebelum perjalanan.",
      },
    ],
  },
  "/destinations/teriberka": {
    routePath: "/destinations/teriberka",
    title: "Wisata Teriberka & Laut Barents",
    eyebrow: "GEO Destinasi",
    metaDescription:
      "Panduan wisata Teriberka untuk traveler Indonesia: Laut Barents, aurora, whale watching, Pantai Telur Naga, akses dari Murmansk, dan paket Rusia Arktik.",
    answer:
      "Teriberka adalah desa nelayan di tepi Laut Barents, Rusia, sekitar 120 km dari Murmansk. Destinasi ini populer untuk lanskap Arktik, aurora, whale watching musiman, Pantai Telur Naga, dan pengalaman Rusia ujung utara.",
    primaryCtaLabel: "Lihat Paket Teriberka",
    primaryCtaHref: "#paket-tour",
    secondaryCtaLabel: "Baca Murmansk",
    secondaryCtaHref: "/destinations/murmansk",
    schemaType: "Article",
    published: true,
    sections: [],
    faqs: [
      {
        question: "Teriberka itu di mana?",
        answer: "Teriberka adalah desa nelayan terpencil di tepi Laut Barents, Kola Peninsula, Rusia, sekitar 120 km dari Murmansk.",
      },
      {
        question: "Kapan waktu terbaik ke Teriberka?",
        answer: "Untuk aurora, Oktober-Maret. Untuk whale watching, musim yang lebih relevan biasanya saat laut tidak membeku, sekitar Juni-Oktober.",
      },
    ],
  },
};

function asSections(value: unknown, fallback: GeoSection[]): GeoSection[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      body: typeof item.body === "string" ? item.body : undefined,
      items: Array.isArray(item.items) ? item.items.filter((v): v is string => typeof v === "string") : undefined,
    }))
    .filter((item) => item.title);
}

function asFaqs(value: unknown, fallback: GeoFaq[]): GeoFaq[] {
  if (!Array.isArray(value)) return fallback;
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      question: typeof item.question === "string" ? item.question : "",
      answer: typeof item.answer === "string" ? item.answer : "",
    }))
    .filter((item) => item.question && item.answer);
}

function mergeWithFallback(row: Record<string, unknown>, fallback: GeoPageContent): GeoPageContent {
  return {
    ...fallback,
    title: typeof row.title === "string" && row.title ? row.title : fallback.title,
    eyebrow: typeof row.eyebrow === "string" && row.eyebrow ? row.eyebrow : fallback.eyebrow,
    metaTitle: typeof row.metaTitle === "string" && row.metaTitle ? row.metaTitle : fallback.metaTitle,
    metaDescription:
      typeof row.metaDescription === "string" && row.metaDescription ? row.metaDescription : fallback.metaDescription,
    answer: typeof row.answer === "string" && row.answer ? row.answer : fallback.answer,
    primaryCtaLabel:
      typeof row.primaryCtaLabel === "string" ? row.primaryCtaLabel : fallback.primaryCtaLabel,
    primaryCtaHref:
      typeof row.primaryCtaHref === "string" ? row.primaryCtaHref : fallback.primaryCtaHref,
    secondaryCtaLabel:
      typeof row.secondaryCtaLabel === "string" ? row.secondaryCtaLabel : fallback.secondaryCtaLabel,
    secondaryCtaHref:
      typeof row.secondaryCtaHref === "string" ? row.secondaryCtaHref : fallback.secondaryCtaHref,
    sections: asSections(row.sections, fallback.sections),
    faqs: asFaqs(row.faqs, fallback.faqs),
    schemaType: typeof row.schemaType === "string" && row.schemaType ? row.schemaType : fallback.schemaType,
    published: typeof row.published === "boolean" ? row.published : fallback.published,
  };
}

export const getGeoPageContent = unstable_cache(
  async (routePath: string): Promise<GeoPageContent> => {
    const fallback = GEO_FALLBACKS[routePath];
    if (!fallback) throw new Error(`Unknown GEO route: ${routePath}`);
    try {
      const row = await prisma.geoPage.findUnique({ where: { routePath } });
      if (!row || !row.published) return fallback;
      return mergeWithFallback(row as unknown as Record<string, unknown>, fallback);
    } catch {
      return fallback;
    }
  },
  ["geo-page-content-v1"],
  { revalidate: 3600, tags: ["geo-pages"] }
);

export function geoMetadata(content: GeoPageContent): Metadata {
  const url = `${SITE_URL}${content.routePath}`;
  const title = content.metaTitle || content.title;
  return {
    title,
    description: content.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · Sundaf Trip`,
      description: content.metaDescription,
      url,
      siteName: "Sundaf Trip",
      locale: "id_ID",
      type: "website",
    },
  };
}

export function geoPageSchema(content: GeoPageContent): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": content.schemaType || "WebPage",
    "@id": `${SITE_URL}${content.routePath}#webpage`,
    url: `${SITE_URL}${content.routePath}`,
    name: content.title,
    description: content.metaDescription,
    inLanguage: "id-ID",
    isPartOf: { "@id": `${SITE_URL}#website` },
    publisher: { "@id": `${SITE_URL}#organization` },
  };
}
