import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Clock, MessageCircle, Star, ChevronRight, Plane, Thermometer, Camera, Wallet, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wisata Murmansk & Aurora Borealis dari Indonesia — Sundaftrip",
  description:
    "Panduan lengkap wisata Murmansk, Rusia untuk traveler Indonesia: cara ke sana, visa, waktu terbaik lihat aurora borealis, estimasi budget dalam rupiah, dan paket tur tersedia.",
  keywords: [
    "wisata murmansk", "aurora borealis murmansk", "northern lights rusia",
    "paket tour murmansk indonesia", "wisata rusia dari jakarta",
    "aurora borealis indonesia", "tur rusia murmansk", "sundaftrip rusia",
  ],
  openGraph: {
    title: "Wisata Murmansk & Aurora Borealis — Sundaftrip",
    description: "Panduan lengkap wisata Murmansk Rusia untuk traveler Indonesia. Visa, flight, aurora, budget IDR.",
    type: "article",
    images: [{ url: "https://picsum.photos/seed/murmansk-aurora/1200/630", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://sundaftrip.com/destinations/murmansk" },
};

async function getData() {
  const [companyRows, tours, relatedPosts] = await Promise.all([
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "site_theme"] } } }),
    prisma.tour.findMany({
      where: {
        status: { in: ["ACTIVE", "FULL"] },
        OR: [
          { country: { contains: "rusia", mode: "insensitive" } },
          { country: { contains: "russia", mode: "insensitive" } },
          { title: { contains: "rusia", mode: "insensitive" } },
          { title: { contains: "murmansk", mode: "insensitive" } },
        ],
      },
      orderBy: { tripDate: "asc" },
      take: 3,
    }),
    prisma.blog.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: "rusia", mode: "insensitive" } },
          { title: { contains: "russia", mode: "insensitive" } },
          { title: { contains: "murmansk", mode: "insensitive" } },
          { title: { contains: "aurora", mode: "insensitive" } },
          { category: { contains: "eropa", mode: "insensitive" } },
        ],
      },
      orderBy: { date: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, cover: true, readTime: true, date: true },
    }),
  ]);
  const company: Record<string, string> = {};
  companyRows.forEach((r) => { company[r.key] = r.value; });
  return {
    wa: company["company_whatsapp"] ?? "",
    theme: company["site_theme"] ?? "classic",
    tours,
    relatedPosts,
  };
}

const QUICK_FACTS = [
  { icon: Plane,       label: "Flight dari Jakarta",  value: "±18–22 jam (transit)" },
  { icon: Calendar,    label: "Waktu terbaik",         value: "Oktober – Maret" },
  { icon: Thermometer, label: "Suhu musim dingin",     value: "-10°C s/d -25°C" },
  { icon: Wallet,      label: "Estimasi budget",       value: "Rp 25–45 juta/orang" },
];

const ACTIVITIES = [
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.25.04_bghn1q.jpg", title: "Berburu Aurora Borealis", desc: "Langit di atas Laut Barents jadi salah satu spot terbaik di dunia buat lihat aurora. Bulan terbaik: Desember–Februari saat langit paling gelap." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586062/WhatsApp_Image_2026-05-12_at_18.23.40_ht8etl.jpg", title: "Makan Kepiting Alaska di Murmansk", desc: "Kepiting Raja Murmansk ukurannya luar biasa, rasanya lebih luar biasa lagi. Ini bukan kepiting biasa, ini pengalaman makan yang tak terlupakan seumur hidup." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.25.27_jbbrt6.jpg", title: "Husky Sledding", desc: "Berkeliling tundra bersalju ditarik anjing husky. Suara lonceng slede, napas anjing, dan langit biru arktik yang menenangkan jiwa." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.27.58_xusryb.jpg", title: "Berburu Paus di Teriberka", desc: "Susuri Laut Barents menuju Teriberka, desa nelayan terpencil yang jadi spot terbaik melihat paus bungkuk di habitat aslinya." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586767/WhatsApp_Image_2026-05-12_at_18.48.44_c45msv.jpg", title: "Snowmobile Safari", desc: "Ngebut di atas salju dengan snowmobile sampai ke titik terpencil di hutan Arktik." },
  { img: "https://res.cloudinary.com/dlmgl1grq/image/upload/q_auto/f_auto/v1778586061/WhatsApp_Image_2026-05-12_at_18.34.36_zfojhy.jpg", title: "Naik Rusa di Tundra", desc: "Duduk di slede kayu ditarik rusa kutub menembus hutan pinus bersalju. Rasanya seperti masuk ke dalam dongeng Natal, tapi ini nyata." },
];

const FAQ = [
  { q: "Apakah Indonesia bisa masuk Rusia tanpa visa?", a: "Belum. Indonesia perlu apply visa turis Rusia. Prosesnya bisa lewat kedutaan Rusia di Jakarta atau agen perjalanan. Perkirakan 2–3 minggu sebelum keberangkatan." },
  { q: "Berapa lama penerbangan dari Jakarta ke Murmansk?", a: "Tidak ada penerbangan langsung. Rutenya Jakarta → Dubai/Doha → Moskow → Murmansk. Total sekitar 18–22 jam. Dari Moskow ke Murmansk bisa naik pesawat (~2 jam) atau kereta malam (~30 jam)." },
  { q: "Kapan waktu terbaik lihat aurora di Murmansk?", a: "Oktober sampai Maret. Puncaknya Desember–Februari karena langit paling gelap. Minimal 5–7 malam biar peluangnya bagus." },
  { q: "Berapa budget yang dibutuhkan?", a: "Estimasi 7–10 hari: tiket PP Rp 12–18 juta, hotel Rp 4–8 juta, aktivitas Rp 5–10 juta, makan & transport Rp 3–5 juta. Total sekitar Rp 25–45 juta/orang." },
  { q: "Apa yang harus dibawa ke Murmansk?", a: "Jaket thermal berlapis, base layer wool, sepatu boots waterproof, sarung tangan tebal, topi penutup telinga, dan hand warmer sebanyak-banyaknya. -25°C itu bukan bercanda." },
  { q: "Apakah makanan halal tersedia di Murmansk?", a: "Murmansk kota kecil, pilihan halal terbatas. Bawa mie instan dan snack halal dari Indonesia. Seafood (ikan, salmon) biasanya aman." },
];

export default async function MurmanskPage() {
  const { wa, theme, tours, relatedPosts } = await getData();

  /* ── theme helpers (same pattern as tours/page.tsx) ── */
  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap;

  const pageBg  = isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : undefined;
  const headClr = isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : undefined;
  const subClr  = isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : undefined;
  const cardBg  = isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : undefined;
  const bdrClr  = isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : undefined;

  const pageGrid = isPixel ? { backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" }
    : isMap ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }
    : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pageGrid } : {};

  /* Accent-based helpers */
  const accentStyle = isKawaii   ? { background: "var(--kw-border)", color: "#fff" }
                    : isTropical ? { background: "var(--site-accent)", color: "#fff" }
                    : isPixel    ? { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
                    : isGlobe    ? { background: "var(--gl-border)", color: "#fff" }
                    : isMap      ? { background: "var(--mp-accent)", color: "var(--mp-on-accent)" }
                    : { background: "var(--site-accent,#2d6a4f)", color: "#fff" };

  const eyebrowStyle = isKawaii   ? { background: "var(--kw-peach)", color: "var(--kw-text)" }
                     : isTropical ? { background: "var(--tr-mint)", color: "var(--tr-text)" }
                     : isPixel    ? { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
                     : isGlobe    ? { background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }
                     : isMap      ? { background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }
                     : { background: "var(--site-accent,#2d6a4f)", color: "#fff", opacity: 0.9 };

  const pillClass = isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isPixel ? "px-pill" : isGlobe ? "gl-pill" : isMap ? "mp-pill" : "rounded-full px-3 py-1 text-xs font-medium";

  const cardClass = isKawaii ? "kw-card" : isTropical ? "tr-card" : isPixel ? "px-card" : isGlobe ? "gl-card" : isMap ? "mp-card"
    : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800";

  const waMsg = encodeURIComponent("Halo Sundaftrip! Saya tertarik dengan paket wisata Murmansk / Aurora Borealis. Bisa tolong info lebih lanjut?");
  const waUrl = wa ? `https://wa.me/${wa}?text=${waMsg}` : "#";

  return (
    <div className={`min-h-screen ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`} style={wrapperStyle}>

      {/* ── HERO ── */}
      <div className="relative h-[72vh] min-h-[520px] flex items-end">
        {/* Foto HD aurora Pexels — tampil di semua theme */}
        <Image
          src="https://images.pexels.com/photos/30173400/pexels-photo-30173400.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Aurora Borealis di Murmansk, Rusia"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Cinematic overlay — bawah gelap agar teks terbaca */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.52) 42%, rgba(0,0,0,0.15) 100%)",
        }} />
        {/* Side vignette */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.30) 0%, transparent 50%)",
        }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-14">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 mb-5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.14)", color: "#fff", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.28)" }}>
            <MapPin size={11} />
            Rusia · Arktik
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-5 tracking-tight"
            style={{ fontFamily: isPixel ? "monospace" : undefined }}>
            <span className="text-white drop-shadow-lg">
              {isPixel ? "MURMANSK &" : "Murmansk &"}
            </span>
            <br />
            {isPixel
              ? <span className="text-white drop-shadow-lg">AURORA BOREALIS</span>
              : <span className="aurora-text aurora-glow">Aurora Borealis</span>
            }
          </h1>

          <p className="text-base sm:text-lg max-w-xl mb-8 text-white/80 leading-relaxed"
            style={{ fontFamily: isPixel ? "monospace" : undefined }}>
            {isPixel
              ? "> Kota di atas Lingkar Arktik. Langit meledak dengan cahaya hijau magis yang sungguh memukau."
              : "Kota di atas Lingkar Arktik. Tempat matahari tak terbit selama berminggu-minggu, dan langitnya meledak dengan cahaya hijau magis yang sungguh memukau."}
          </p>

          {/* CTA — paket tour dulu, WA sebagai sekunder */}
          <div className="flex flex-wrap gap-3">
            {tours.length > 0 ? (
              <a href="#paket-tour"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl hover:scale-105"
                style={{ background: "var(--site-accent,#2d6a4f)", color: "#fff" }}>
                <Star size={15} />
                Lihat Paket Murmansk
              </a>
            ) : (
              <Link href="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl hover:scale-105"
                style={{ background: "var(--site-accent,#2d6a4f)", color: "#fff" }}>
                <Star size={15} />
                Lihat Semua Paket Tour
              </Link>
            )}
            {wa && (
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition border-2 text-white hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.38)", backdropFilter: "blur(8px)" }}>
                <MessageCircle size={15} />
                Tanya via WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── QUICK FACTS ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_FACTS.map(({ icon: Icon, label, value }) => (
            <div key={label} className={`${cardClass} p-4`} style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
              <div className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
                <div>
                  <p className={`text-[11px] font-medium mb-0.5 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{label}</p>
                  <p className={`text-sm font-bold leading-tight ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-20 pb-24">

        {/* ── KENAPA MURMANSK ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► TENTANG DESTINASI" : "Tentang Destinasi"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Kenapa Murmansk, Bukan Finlandia atau Norwegia?
          </h2>
          <div className={`space-y-4 text-sm sm:text-base leading-relaxed ${!isOutlined ? "text-gray-700 dark:text-gray-100" : ""}`} style={{ color: isOutlined ? headClr : undefined }}>
            <p>Kalau ingin melihat aurora, Finlandia dan Norwegia memang lebih populer. Lebih banyak travel agency, lebih mudah diakses. Tapi justru itu yang menjadi masalahnya. Anda akan bersaing dengan ratusan turis lain yang sama-sama mengangkat kamera untuk memotret langit yang sama.</p>
            <p>Murmansk menawarkan sesuatu yang berbeda: <strong>keaslian</strong>. Ini kota industri Arktik yang nyata, bukan desa wisata yang dirancang untuk turis. Penduduknya bersahaja tapi hangat, landscape-nya keras tapi cantik, dan auranya sama spektakularnya namun bisa dinikmati tanpa berdesakan.</p>
            <p>Murmansk adalah kota terbesar di dunia yang berada di dalam Lingkar Arktik. Infrastrukturnya jauh lebih lengkap dari yang dibayangkan. Ada hotel yang layak, restoran yang baik, dan transportasi yang tetap berfungsi meski di tengah badai salju -25°C.</p>
          </div>
        </section>

        {/* ── AURORA GUIDE ── */}
        <section className={`${isOutlined ? "" : "rounded-3xl"} p-8 lg:p-12`}
          style={isOutlined
            ? { background: cardBg, border: `2px solid ${bdrClr}`, boxShadow: isPixel || isMap || isKawaii || isTropical ? `4px 4px 0 0 ${bdrClr}` : isGlobe ? "0 8px 32px var(--gl-shadow)" : undefined }
            : { background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 22%, #0c0c0c)" }}>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={isOutlined ? eyebrowStyle : { background: "rgba(255,255,255,0.15)", color: "#fff" }}>
            {isPixel ? "► PANDUAN AURORA" : "Panduan Aurora"}
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-white" : ""}`}
            style={{ color: isOutlined ? headClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}>
            Aurora Borealis: Yang Perlu Kita Tahu
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Waktu Terbaik", content: "Oktober–Maret adalah musim aurora. Puncaknya Desember–Februari saat Polar Night, ketika matahari tidak terbit sama sekali. Langit semakin gelap berarti aurora semakin terlihat jelas." },
              { title: "Kapan Muncul?", content: "Biasanya pukul 21.00–02.00 waktu lokal. Gunakan aplikasi SpaceWeatherLive atau My Aurora Forecast buat pantau aktivitas badai matahari." },
              { title: "Tips Foto Aurora", content: "Pakai tripod, ISO 800–3200, aperture f/2.8, shutter 5–15 detik. Tangan gemetar karena dingin? Gunakan remote shutter atau timer." },
              { title: "Hindari Polusi Cahaya", content: "Keluar dari pusat kota. Spot terbaik: Kola Peninsula, tepian Danau Seydozero, atau ikut aurora hunting tour ke titik gelap terbaik." },
              { title: "Durasi yang Realistis", content: "Minimal 5 malam di Murmansk agar peluang lihat aurora bagus. Idealnya 7–10 malam. Jangan datang 2 malam dan berharap pasti kena." },
              { title: "Persiapan Fisik", content: "Menunggu aurora bisa 1–3 jam di luar dengan suhu -20°C. Bawa hand warmer, pakai berlapis, dan jangan lupa minum teh panas dari termos." },
            ].map(({ title, content }) => (
              <div key={title} className="flex gap-3">
                <div className="w-1 rounded-full shrink-0 mt-1" style={{ background: "var(--site-accent,#2d6a4f)" }} />
                <div>
                  <p className={`font-bold mb-1 ${!isOutlined ? "text-white" : ""}`} style={{ color: isOutlined ? headClr : undefined }}>{title}</p>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-white/70" : ""}`} style={{ color: isOutlined ? subClr : undefined }}>{content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ACTIVITIES ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► AKTIVITAS" : "Aktivitas"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Apa yang Bisa Kita Lakukan di Murmansk
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACTIVITIES.map(({ img, title, desc }) => (
              <div key={title} className={`${cardClass} overflow-hidden`} style={cardBg ? { background: cardBg, borderColor: bdrClr, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `3px 3px 0 0 ${bdrClr}` : undefined } : {}}>
                <div className="relative h-40 w-full overflow-hidden">
                  <Image src={img} alt={title} fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                </div>
                <div className="p-5">
                  <h3 className={`font-bold mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-200" : ""}`} style={{ color: subClr }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CARA KE SANA ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► PERJALANAN DARI INDONESIA" : "Perjalanan dari Indonesia"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Cara ke Murmansk dari Jakarta
          </h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Jakarta → Moskow", desc: "Via Dubai (Emirates), Doha (Qatar Airways), atau Abu Dhabi (Etihad). Durasi total ±12–15 jam. Harga tiket PP Rp 10–18 juta tergantung maskapai dan musim." },
              { step: "02", title: "Moskow ke Murmansk", desc: "Opsi pertama: pesawat Aeroflot atau Pobeda, sekitar 2 jam, Rp 400–800 ribu. Opsi kedua: kereta malam Arktika, 30 jam. Tidur sambil melewati hutan birch Rusia yang perlahan berubah menjadi tundra. Pengalaman yang jauh lebih berkesan." },
              { step: "03", title: "Di Murmansk", desc: "Kota kompak, bisa dijelajahi dengan taksi atau angkutan lokal. Sewa mobil + sopir sangat direkomendasikan untuk aurora hunting ke luar kota. Google Translate offline wajib download." },
            ].map(({ step, title, desc }, i, arr) => (
              <div key={step} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-xs"
                  style={accentStyle}>
                  {step}
                </div>
                <div className={`flex-1 pb-4 ${i < arr.length - 1 ? "border-b" : ""} ${!isOutlined ? "border-gray-100 dark:border-slate-800" : ""}`}
                  style={{ borderColor: i < arr.length - 1 ? bdrClr : undefined }}>
                  <h3 className={`font-bold mb-1 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUDGET ── */}
        <section className={`${isOutlined ? "" : "bg-gray-50 dark:bg-slate-900 rounded-3xl"} p-8`}
          style={isOutlined ? { background: cardBg, border: `2px solid ${bdrClr}`, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `4px 4px 0 0 ${bdrClr}` : undefined } : {}}>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► ESTIMASI BUDGET" : "Estimasi Budget"}
          </span>
          <h2 className={`text-2xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Berapa yang Perlu Kita Siapkan?
          </h2>
          <div className="space-y-0">
            {[
              { item: "Tiket pesawat PP (Jakarta–Moskow–Murmansk)", range: "Rp 12.000.000 – 20.000.000" },
              { item: "Akomodasi 7 malam (hotel bintang 3)", range: "Rp 4.000.000 – 8.000.000" },
              { item: "Aurora hunting & activities", range: "Rp 5.000.000 – 12.000.000" },
              { item: "Makan & transport lokal", range: "Rp 3.000.000 – 5.000.000" },
              { item: "Visa turis Rusia", range: "Rp 700.000 – 1.500.000" },
              { item: "Asuransi perjalanan", range: "Rp 500.000 – 1.000.000" },
            ].map(({ item, range }) => (
              <div key={item} className={`flex items-center justify-between gap-4 py-3 border-b ${!isOutlined ? "border-gray-200 dark:border-slate-800" : ""}`}
                style={{ borderColor: bdrClr }}>
                <span className={`text-sm ${!isOutlined ? "text-gray-700 dark:text-gray-300" : ""}`} style={{ color: subClr }}>{item}</span>
                <span className={`text-sm font-bold whitespace-nowrap ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>{range}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 pt-4">
              <span className={`font-black ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>Total Estimasi</span>
              <span className="font-black text-lg" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>Rp 25 – 47 juta / orang</span>
            </div>
          </div>
          <p className={`text-xs mt-4 ${!isOutlined ? "text-gray-400 dark:text-gray-600" : ""}`} style={{ color: subClr, opacity: 0.7 }}>
            * Estimasi kasar 7–10 hari. Dengan paket tur Sundaftrip, biasanya lebih hemat karena sudah bundled.
          </p>
        </section>

        {/* ── PAKET TOUR dari DB ── */}
        <section id="paket-tour">
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► PAKET TERSEDIA" : "Paket Tersedia"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Paket Tour Rusia dari Sundaftrip
          </h2>

          {tours.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tours.map((tour) => (
                  <Link key={tour.id} href={`/tours/${tour.id}`}
                    className={`group block overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isOutlined ? cardClass : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-300"}`}
                    style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
                    <div className="relative h-44 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      {tour.heroImg
                        ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="flex items-center justify-center h-full"><MapPin size={28} className="text-gray-300" /></div>}
                      {tour.badge && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-semibold" style={accentStyle}>{tour.badge}</span>}
                    </div>
                    <div className="p-4">
                      <p className={`text-xs mb-1 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{tour.country} · {tour.duration}</p>
                      <h3 className={`font-bold text-sm leading-tight mb-3 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{tour.title}</h3>
                      <p className="font-black" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                        {tour.promoPrice ? formatCurrency(tour.promoPrice) : formatCurrency(tour.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/tours" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                  Lihat semua paket tour <ChevronRight size={16} />
                </Link>
              </div>
            </>
          ) : (
            /* Fallback: belum ada paket aktif → arahkan ke halaman tour */
            <div className={`${isOutlined ? cardClass : "bg-gray-50 dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700"} p-8 text-center`}
              style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
              <div className="text-4xl mb-3">🏔️</div>
              <h3 className={`font-bold mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>
                Paket Murmansk Segera Hadir
              </h3>
              <p className={`text-sm mb-5 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>
                Tim kami sedang mempersiapkan keberangkatan Murmansk berikutnya. Sementara itu, jelajahi paket destinasi lain.
              </p>
              <Link href="/tours"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition hover:opacity-90"
                style={{ background: "var(--site-accent,#2d6a4f)", color: "#fff" }}>
                Jelajahi Semua Paket Tour <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* ── FAQ ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            FAQ
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Pertanyaan yang Sering Ditanya
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className={`${isOutlined ? cardClass : "border border-gray-200 dark:border-slate-800 rounded-2xl"} p-6`}
                style={cardBg ? { background: cardBg, borderColor: bdrClr, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `3px 3px 0 0 ${bdrClr}` : undefined } : {}}>
                <h3 className={`font-bold mb-3 flex items-start gap-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
                  <Star size={14} className="mt-0.5 shrink-0" style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
                  {q}
                </h3>
                <p className={`text-sm leading-relaxed pl-5 ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`} style={{ color: subClr }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARTIKEL TERKAIT ── */}
        {relatedPosts.length > 0 && (
          <section>
            <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
              {isPixel ? "► BACA JUGA" : "Baca Juga"}
            </span>
            <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
              style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
              Artikel Seputar Rusia & Eropa
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className={`group block overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isOutlined ? cardClass : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-300"}`}
                  style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
                  <div className="relative h-36 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {post.cover
                      ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="flex items-center justify-center h-full"><Camera size={24} className="text-gray-300" /></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-[11px] mb-2" style={{ color: subClr ?? "var(--color-gray-400)" }}>
                      <Clock size={10} /> {post.readTime}
                    </div>
                    <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        {wa && (
          <section className={`${isOutlined ? "" : "rounded-3xl"} p-10 text-center`}
            style={isOutlined
              ? { background: cardBg, border: `2px solid ${bdrClr}`, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `6px 6px 0 0 ${bdrClr}` : undefined }
              : { background: "var(--site-accent,#2d6a4f)" }}>
            <h2 className={`text-3xl font-black mb-3 ${!isOutlined ? "text-white" : ""}`}
              style={{ color: isOutlined ? headClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}>
              {isPixel ? "> SIAP BERBURU AURORA?" : isKawaii ? "Siap Berburu Aurora? ✨" : "Siap Berburu Aurora?"}
            </h2>
            <p className={`mb-8 max-w-lg mx-auto text-sm sm:text-base ${!isOutlined ? "text-white/80" : ""}`} style={{ color: subClr }}>
              Tim Sundaftrip siap bantu Anda merencanakan perjalanan ke Murmansk dari awal sampai akhir: visa, tiket, hotel, dan aurora hunting guide lokal.
            </p>
            <a href={waUrl} target="_blank" rel="noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-4 font-black text-sm transition ${isOutlined ? pillClass : "rounded-full bg-white hover:bg-gray-50"}`}
              style={isOutlined ? accentStyle : { color: "var(--site-accent-ink,#2d6a4f)" }}>
              <MessageCircle size={18} />
              {isPixel ? "[ CHAT WHATSAPP SEKARANG ]" : "Chat WhatsApp Sekarang"}
            </a>
          </section>
        )}

      </div>
    </div>
  );
}
