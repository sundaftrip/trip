import type { Metadata } from "next";
import { buildWhatsAppHref } from "./utils";

export const LATIN_AMERICA_BROCHURE = "/downloads/sundaf-trip-peru-south-america-2027.pdf";
export const LATIN_AMERICA_STATUS = "Paket grup · Keberangkatan sesuai permintaan";

export type LatinAmericaProgramme = {
  id: string;
  href: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
  imageAlt: string;
  route: string[];
};

export const LATIN_AMERICA_PROGRAMMES: LatinAmericaProgramme[] = [
  {
    "id": "peru",
    "href": "/peru-amerika-selatan",
    "title": "Peru: Lima, Cusco & Machu Picchu",
    "eyebrow": "Peru",
    "summary": "Dua malam di Lima, kota Cusco, Sacred Valley, dan kereta menuju Machu Picchu. Perjalanan dilengkapi kunjungan Vinicunca / Rainbow Mountain.",
    "image": "/images/latin-america/machu-picchu-panorama.webp",
    "imageAlt": "Situs Machu Picchu di antara pegunungan Peru",
    "route": [
      "Lima",
      "Cusco",
      "Sacred Valley",
      "Aguas Calientes",
      "Machu Picchu",
      "Vinicunca",
      "Cusco"
    ]
  },
  {
    "id": "empat-negara",
    "href": "/amerika-latin/brasil-kolombia-peru-chile",
    "title": "Brasil, Kolombia, Peru & Chile",
    "eyebrow": "Empat negara",
    "summary": "São Paulo dan Bogotá, lalu Peru dan Chile. Kembali ke Brasil untuk Rio de Janeiro dan air terjun Iguazu.",
    "image": "/images/latin-america/rio-de-janeiro-sunrise.webp",
    "imageAlt": "Pemandangan kota dan pegunungan Rio de Janeiro, Brasil",
    "route": [
      "São Paulo",
      "Bogotá",
      "Lima",
      "Cusco & Machu Picchu",
      "Santiago",
      "Rio de Janeiro",
      "Iguazu",
      "São Paulo"
    ]
  }
];

export function latinAmericaEnquiryHref(programme = "Peru & Amerika Latin") {
  return buildWhatsAppHref("6281775202759", `Halo Sundaf Trip, saya ingin tanya perjalanan ${programme} untuk 2027.\n\nRencana bulan:\nJumlah peserta:\nBerangkat dari:\nKebutuhan lainnya:`);
}

export function latinAmericaMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `https://sundaftrip.com${path}` },
    openGraph: { title: `${title} · Sundaf Trip`, description, url: `https://sundaftrip.com${path}`, siteName: "Sundaf Trip", locale: "id_ID", type: "website", images: [{ url: "/images/latin-america/machu-picchu-panorama.webp", width: 2560, height: 1716, alt: "Machu Picchu, Peru" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/images/latin-america/machu-picchu-panorama.webp"] },
  };
}
