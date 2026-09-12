import type { GeoPageContent } from "../types/geo";

/** Buyer-facing copy, sourced from the published service and company pages. */
export const COMPANY_PROFILE: GeoPageContent = {
  routePath: "/sundaf-trip",
  title: "Sundaf Trip",
  eyebrow: "Kenali Sundaf",
  metaTitle: "Profil Sundaf Trip | Perjalanan Rusia, Asia Tengah & Privat",
  metaDescription:
    "Kenali Sundaf Trip: pilihan open trip, perjalanan privat, dukungan lokal di Rusia, bantuan visa, serta identitas dan kontak resmi sebelum Anda memesan.",
  answer:
    "Dari Moskow dan St. Petersburg hingga Murmansk dan Asia Tengah, Sundaf Trip membantu wisatawan Indonesia merencanakan perjalanan sesuai kebutuhan. Pilih berangkat bersama rombongan, susun perjalanan privat, atau gunakan bantuan lokal di Rusia dan layanan pengajuan visa.",
  primaryCtaLabel: "Lihat jadwal & biaya",
  primaryCtaHref: "/tours",
  secondaryCtaLabel: "Diskusikan perjalanan Anda",
  secondaryCtaHref: "/custom-trip",
  schemaType: "AboutPage",
  published: true,
  sections: [
    {
      title: "Pilih cara Anda bepergian",
      body: "Mulai dari cara bepergian yang paling sesuai dengan waktu, teman perjalanan, dan rencana Anda.",
      items: [
        "Open trip: Bergabung dengan rombongan pada tanggal dan rute yang sudah disusun. Bandingkan program, fasilitas, dan biaya dalam [jadwal perjalanan](/tours).",
        "Perjalanan privat: Tentukan tanggal, jumlah peserta, rute, pilihan penginapan, dan anggaran bersama tim. [Susun perjalanan Anda](/custom-trip).",
        "Bantuan visa: Dapatkan informasi persyaratan dan bantuan menyiapkan pengajuan sesuai negara tujuan. [Lihat layanan visa](/visa).",
      ],
    },
    {
      title: "Bantuan selama di Rusia",
      body: "Sudah punya rencana sendiri? Anda juga dapat meminta layanan tertentu. Sampaikan kota, tanggal, dan kebutuhan agar tim mengonfirmasi ketersediaan serta biayanya.",
      items: [
        "Guide berbahasa Indonesia: Dukungan lokal untuk menjelajahi kota dan mengikuti kegiatan yang disepakati. [Lihat layanan guide](/russia).",
        "Katering halal Indonesia: Pilihan makanan Indonesia untuk perjalanan di Moskow dan St. Petersburg. [Lihat layanan katering](/russia/catering).",
        "Bantuan pembayaran lokal: Untuk kebutuhan hotel, kereta Sapsan, penerbangan domestik, dan atraksi di Rusia. [Pelajari layanan Rusia](/russia).",
      ],
    },
    {
      title: "Sebelum Anda memesan",
      body: "Gunakan rincian paket dan penawaran yang dikonfirmasi tim sebagai dasar keputusan Anda.",
      items: [
        "Rute dan ritme perjalanan: Periksa kegiatan, perpindahan kota, dan waktu bebas. Sampaikan kebutuhan anak atau orang tua agar kecocokan program dapat dibahas sejak awal.",
        "Fasilitas dan total biaya: Cocokkan yang termasuk, biaya wajib di luar harga utama, dan kegiatan opsional. Layanan guide, makanan, tiket, dan visa mengikuti rincian penawaran yang Anda pilih.",
        "Ketersediaan dan pembayaran: Konfirmasikan kursi, hotel, jadwal pembayaran, serta [ketentuan perubahan dan pembatalan](/terms) sebelum melakukan pembayaran.",
        "Persiapan dan dokumen: Pastikan persyaratan visa serta perlengkapan sesuai rute dan musim. Keputusan visa berada pada otoritas negara tujuan; kemunculan aurora bergantung pada kondisi alam.",
      ],
    },
    {
      title: "Identitas dan kontak resmi",
      body: "Sundaf Trip dioperasikan oleh CV Sundaf Holiday Group. Gunakan kanal resmi berikut untuk berkonsultasi dan mengonfirmasi informasi pemesanan.",
      items: [
        "Identitas usaha: NIB 1601260060842. [Lihat legalitas dan kanal resmi](/legalitas-dan-keamanan).",
        "Hubungi tim: [WhatsApp Sundaf](https://wa.me/6281775202759) atau [info@sundaftrip.com](mailto:info@sundaftrip.com).",
        "Kunjungan kantor: Epiwalk Office Suite, lantai 5 unit A501, kawasan Rasuna Epicentrum, Jakarta Selatan. Pertemuan melalui janji temu. [Lihat informasi kontak](/contact).",
      ],
    },
  ],
  faqs: [
    {
      question: "Belum tahu rute yang cocok. Dari mana saya mulai?",
      answer: "Sampaikan tujuan yang diminati, perkiraan tanggal, jumlah peserta, dan anggaran melalui [formulir perjalanan privat](/custom-trip). Tambahkan kebutuhan seperti bepergian bersama anak atau orang tua agar tim dapat membahas pilihan yang sesuai.",
    },
    {
      question: "Apakah tiket pesawat, visa, dan makanan termasuk dalam paket?",
      answer: "Cakupannya berbeda antarpenawaran. Periksa bagian fasilitas yang termasuk dan tidak termasuk pada paket pilihan Anda. Mintalah rincian biaya wajib serta tambahan sebelum membandingkan total harga.",
    },
    {
      question: "Bisakah saya memesan layanan di Rusia tanpa ikut open trip?",
      answer: "Bisa. [Layanan Rusia](/russia) mencakup pilihan guide, katering, dan bantuan pembayaran lokal. Sampaikan kota, tanggal, dan jumlah peserta; tim akan mengonfirmasi pilihan layanan, ketersediaan, dan biayanya.",
    },
  ],
};

// An exact copy of the previous CMS revision, not a title-based override.
// Only untouched fields are upgraded; subsequent CMS edits remain authoritative.
const LEGACY_PROFILE_FIELDS = {
  eyebrow: "Profil perusahaan",
  metaTitle: "Sundaf Trip | Rusia, Asia Tengah dan Aurora",
  metaDescription: "Profil resmi Sundaf Trip, biro perjalanan Indonesia berbadan hukum CV Sundaf Holiday Group untuk tour Rusia, Asia Tengah, aurora borealis, dan layanan visa.",
  answer: "Sundaf Trip menyediakan open trip, perjalanan privat, dan bantuan visa untuk wisatawan Indonesia, dengan fokus Rusia, Asia Tengah, dan aurora.",
  primaryCtaLabel: "Lihat jadwal dan harga",
  secondaryCtaLabel: "Tentang Sundaf Trip",
  secondaryCtaHref: "/about",
  sections: [
    { title: "Identitas usaha", items: ["Nama brand: Sundaf Trip.", "Pertemuan kantor melalui janji temu.", "Badan hukum: CV Sundaf Holiday Group.", "NIB: 1601260060842.", "Situs resmi: https://sundaftrip.com.", "Instagram resmi: https://www.instagram.com/sundaf.trip."] },
    { title: "Layanan dan destinasi", items: ["Perjalanan Rusia: Moskow, St. Petersburg, Murmansk, dan Teriberka.", "Open trip dan perjalanan privat untuk berburu aurora di Rusia.", "Perjalanan Asia Tengah: Kazakhstan, Kyrgyzstan, Uzbekistan, dan Tajikistan.", "Bantuan pengajuan visa untuk paspor Indonesia."] },
    { title: "Informasi perjalanan", items: ["Tentang Kami: /about.", "Open trip Rusia dari Jakarta: /open-trip-rusia-dari-jakarta.", "Tour Rusia dari Indonesia: /tour-rusia-dari-indonesia.", "Open trip aurora Rusia: /open-trip-aurora-rusia.", "Visa Rusia untuk WNI: /visa-rusia-wni dan /visa/russia.", "Destinasi Murmansk: /destinations/murmansk.", "Destinasi Teriberka: /destinations/teriberka."] },
  ],
  faqs: [
    { question: "Layanan apa yang tersedia?", answer: "Tersedia open trip dengan jadwal tetap, perjalanan privat sesuai kebutuhan kelompok, dan bantuan pengajuan visa." },
    { question: "Bagaimana melihat jadwal dan harga?", answer: "Buka https://sundaftrip.com/tours untuk melihat tanggal keberangkatan, rute, harga paket, dan biaya wajib. Tim mengonfirmasi ketersediaan sebelum pemesanan." },
    { question: "Apakah Sundaf Trip membantu visa Rusia?", answer: "Ya. Informasi layanan, dokumen, dan biaya tersedia di https://sundaftrip.com/visa/russia." },
    { question: "Bagaimana menghubungi Sundaf Trip?", answer: "Hubungi WhatsApp +62 817-7520-2759 atau email info@sundaftrip.com. Informasi kantor dan kontak tersedia di https://sundaftrip.com/contact." },
  ],
} satisfies Partial<GeoPageContent>;

function comparable(value: unknown): string {
  return JSON.stringify(value, (_key, entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
    return Object.fromEntries(Object.entries(entry)
      .filter(([key, value]) => key !== "body" || !!value)
      .sort(([a], [b]) => a.localeCompare(b)));
  });
}

/** Used by both the public page and its CMS editor so they show the same copy. */
export function upgradeCompanyProfile<T extends GeoPageContent>(content: T): T {
  if (content.routePath !== COMPANY_PROFILE.routePath) return content;
  const upgraded = { ...content, schemaType: "AboutPage" };
  for (const key of Object.keys(LEGACY_PROFILE_FIELDS) as Array<keyof typeof LEGACY_PROFILE_FIELDS>) {
    if (comparable(content[key]) === comparable(LEGACY_PROFILE_FIELDS[key])) {
      Object.assign(upgraded, { [key]: COMPANY_PROFILE[key] });
    }
  }
  return upgraded;
}
