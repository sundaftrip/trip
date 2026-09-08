import type { Metadata } from "next";
import { buildWhatsAppHref } from "./utils";

export const LATIN_AMERICA_BROCHURE = "/downloads/sundaf-trip-peru-south-america-2027.pdf";
export const LATIN_AMERICA_STATUS = "Pengembangan program 2027";

export type LatinAmericaProgramme = {
  id: string;
  href: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
  imageAlt: string;
  route: string[];
  introduction: string;
  stages: { title: string; description: string }[];
  planningNote: string;
  englishSummary: string;
};

export const LATIN_AMERICA_PROGRAMMES: LatinAmericaProgramme[] = [
  {
    id: "peru",
    href: "/peru-amerika-selatan",
    title: "Peru: Lima, Cusco & Machu Picchu",
    eyebrow: "Fokus satu negara",
    summary: "Rancang perjalanan grup yang berfokus pada Peru, dari Lima hingga kawasan Andes dan Machu Picchu.",
    image: "/images/latin-america/machu-picchu.webp",
    imageAlt: "Situs Machu Picchu di antara pegunungan Peru",
    route: ["Lima", "Cusco", "Ollantaytambo", "Aguas Calientes", "Machu Picchu", "Cusco"],
    introduction: "Mulai dari suasana kota Lima, lanjutkan ke Cusco dan perjalanan kereta menuju Aguas Calientes. Rangkaian kunjungan Machu Picchu menjadi bagian utama rancangan Peru ini. Sampaikan waktu dan kebutuhan grupmu untuk menyusun durasi serta ritme perjalanan yang sesuai.",
    stages: [
      { title: "Lima", description: "Rancangan kunjungan kota mencakup Plaza de Armas dan Huaca Pucllana. Waktu kedatangan dan penerbangan lanjutan menentukan susunan agenda." },
      { title: "Cusco & Ollantaytambo", description: "Lanjutkan ke Cusco, lalu menuju stasiun Ollantaytambo. Alokasi waktu istirahat, perjalanan darat, dan jadwal kereta akan disesuaikan dalam penawaran." },
      { title: "Aguas Calientes & Machu Picchu", description: "Perjalanan kereta menuju Aguas Calientes, rencana menginap, dan kunjungan Machu Picchu dengan pemandu lokal. Tiket masuk, sirkuit, serta kereta menunggu konfirmasi ketersediaan." },
      { title: "Kembali ke Cusco", description: "Perjalanan kembali melalui Ollantaytambo dan Cusco. Rute kepulangan atau tambahan destinasi dapat dimintakan sesuai kebutuhan grup." },
    ],
    planningNote: "Rancangan Peru ini dikembangkan dari segmen Peru dalam proposal Amerika Selatan yang telah diterima. Program Peru terpisah memerlukan penawaran baru; durasi, penerbangan, hotel, dan biaya akhirnya akan dikonfirmasi sesuai permintaan.",
    englishSummary: "Sundaf Trip is developing a Peru-focused group programme for Indonesian travellers, drawing on the Peru segment of regional supplier proposals already received. The indicative route covers Lima, Cusco, Ollantaytambo, Aguas Calientes and Machu Picchu. A standalone Peru quotation is required; final dates, duration, services and availability will be confirmed for each enquiry.",
  },
  {
    id: "empat-negara",
    href: "/amerika-latin/brasil-kolombia-peru-chile",
    title: "Brasil, Kolombia, Peru & Chile",
    eyebrow: "Eksplorasi empat negara",
    summary: "Gabungkan kota-kota Amerika Selatan, Machu Picchu, Rio de Janeiro, dan air terjun Iguazu dalam satu rancangan perjalanan grup.",
    image: "/images/latin-america/rio-de-janeiro.webp",
    imageAlt: "Pemandangan kota dan pegunungan Rio de Janeiro, Brasil",
    route: ["São Paulo", "Bogotá", "Lima", "Cusco & Machu Picchu", "Santiago", "Rio de Janeiro", "Iguazu", "São Paulo"],
    introduction: "Satu rancangan lintas negara dengan Peru sebagai bagian utama perjalanan. Dari São Paulo dan singgah di Bogotá, rute berlanjut ke Lima, Cusco dan Machu Picchu, lalu Santiago, Rio de Janeiro serta Iguazu sebelum kembali ke São Paulo.",
    stages: [
      { title: "Brasil & Kolombia", description: "Awali rute di São Paulo, lalu singgah di Bogotá dalam perjalanan menuju Lima. Kunjungan kota Bogotá bergantung pada jadwal penerbangan dan waktu transit yang memadai." },
      { title: "Peru", description: "Rangkaian Lima, Cusco, Ollantaytambo, Aguas Calientes dan Machu Picchu. Perjalanan kereta serta kunjungan situs dimintakan dalam penawaran supplier." },
      { title: "Chile", description: "Lanjutkan ke Santiago. Pilihan aktivitas sekitar kota dan kawasan pegunungan disesuaikan dengan musim, kebutuhan grup serta kelayakan operasional." },
      { title: "Rio de Janeiro & Iguazu", description: "Rancangan kunjungan Rio mencakup Christ the Redeemer dan Sugarloaf, dilanjutkan air terjun Iguazu sisi Brasil, lalu kembali ke São Paulo untuk perjalanan pulang." },
    ],
    planningNote: "Proposal supplier untuk program empat negara telah diterima. Durasi total dari Indonesia, susunan penerbangan, waktu transit, jumlah malam, serta harga akhir masih diselaraskan. Rancangan ini belum memiliki tanggal keberangkatan terkonfirmasi.",
    englishSummary: "Sundaf Trip is developing Brazil, Colombia, Peru and Chile group programmes for the Indonesian market in 2027. Detailed regional supplier proposals have been received and are being reviewed. The indicative itinerary includes São Paulo, Bogotá, Lima, Cusco, Machu Picchu, Santiago, Rio de Janeiro and Iguazu. Departure dates, total duration, air routing, pricing and availability remain subject to quotation and operational confirmation.",
  },
];

export function latinAmericaEnquiryHref(programme = "Peru & Amerika Latin 2027") {
  return buildWhatsAppHref("6281775202759", `Halo Sundaf Trip, saya ingin meminta rancangan dan penawaran ${programme}.\n\nNama:\nPerkiraan bulan perjalanan:\nJumlah peserta:\nKota keberangkatan:\nKebutuhan atau anggaran:\n\nSaya memahami tanggal, harga, dan ketersediaan akan dikonfirmasi melalui penawaran.`);
}

export function latinAmericaMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `https://sundaftrip.com${path}` },
    openGraph: { title: `${title} · Sundaf Trip`, description, url: `https://sundaftrip.com${path}`, siteName: "Sundaf Trip", locale: "id_ID", type: "website", images: [{ url: "/images/latin-america/machu-picchu.webp", width: 1600, height: 1067, alt: "Machu Picchu, Peru" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/images/latin-america/machu-picchu.webp"] },
  };
}
