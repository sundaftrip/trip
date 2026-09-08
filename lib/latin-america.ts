import type { Metadata } from "next";
import { buildWhatsAppHref } from "./utils";

export const LATIN_AMERICA_BROCHURE = "/downloads/sundaf-trip-peru-south-america-2027.pdf";
export const LATIN_AMERICA_STATUS = "Perjalanan grup · Penawaran sesuai permintaan";

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
    eyebrow: "Peru",
    summary: "Kunjungi Lima dan Cusco, lalu naik kereta ke Aguas Calientes untuk bermalam sebelum perjalanan ke Machu Picchu.",
    image: "/images/latin-america/machu-picchu.webp",
    imageAlt: "Situs Machu Picchu di antara pegunungan Peru",
    route: ["Lima", "Cusco", "Ollantaytambo", "Aguas Calientes", "Machu Picchu", "Cusco"],
    introduction: "Mulai dari Lima, lalu terbang ke Cusco. Dari sana, perjalanan darat menuju Ollantaytambo dilanjutkan dengan kereta ke Aguas Calientes. Setelah bermalam dan mengunjungi Machu Picchu, kembali melalui Ollantaytambo dan Cusco.",
    stages: [
      { title: "Lima", description: "Kunjungan kota ke Plaza de Armas dan Huaca Pucllana, sebelum melanjutkan perjalanan dengan penerbangan ke Cusco." },
      { title: "Cusco & Ollantaytambo", description: "Dari Cusco, perjalanan darat menuju stasiun Ollantaytambo. Di sini perjalanan berganti ke kereta menuju Aguas Calientes." },
      { title: "Aguas Calientes & Machu Picchu", description: "Bermalam di Aguas Calientes sebelum mengunjungi Machu Picchu bersama pemandu lokal. Setelah kunjungan, kembali dengan kereta ke Ollantaytambo." },
      { title: "Kembali ke Cusco", description: "Transfer kembali ke Cusco. Waktu luang atau tambahan malam bisa dimasukkan sebelum perjalanan pulang." },
    ],
    planningNote: "Contoh rute untuk perjalanan 2027. Jadwal harian, jumlah malam, hotel, tiket Machu Picchu dan harga disusun sesuai tanggal serta jumlah peserta. Belum ada tanggal keberangkatan tetap.",
    englishSummary: "We are adding Peru to Sundaf Trip’s outbound portfolio for Indonesian groups in 2027. Our proposed route connects Lima, Cusco, Ollantaytambo, Aguas Calientes and Machu Picchu. It is based on the Peru segment of South America supplier proposals received in August 2026. A standalone Peru quotation is still required. We accept tailored group enquiries; dates, duration and prices are confirmed in a written offer.",
  },
  {
    id: "empat-negara",
    href: "/amerika-latin/brasil-kolombia-peru-chile",
    title: "Brasil, Kolombia, Peru & Chile",
    eyebrow: "Empat negara",
    summary: "São Paulo dan Bogotá, lalu Peru dan Chile. Kembali ke Brasil untuk Rio de Janeiro dan air terjun Iguazu.",
    image: "/images/latin-america/rio-de-janeiro.webp",
    imageAlt: "Pemandangan kota dan pegunungan Rio de Janeiro, Brasil",
    route: ["São Paulo", "Bogotá", "Lima", "Cusco & Machu Picchu", "Santiago", "Rio de Janeiro", "Iguazu", "São Paulo"],
    introduction: "Rute dimulai dan berakhir di São Paulo. Di antaranya, singgah di Bogotá, kunjungi Lima dan Machu Picchu, lalu lanjutkan ke Santiago. Bagian akhir perjalanan kembali ke Brasil untuk Rio de Janeiro dan air terjun Iguazu.",
    stages: [
      { title: "São Paulo & Bogotá", description: "Tiba di São Paulo, lalu terbang melalui Bogotá menuju Lima. Kunjungan kota Bogotá bisa masuk jika waktu transit mencukupi." },
      { title: "Lima, Cusco & Machu Picchu", description: "City tour Lima, penerbangan ke Cusco, lalu perjalanan darat dan kereta ke Aguas Calientes. Bermalam sebelum kunjungan Machu Picchu, kemudian kembali ke Cusco." },
      { title: "Santiago", description: "Dari Cusco, lanjutkan ke Santiago. Kunjungan sekitar kota atau perjalanan ke kawasan pegunungan dipilih sesuai musim dan kebutuhan grup." },
      { title: "Rio de Janeiro & Iguazu", description: "Christ the Redeemer, Sugarloaf, Copacabana dan Ipanema dalam rangkaian Rio. Lanjutkan ke air terjun Iguazu sisi Brasil sebelum kembali ke São Paulo." },
    ],
    planningNote: "Contoh rute untuk perjalanan 2027. Urutan kota, waktu transit dan jumlah malam mengikuti jadwal penerbangan. Harga mencakup layanan yang disepakati dalam penawaran; belum ada tanggal keberangkatan tetap.",
    englishSummary: "Since August 2026, we have requested group quotations and received detailed proposals for Brazil, Colombia, Peru and Chile. The itinerary includes Lima, Cusco and Machu Picchu, alongside São Paulo, Bogotá, Santiago, Rio de Janeiro and Iguazu. We are reviewing ground services and regional flights for Indonesian groups travelling in 2027, and accept enquiries for tailored quotations. Final dates, duration, prices and availability are confirmed in writing.",
  },
];

export function latinAmericaEnquiryHref(programme = "Peru & Amerika Latin") {
  return buildWhatsAppHref("6281775202759", `Halo Sundaf Trip, saya ingin tanya perjalanan ${programme} untuk 2027.\n\nRencana bulan:\nJumlah peserta:\nBerangkat dari:\nKebutuhan lainnya:`);
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
