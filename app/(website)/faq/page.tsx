export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageCircle, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — Pertanyaan Umum",
  description: "Jawaban atas pertanyaan paling sering tentang paket tour Rusia, Asia Tengah, dan aurora borealis bersama Sundaftrip.",
};

const FAQS = [
  {
    section: "Umum",
    items: [
      {
        q: "Apa yang membedakan Sundaftrip dari agen wisata lain?",
        a: "Kami fokus hanya pada Rusia, Asia Tengah, dan aurora borealis — bukan generalis. Artinya tim kami benar-benar menguasai visa, kondisi lokal, dan pengalaman di destinasi-destinasi ini. Grup kecil (maks 10–12 orang) memastikan pengalaman lebih personal, bukan rombongan bus.",
      },
      {
        q: "Berapa ukuran grup per keberangkatan?",
        a: "Maksimal 10–12 orang per keberangkatan. Kami sengaja membatasi ini agar setiap peserta mendapat perhatian penuh dan perjalanan tidak terasa seperti wisata massal.",
      },
      {
        q: "Apakah ada pemandu perjalanan yang mendampingi?",
        a: "Ya. Setiap keberangkatan didampingi tour leader berpengalaman dari tim kami yang fasih bahasa Indonesia. Di lapangan kami juga berkoordinasi dengan mitra lokal yang memahami kultur setempat.",
      },
      {
        q: "Apakah Sundaftrip terdaftar secara resmi?",
        a: "Ya, kami terdaftar resmi dengan Nomor Induk Berusaha (NIB) yang dapat diverifikasi di OSS (Online Single Submission) pemerintah Indonesia.",
      },
    ],
  },
  {
    section: "Visa & Dokumen",
    items: [
      {
        q: "Apakah Sundaftrip membantu proses visa?",
        a: "Ya, kami membantu pengurusan visa dari awal hingga selesai — mulai dari pengisian formulir, legalisasi dokumen, hingga booking appointment di kedutaan. Biaya visa di luar harga paket dan bervariasi tergantung destinasi.",
      },
      {
        q: "Berapa lama proses visa Rusia?",
        a: "Umumnya 5–15 hari kerja untuk visa turis biasa. Kami menyarankan mengurus minimal 4–6 minggu sebelum keberangkatan untuk memberi waktu jika ada dokumen tambahan yang diminta.",
      },
      {
        q: "Apakah Kazakhstan, Kyrgyzstan, dan Uzbekistan butuh visa untuk WNI?",
        a: "Kondisi ini berubah sewaktu-waktu. Saat ini Kazakhstan bebas visa untuk WNI hingga 30 hari. Kyrgyzstan dan Uzbekistan memiliki e-visa yang prosesnya cukup mudah. Tim kami selalu update informasi terkini dan akan membimbing Anda.",
      },
      {
        q: "Dokumen apa saja yang perlu saya siapkan?",
        a: "Umumnya: paspor yang masih berlaku minimal 6 bulan dari tanggal kepulangan, foto paspor, bukti keuangan (rekening koran 3 bulan), surat keterangan kerja/usaha, dan itinerary perjalanan. Tim kami akan memberikan checklist lengkap sesuai tujuan Anda.",
      },
    ],
  },
  {
    section: "Pembayaran & Deposit",
    items: [
      {
        q: "Berapa deposit yang harus dibayar untuk booking?",
        a: "Deposit awal sebesar 20–30% dari total harga paket untuk mengamankan kursi Anda. Pelunasan dilakukan 30–45 hari sebelum keberangkatan. Detail pembayaran akan dikomunikasikan saat Anda mendaftar.",
      },
      {
        q: "Metode pembayaran apa yang diterima?",
        a: "Transfer bank (semua bank besar Indonesia), dan dompet digital (GoPay, OVO, DANA). Untuk kemudahan, kami juga menerima cicilan melalui kartu kredit tertentu — tanyakan tim kami untuk detailnya.",
      },
      {
        q: "Bagaimana kebijakan refund jika saya membatalkan?",
        a: "Pembatalan lebih dari 60 hari sebelum keberangkatan: refund 80% deposit. Pembatalan 30–60 hari: refund 50% deposit. Pembatalan kurang dari 30 hari: deposit tidak dikembalikan. Kami sangat menyarankan asuransi perjalanan untuk perlindungan maksimal.",
      },
      {
        q: "Apa saja yang sudah termasuk dalam harga paket?",
        a: "Setiap paket berbeda, namun umumnya sudah termasuk: tiket pesawat PP, akomodasi (hotel berbintang sesuai itinerary), transportasi lokal, makan sesuai jadwal, biaya masuk objek wisata, dan pendampingan tour leader. Yang biasanya tidak termasuk: biaya visa, pengeluaran pribadi, dan makan di luar jadwal.",
      },
    ],
  },
  {
    section: "Di Lapangan",
    items: [
      {
        q: "Seberapa dingin cuaca di Rusia dan kawasan aurora?",
        a: "Sangat bergantung musim. Musim dingin (Des–Feb) bisa mencapai -20°C di Moskow dan -30°C di wilayah utara. Musim panas (Jun–Agu) sangat nyaman, 18–25°C. Kami selalu menyertakan panduan pakaian lengkap sebelum keberangkatan.",
      },
      {
        q: "Kapan waktu terbaik melihat aurora borealis?",
        a: "September hingga Maret adalah periode terbaik — langit gelap cukup lama setiap malamnya. Puncak aktivitas geomagnetik sering terjadi di ekuinoks (Sep dan Mar). Namun aurora tetap tidak bisa 100% dijamin karena bergantung kondisi alam.",
      },
      {
        q: "Apakah aman bepergian ke Rusia dan Asia Tengah?",
        a: "Kami selalu memantau perkembangan situasi di lapangan sebelum dan selama perjalanan. Destinasi seperti Kazakhstan, Uzbekistan, Kyrgyzstan, dan Tajikistan secara umum aman untuk wisatawan. Kami juga berkoordinasi dengan KBRI setempat dan memiliki prosedur darurat yang jelas.",
      },
      {
        q: "Bagaimana dengan koneksi internet dan komunikasi di sana?",
        a: "Kami menyarankan membeli SIM lokal setibanya di destinasi — murah dan koneksinya baik di kota besar. Untuk Rusia, beberapa aplikasi barat mungkin dibatasi; VPN bisa membantu. Tim kami akan memberikan panduan teknis sebelum berangkat.",
      },
    ],
  },
];

async function getThemeAndCompany() {
  try {
    const [themeRow, companyRows] = await Promise.all([
      prisma.companyInfo.findFirst({ where: { key: "site_theme" } }),
      prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "company_name"] } } }),
    ]);
    const theme = themeRow?.value ?? "classic";
    const company: Record<string, string> = {};
    companyRows.forEach((r) => { company[r.key] = r.value; });
    return { theme, company };
  } catch {
    return { theme: "classic", company: {} };
  }
}

export default async function FaqPage() {
  const { theme, company } = await getThemeAndCompany();

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas;

  const pfx = isKawaii ? "kw" : isTropical ? "tr" : isPixel ? "px"
    : isGlobe ? "gl" : isMap ? "mp" : isAtlas ? "at" : "";

  const pageBg  = isAtlas ? "var(--at-bg)"     : isTropical ? "var(--tr-bg)"     : isKawaii ? "var(--kw-bg)"     : isPixel ? "var(--px-bg)"     : undefined;
  const headClr = isAtlas ? "var(--at-text)"    : isTropical ? "var(--tr-text)"    : isKawaii ? "var(--kw-text)"    : isPixel ? "var(--px-text)"    : undefined;
  const subClr  = isAtlas ? "var(--at-subtext)" : isTropical ? "var(--tr-subtext)" : isKawaii ? "var(--kw-subtext)" : isPixel ? "var(--px-subtext)" : undefined;
  const cardBg  = isAtlas ? "var(--at-card)"    : isTropical ? "var(--tr-card)"    : isKawaii ? "var(--kw-card)"    : isPixel ? "var(--px-card)"    : undefined;
  const bdrClr  = isAtlas ? "var(--at-border)"  : isTropical ? "var(--tr-border)"  : isKawaii ? "var(--kw-border)"  : isPixel ? "var(--px-border)"  : undefined;

  const pixelGrid = isAtlas ? {
    backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)",
    backgroundSize: "32px 32px",
  } : isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : {};

  const wrapperStyle = pageBg ? { backgroundColor: pageBg, ...pixelGrid } : undefined;

  const whatsapp = company["company_whatsapp"] ?? "";
  const waLink   = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Halo, saya punya pertanyaan tentang paket tour.")}`
    : "/tours";

  return (
    <div
      className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`}
      style={wrapperStyle}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero ── */}
        <div className="mb-12">
          {isOutlined ? (
            <span className={`${pfx}-pill mb-4 inline-flex text-xs uppercase tracking-widest font-black`}
              style={{ color: subClr }}>
              FAQ
            </span>
          ) : (
            <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
              FAQ
            </span>
          )}

          <h1
            className={`text-4xl lg:text-5xl font-black leading-tight mb-5 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Pertanyaan yang Sering Diajukan
          </h1>

          <p
            className={`text-lg leading-relaxed max-w-2xl ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`}
            style={isOutlined ? { color: subClr } : undefined}>
            Tidak menemukan jawaban yang Anda cari? Hubungi tim kami langsung via WhatsApp — kami responsif dan senang membantu.
          </p>
        </div>

        {/* ── FAQ Sections ── */}
        <div className="space-y-10">
          {FAQS.map(({ section, items }) => (
            <div key={section}>
              {/* Section header */}
              {isOutlined ? (
                <div className="mb-4 pb-3 border-b-2 border-dashed" style={{ borderColor: bdrClr }}>
                  <span className={`${pfx}-pill text-xs font-black uppercase tracking-widest`}
                    style={{ background: cardBg, color: headClr, borderColor: bdrClr }}>
                    {section}
                  </span>
                </div>
              ) : (
                <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {section}
                  </span>
                </div>
              )}

              {/* Accordion items */}
              <div className="space-y-3">
                {items.map(({ q, a }) => (
                  <details
                    key={q}
                    className={`group ${isOutlined ? "border-2" : "rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"}`}
                    style={isOutlined ? { background: cardBg, borderColor: bdrClr } : undefined}
                  >
                    <summary
                      className={`flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none font-black text-sm gap-4 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                      style={isOutlined ? { color: headClr } : undefined}
                    >
                      <span>{q}</span>
                      <ChevronDown
                        size={16}
                        className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                        style={isOutlined ? { color: bdrClr } : { color: "#9ca3af" }}
                      />
                    </summary>
                    <div
                      className={`px-5 pb-5 text-sm leading-relaxed border-t ${isOutlined ? "border-dashed" : "border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400"}`}
                      style={isOutlined ? { color: subClr, borderColor: bdrClr } : undefined}
                    >
                      <p className="pt-4">{a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div
          className={`mt-14 p-8 text-center ${isOutlined ? "border-2 border-dashed" : "rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"}`}
          style={isOutlined ? { background: cardBg, borderColor: bdrClr } : undefined}
        >
          <h2
            className={`text-xl font-black mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Masih ada pertanyaan?
          </h2>
          <p className="text-sm mb-5" style={isOutlined ? { color: subClr } : { color: "#6b7280" }}>
            Tim kami siap membantu Anda merencanakan perjalanan impian — gratis, tanpa komitmen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm transition ${
                isOutlined ? `${pfx}-btn` : "bg-green-500 hover:bg-green-600 text-white rounded-xl"
              }`}
              style={isOutlined ? { background: "var(--site-accent)", color: "#fff" } : undefined}>
              <MessageCircle size={16} /> Chat WhatsApp
            </a>
            <Link
              href="/tours"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm transition ${
                isOutlined ? `${pfx}-pill` : "border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              style={isOutlined ? { background: cardBg, color: headClr, borderColor: bdrClr } : undefined}>
              Lihat Paket Tour
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
