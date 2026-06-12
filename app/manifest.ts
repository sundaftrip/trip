/* PWA manifest untuk Sundaf Trip, Next auto-serve di /manifest.webmanifest.
   Icons pakai favicon.svg (scalable) + PNG persegi di /icons (rasterisasi
   favicon.svg; logo.png 862x241 tidak persegi sehingga ditolak installability
   audit). theme_color disinkronkan dengan latar hero gelap supaya
   status bar Android & PWA splash terlihat satu nada. */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sundaf Trip, Paket Wisata Terpercaya",
    short_name: "Sundaf Trip",
    description:
      "Spesialis open trip Russia, Aurora, 4-TAN & destinasi pilihan untuk pemegang paspor Indonesia. Layanan pengurusan visa & paket wisata lengkap.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "id",
    categories: ["travel", "lifestyle", "business"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
