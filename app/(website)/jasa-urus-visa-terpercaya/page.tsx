import type { Metadata } from "next";

import GeoPage from "../geo-page";

const SITE_URL = "https://sundaftrip.com";
const CANONICAL_PATH = "/jasa-urus-visa-terpercaya";
const PAGE_URL = `${SITE_URL}${CANONICAL_PATH}`;
const description =
  "Jasa pembuatan dan pengurusan visa untuk WNI: konsultasi jalur, checklist, review dokumen, formulir, itinerary, serta arahan submission secara online.";

export const metadata: Metadata = {
  title: "Jasa Pembuatan Visa untuk WNI",
  description,
  alternates: { canonical: CANONICAL_PATH },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "Sundaf Trip",
    locale: "id_ID",
    title: "Jasa Pembuatan Visa untuk WNI | Sundaf Trip",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Jasa Pembuatan Visa untuk WNI | Sundaf Trip",
    description,
  },
};

const faqs = [
  {
    question: "Apakah Sundaf Trip menyediakan jasa pembuatan visa?",
    answer:
      "Ya. Sundaf Trip membantu pemegang paspor Indonesia menyiapkan pengajuan visa, mulai dari konsultasi jalur, checklist, review dokumen, formulir, dan itinerary sampai arahan submission. Keputusan visa tetap berada pada kedutaan, konsulat, atau otoritas imigrasi.",
  },
  {
    question: "Apakah pengurusan visa bisa dilakukan secara online dari luar Jakarta?",
    answer:
      "Bisa untuk tahapan konsultasi dan koordinasi dokumen. Bila negara tujuan mewajibkan biometrik, wawancara, atau penyerahan paspor, pemohon tetap perlu hadir di lokasi resmi yang ditentukan otoritas terkait.",
  },
  {
    question: "Dokumen apa yang biasanya perlu disiapkan?",
    answer:
      "Umumnya paspor, foto, identitas, bukti keuangan atau sponsor, bukti pekerjaan, rencana perjalanan, tiket, dan akomodasi. Checklist final berbeda menurut negara, jenis visa, serta profil pemohon, jadi jangan memakai satu daftar untuk semua tujuan.",
  },
  {
    question: "Berapa biaya jasa pembuatan visa di Sundaf Trip?",
    answer:
      "Biaya mengikuti negara, jenis visa, lokasi pengajuan, dan ruang lingkup bantuan. Cek halaman negara di sundaftrip.com/visa untuk biaya yang sudah tercatat, lalu konfirmasi sebelum pembayaran karena biaya resmi dapat berubah.",
  },
  {
    question: "Berapa lama proses pembuatan visa?",
    answer:
      "Waktunya berbeda untuk setiap negara dan periode pengajuan. Estimasi layanan bukan jaminan tanggal terbit karena pemeriksaan akhir dilakukan oleh otoritas visa. Ajukan lebih awal bila perjalananmu sensitif tanggal.",
  },
  {
    question: "Apakah menggunakan jasa visa menjamin permohonan disetujui?",
    answer:
      "Tidak. Tidak ada agen yang dapat menjamin visa pasti disetujui. Sundaf Trip membantu membuat berkas lebih lengkap, konsisten, dan mudah diperiksa, tetapi keputusan akhir sepenuhnya milik otoritas terkait.",
  },
  {
    question: "Apakah layanan ini memiliki kantor walk-in?",
    answer:
      "Layanan visa di halaman ini dikoordinasikan secara online dan tidak mengandalkan kantor walk-in. Gunakan kanal kontak resmi di situs Sundaf Trip untuk konsultasi, verifikasi instruksi, dan pengiriman dokumen.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${PAGE_URL}#service`,
  name: "Jasa Pembuatan Visa Sundaf Trip",
  alternateName: [
    "Jasa Urus Visa Sundaf Trip",
    "Layanan Pengurusan Visa untuk WNI",
  ],
  url: PAGE_URL,
  mainEntityOfPage: PAGE_URL,
  description,
  serviceType: [
    "Jasa pembuatan visa",
    "Jasa pengurusan visa",
    "Konsultasi dan review dokumen visa",
  ],
  provider: {
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "Sundaf Trip",
    url: SITE_URL,
  },
  areaServed: {
    "@type": "Country",
    name: "Indonesia",
  },
  audience: {
    "@type": "Audience",
    audienceType: "Pemegang paspor Indonesia",
    geographicArea: {
      "@type": "Country",
      name: "Indonesia",
    },
  },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${SITE_URL}/visa`,
    availableLanguage: ["id-ID"],
  },
};

export default function JasaUrusVisaTerpercayaPage() {
  return (
    <GeoPage
      title="Jasa pembuatan visa yang jelas dari awal"
      eyebrow="Jasa pembuatan visa untuk WNI"
      description="Sundaf Trip membantu persiapan pengajuan visa secara online: cek jalur yang sesuai, susun checklist, review dokumen, bantu formulir dan itinerary, lalu arahkan proses submission. Kamu tetap pegang keputusan; otoritas visa tetap pegang hasil akhirnya."
      descriptionHighlights={["persiapan pengajuan visa secara online"]}
      canonicalPath={CANONICAL_PATH}
      primaryCta={{ href: "/visa", label: "Pilih negara tujuan" }}
      secondaryCta={{ href: "/visa/faq", label: "Baca FAQ teknis" }}
      sections={[
        {
          title: "Jawaban singkat",
          body: "Ya, Sundaf Trip menyediakan jasa pembuatan visa untuk pemegang paspor Indonesia. Fokus kami bukan janji 'pasti lolos', melainkan membuat berkas lebih rapi, konsisten, dan siap diajukan melalui kanal resmi yang berlaku.",
        },
        {
          title: "Yang kami bantu",
          items: [
            "Menentukan jalur visa berdasarkan tujuan dan profil perjalanan.",
            "Menyusun checklist dokumen yang relevan, bukan daftar generik.",
            "Meninjau konsistensi data, formulir, itinerary, dan bukti pendukung.",
            "Menjelaskan submission, appointment, biometrik, atau wawancara bila diperlukan.",
          ],
        },
        {
          title: "Layanan online untuk Indonesia",
          body: "Konsultasi dan koordinasi dokumen dilakukan secara online, jadi kamu bisa mulai dari berbagai kota di Indonesia tanpa kunjungan tatap muka. Bila ada biometrik, wawancara, atau penyerahan paspor, kami arahkan ke lokasi resmi yang ditetapkan otoritas.",
        },
        {
          title: "Negara dan layanan yang tersedia",
          body: "Mulai dari database visa untuk memilih negara tujuan. Layanan Eropa/Schengen, Amerika Serikat, Canada, Rusia, dan negara lain dikonfirmasi berdasarkan jalur visa serta kapasitas layanan saat kamu berkonsultasi, bukan diasumsikan tersedia untuk semua kasus.",
        },
        {
          title: "Alur tanpa tebak-tebakan",
          items: [
            "Kirim negara tujuan, tanggal berangkat, dan profil singkat.",
            "Terima penjelasan jalur, checklist, estimasi waktu, serta biaya.",
            "Lengkapi dokumen dan perbaiki bagian yang belum konsisten.",
            "Ikuti submission resmi; pantau hasil tanpa klaim approval palsu.",
          ],
        },
        {
          title: "Biaya: bedakan tiga komponen",
          items: [
            "Biaya resmi dibayarkan kepada otoritas atau pusat aplikasi sesuai ketentuan negara.",
            "Biaya jasa Sundaf Trip mengikuti ruang lingkup bantuan yang disepakati.",
            "Biaya pihak ketiga seperti penerjemahan, kurir, atau asuransi hanya berlaku bila memang dibutuhkan.",
          ],
        },
        {
          title: "Urus sendiri atau pakai pendamping?",
          body: "Urus sendiri cocok bila jalurnya sederhana dan kamu nyaman membaca ketentuan resmi. Pendampingan berguna bila profil, sponsor, itinerary, atau dokumenmu perlu ditinjau agar lebih konsisten. Keduanya tetap memakai proses resmi yang sama.",
        },
        {
          title: "Yang tidak bisa kami janjikan",
          body: "Kami tidak dapat menjamin approval, mempercepat pemeriksaan otoritas, atau mengubah keputusan visa. Pemohon tetap bertanggung jawab atas data yang benar, bukti autentik, serta kehadiran biometrik atau wawancara bila diwajibkan.",
        },
        {
          title: "Jaga dokumen sensitifmu",
          body: "Pastikan instruksi berasal dari kanal resmi Sundaf Trip sebelum mengirim paspor, data keuangan, atau identitas. Jangan mengikuti permintaan pembayaran atau pengiriman dokumen dari akun yang tidak bisa diverifikasi melalui situs ini.",
        },
      ]}
      faqs={faqs}
      schema={serviceSchema}
    />
  );
}
