import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Clock, MessageCircle, ChevronRight, Plane, Thermometer, Camera, Wallet, Calendar } from "lucide-react";
import { formatCurrency, toWaNumber, cldOptimize } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wisata Kazakhstan dari Indonesia, Almaty, Astana & Alam Liar, Sundaftrip",
  description:
    "Panduan lengkap wisata Kazakhstan untuk traveler Indonesia: visa, penerbangan dari Jakarta, Almaty, Astana, Danau Kaindy, Charyn Canyon, estimasi budget rupiah, dan paket tur tersedia.",
  keywords: [
    "wisata kazakhstan", "paket tour kazakhstan indonesia", "almaty wisata",
    "astana nur sultan wisata", "danau kaindy", "charyn canyon", "visa kazakhstan indonesia",
    "tour asia tengah", "sundaftrip kazakhstan",
  ],
  openGraph: {
    title: "Wisata Kazakhstan, Almaty, Astana & Alam Liar, Sundaftrip",
    description: "Panduan wisata Kazakhstan untuk traveler Indonesia. Visa gratis 30 hari, alam epik, dan kota modern.",
    type: "article",
    images: [{ url: "https://picsum.photos/seed/kazakhstan-almaty/1200/630", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://sundaftrip.com/destinations/kazakhstan" },
};

async function getData() {
  const [companyRows, tours, relatedPosts] = await Promise.all([
    prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp", "site_theme"] } } }),
    prisma.tour.findMany({
      where: {
        status: { in: ["ACTIVE", "FULL"] },
        OR: [
          { country: { contains: "kazakhstan", mode: "insensitive" } },
          { country: { contains: "kazakh", mode: "insensitive" } },
          { title:   { contains: "kazakhstan", mode: "insensitive" } },
          { title:   { contains: "almaty",     mode: "insensitive" } },
          { title:   { contains: "astana",     mode: "insensitive" } },
          { title:   { contains: "asia tengah", mode: "insensitive" } },
        ],
      },
      orderBy: { tripDate: "asc" },
      take: 3,
    }),
    prisma.blog.findMany({
      where: {
        published: true,
        OR: [
          { title:    { contains: "kazakhstan", mode: "insensitive" } },
          { title:    { contains: "almaty",     mode: "insensitive" } },
          { title:    { contains: "asia tengah", mode: "insensitive" } },
          { category: { contains: "asia tengah", mode: "insensitive" } },
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
    wa: toWaNumber(company["company_whatsapp"]),
    theme: company["site_theme"] ?? "classic",
    tours,
    relatedPosts,
  };
}

const QUICK_FACTS = [
  { icon: Plane,       label: "Flight dari Jakarta",  value: "±10–14 jam (transit)" },
  { icon: Calendar,    label: "Waktu terbaik",         value: "Mei–Sep & Des–Feb" },
  { icon: Thermometer, label: "Suhu (musim dingin)",   value: "-15°C s/d -5°C" },
  { icon: Wallet,      label: "Estimasi budget",       value: "Rp 20–38 juta/orang" },
];

const ACTIVITIES = [
  {
    img: "https://images.pexels.com/photos/33731541/pexels-photo-33731541.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Danau Kaindy: Hutan Tenggelam",
    desc: "Danau glasial di ketinggian 2.000 mdpl dengan batang pohon cemara yang mencuat dari air biru kehijauan. Salah satu pemandangan paling surreal di Asia.",
  },
  {
    img: "https://images.pexels.com/photos/26311716/pexels-photo-26311716.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Charyn Canyon: Grand Canyon Versi Asia",
    desc: "Ngarai merah sepanjang 154 km yang terbentuk jutaan tahun lalu. Berjalan di dasarnya terasa seperti berada di planet lain. Dinding batu setinggi 150–300 meter mengapitnya dari dua sisi.",
  },
  {
    img: "https://images.pexels.com/photos/28856115/pexels-photo-28856115.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Almaty: Kota di Kaki Pegunungan",
    desc: "Kota kosmopolitan dengan latar belakang Tian Shan yang bersalju. Naiki gondola Shymbulak ke ketinggian 3.200 mdpl untuk menikmati panorama kota dari atas.",
  },
  {
    img: "https://images.pexels.com/photos/30083127/pexels-photo-30083127.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Astana: Kota Futuristik di Stepa",
    desc: "Ibu kota baru Kazakhstan yang dibangun dari nol di tengah padang stepa. Bayterek Tower, Khan Shatyr, dan Nur-Astana Mosque adalah ikon arsitektur yang wajib dikunjungi.",
  },
  {
    img: "https://images.pexels.com/photos/16327878/pexels-photo-16327878.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Kolsai Lakes: Surga Tiga Danau",
    desc: "Tiga danau bersusun di pegunungan Tian Shan yang bisa didaki dalam satu hari. Air birunya jernih sampai ke dasar, dikelilingi hutan pinus dan padang rumput alpine.",
  },
  {
    img: "https://images.pexels.com/photos/4321583/pexels-photo-4321583.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Beshbarmak & Kumiss: Kuliner Nomaden",
    desc: "Coba Beshbarmak (daging rebus, pasta, dan bawang) serta Shubat (susu unta fermentasi). Pengalaman makan di dalam yurt tradisional di tengah stepa adalah cerita tersendiri.",
  },
];

const FAQ = [
  {
    q: "Apakah WNI butuh visa ke Kazakhstan?",
    a: "Tidak! Kazakhstan memberikan bebas visa 30 hari untuk WNI sejak 2023. Cukup paspor yang masih berlaku minimal 6 bulan. Ini salah satu alasan Kazakhstan jadi destinasi Asia Tengah paling mudah diakses dari Indonesia.",
  },
  {
    q: "Berapa lama penerbangan dari Jakarta ke Almaty?",
    a: "Tidak ada penerbangan langsung. Rute paling umum: Jakarta → Kuala Lumpur (AirAsia) lalu lanjut Air Astana KUL→ALA, total ±10–12 jam. Alternatif via Dubai (Emirates) atau Istanbul (Turkish Airlines) ±13–16 jam.",
  },
  {
    q: "Kapan waktu terbaik ke Kazakhstan?",
    a: "Dua musim terbaik: (1) Mei–September untuk menjelajah alam. Danau, ngarai, dan pegunungan semuanya terbuka, suhu 15–30°C. (2) Desember–Februari untuk winter wonderland dan ski di Shymbulak. Hindari Oktober–November yang kelabu dan berlumpur.",
  },
  {
    q: "Bahasa apa yang dipakai di Kazakhstan?",
    a: "Kazakhstan dan Rusia. Di Almaty dan Astana, bahasa Rusia lebih dominan. Google Translate offline sangat membantu. Di hotel dan restoran wisata biasanya ada yang bisa bahasa Inggris.",
  },
  {
    q: "Apakah makanan halal mudah ditemukan?",
    a: "Kazakhstan mayoritas Muslim, sehingga makanan halal sangat mudah ditemukan. Daging domba dan sapi mendominasi kuliner lokal. Ada juga banyak restoran Asia dan Rusia yang aman untuk muslim.",
  },
  {
    q: "Berapa budget yang dibutuhkan untuk 7–10 hari?",
    a: "Estimasi: tiket PP Rp 8–15 juta, hotel 7 malam Rp 3–6 juta, tour & aktivitas Rp 4–8 juta, makan & transport lokal Rp 2–4 juta. Total sekitar Rp 20–38 juta/orang. Kazakhstan relatif lebih terjangkau dibanding Eropa.",
  },
];

export default async function KazakhstanPage() {
  const { wa, theme, tours, relatedPosts } = await getData();

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isFumayo   = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isFumayo;

  const pageBg  = isFumayo ? "var(--fb-bg)" : isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : isAtlas ? "var(--at-bg)" : undefined;
  const headClr = isFumayo ? "var(--fb-text)" : isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : isAtlas ? "var(--at-text)" : undefined;
  const subClr  = isFumayo ? "var(--fb-subtext)" : isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : isAtlas ? "var(--at-subtext)" : undefined;
  const cardBg  = isFumayo ? "var(--fb-card)" : isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : isAtlas ? "var(--at-card)" : undefined;
  const bdrClr  = isFumayo ? "var(--fb-border)" : isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : isAtlas ? "var(--at-border)" : undefined;

  const pageGrid = isPixel ? { backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" }
    : isMap   ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }
    : isAtlas ? { backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)", backgroundSize: "32px 32px" }
    : isFumayo ? { backgroundImage: "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)", backgroundSize: "26px 26px", fontFamily: "var(--fb-font)" }
    : {};

  const wrapperStyle = pageBg ? { backgroundColor: pageBg, ...pageGrid } : {};

  const accentStyle = isKawaii   ? { background: "var(--kw-border)", color: "#111827" }
                    : isTropical ? { background: "var(--site-accent)", color: "#111827" }
                    : isPixel    ? { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
                    : isGlobe    ? { background: "var(--gl-border)", color: "#111827" }
                    : isMap      ? { background: "var(--mp-accent)", color: "var(--mp-on-accent)" }
                    : isAtlas    ? { background: "var(--site-accent,#2d6a4f)", color: "#111827" }
                    : { background: "var(--site-accent,#2d6a4f)", color: "#111827" };

  const eyebrowStyle = isKawaii   ? { background: "var(--kw-peach)", color: "var(--kw-text)" }
                     : isTropical ? { background: "var(--tr-mint)", color: "var(--tr-text)" }
                     : isPixel    ? { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
                     : isGlobe    ? { background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }
                     : isMap      ? { background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }
                     : isAtlas    ? { background: "transparent", color: "var(--at-subtext)", borderColor: "var(--at-border)" }
                     : { background: "var(--site-accent,#2d6a4f)", color: "#111827", opacity: 0.95 };

  const pillClass = isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isPixel ? "px-pill" : isGlobe ? "gl-pill" : isMap ? "mp-pill" : isAtlas ? "at-pill" : "rounded-full px-3 py-1 text-xs font-medium";
  const cardClass = isKawaii ? "kw-card" : isTropical ? "tr-card" : isPixel ? "px-card" : isGlobe ? "gl-card" : isMap ? "mp-card" : isAtlas ? "at-card"
    : "bg-white rounded-2xl border border-gray-200";

  const waMsg = encodeURIComponent("Halo Sundaftrip! Saya tertarik dengan paket wisata Kazakhstan. Bisa info lebih lanjut?");
  const waUrl = wa ? `https://wa.me/${wa}?text=${waMsg}` : "#";

  return (
    <div className={`destination-light-surface min-h-screen ${!isOutlined ? "bg-white" : ""}`} style={wrapperStyle}>

      {/* ── HERO ── */}
      <div className="relative h-[65vh] min-h-[440px] flex items-end pt-24">
        {isOutlined ? (
          <div className="absolute inset-0" style={{ backgroundColor: pageBg }} />
        ) : (
          <>
            {/* Kazakhstan: padang stepa + langit biru luas */}
            <div className="absolute inset-0" style={{ background: "#0a1628" }} />
            <div className="absolute inset-0 opacity-35" style={{
              background: "radial-gradient(ellipse at 15% 60%, #1a6b3c 0%, transparent 50%), radial-gradient(ellipse at 85% 25%, #c8860a 0%, transparent 45%), radial-gradient(ellipse at 50% 80%, #0d4a8a 0%, transparent 50%)",
            }} />
          </>
        )}

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <span className={`${pillClass} inline-flex items-center gap-1.5 mb-4 text-xs font-bold`} style={eyebrowStyle}>
            <MapPin size={11} />
            {isPixel ? "ASIA TENGAH" : "Asia Tengah"}
          </span>

          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 ${!isOutlined ? "text-white" : ""}`}
            style={{ color: isOutlined ? headClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}
          >
            {isPixel
              ? "KAZAKHSTAN,\nNEGERI NOMADEN"
              : <>Kazakhstan,<br />
                <span style={{ color: isOutlined ? (headClr ?? "var(--site-accent)") : "var(--site-accent,#c8860a)" }}>
                  Negeri Nomaden
                </span>
              </>
            }
          </h1>

          <p
            className={`text-base sm:text-lg max-w-xl mb-8 ${!isOutlined ? "text-white/75" : ""}`}
            style={{ color: isOutlined ? subClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}
          >
            {isPixel
              ? "> Stepa tanpa batas, ngarai merah memukau, danau biru di kaki Tian Shan. Bebas visa 30 hari untuk WNI."
              : "Stepa tanpa batas, ngarai merah yang memukau, dan danau biru di kaki pegunungan Tian Shan. Bebas visa 30 hari untuk WNI. Tidak ada alasan untuk tidak ke sini."}
          </p>

          {/* Highlight bebas visa */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className={`${pillClass} inline-flex items-center gap-1.5`} style={accentStyle}>
              ✓ Bebas Visa 30 Hari untuk WNI
            </span>
          </div>

          {wa && (
            <a href={waUrl} target="_blank" rel="noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-sm transition shadow-lg ${isOutlined ? pillClass : "rounded-full"}`}
              style={accentStyle}>
              <MessageCircle size={16} />
              {isPixel ? "[ TANYA PAKET ]" : "Tanya Paket Sekarang"}
            </a>
          )}
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

        {/* ── KENAPA KAZAKHSTAN ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► TENTANG DESTINASI" : "Tentang Destinasi"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Kenapa Kazakhstan Layak Masuk Bucket List Kita?
          </h2>
          <div className={`space-y-4 text-sm sm:text-base leading-relaxed ${!isOutlined ? "text-gray-700 dark:text-gray-100" : ""}`} style={{ color: isOutlined ? subClr : undefined }}>
            <p>Kazakhstan adalah negara terbesar ke-9 di dunia. Hampir tidak ada traveler Indonesia yang tahu ini. Negeri yang dulunya bagian dari jalur sutra ini menyimpan kontras yang luar biasa: kota futuristik Astana yang terkesan datang dari masa depan, berdampingan dengan tradisi nomaden yang masih hidup di yurt-yurt di padang stepa.</p>
            <p>Secara geografis, Kazakhstan adalah surga yang belum terjamah. Danau Kaindy dengan batang pohon yang mencuat dari air, Charyn Canyon yang menyaingi keindahan Grand Canyon Amerika, hingga Pegunungan Tian Shan yang bersalju sepanjang tahun. Semuanya ada dalam satu negara.</p>
            <p>Yang membuat Kazakhstan semakin menarik: <strong>bebas visa 30 hari untuk WNI</strong>. Tidak perlu ribet mengurus dokumen berbulan-bulan. Beli tiket, pack koper, berangkat.</p>
          </div>
        </section>

        {/* ── PANDUAN ALAM ── */}
        <section className={`${isOutlined ? "" : "rounded-3xl"} p-8 lg:p-12`}
          style={isOutlined
            ? { background: cardBg, border: `2px solid ${bdrClr}`, boxShadow: isPixel || isMap || isKawaii || isTropical ? `4px 4px 0 0 ${bdrClr}` : isGlobe ? "0 8px 32px var(--gl-shadow)" : undefined }
            : { background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 14%, #ffffff)", border: "1px solid #e5e7eb" }}>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={isOutlined ? eyebrowStyle : { background: "var(--site-accent,#2d6a4f)", color: "#111827" }}>
            {isPixel ? "► TIPS ALAM" : "Tips Menjelajah Alam"}
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900" : ""}`}
            style={{ color: isOutlined ? headClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}>
            Yang Perlu Kita Tahu Sebelum ke Alam Kazakhstan
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Waktu Ideal ke Alam", content: "Mei–September adalah musim terbaik. Danau Kaindy, Kolsai, dan Charyn Canyon semuanya accessible. Jalan menuju danau-danau pegunungan sering tertutup salju di luar musim ini." },
              { title: "Sewa Mobil + Driver", content: "Transportasi umum ke destinasi alam sangat terbatas. Sewa mobil plus driver lokal (fasih Rusia/Kazakh) jauh lebih efisien. Budget sekitar USD 50–80/hari, bisa split ramai-ramai." },
              { title: "Altitude Sickness", content: "Danau Kaindy berada di 2.000 mdpl, Kolsai Lakes bisa sampai 2.800 mdpl. Naik perlahan, minum banyak air, dan jangan langsung trekking berat di hari pertama tiba." },
              { title: "Kondisi Jalan", content: "Beberapa rute ke alam masih berupa jalan tanah berbatu. Pastikan kendaraan yang disewa 4WD atau SUV, terutama ke Danau Kaindy setelah hujan." },
              { title: "Musim Dingin = Ski", content: "Desember–Februari Almaty jadi surga ski. Shymbulak Ski Resort di ketinggian 2.200–3.200 mdpl menawarkan piste berkualitas internasional dengan harga yang jauh lebih terjangkau dari Eropa." },
              { title: "Konektivitas", content: "Almaty dan Astana punya internet yang sangat baik. Di pedalaman sinyal bisa putus. Download Google Maps offline sebelum berangkat ke alam. Beberapa area masih WhatsApp-only." },
            ].map(({ title, content }) => (
              <div key={title} className="flex gap-3">
                <div className="w-1 rounded-full shrink-0 mt-1" style={{ background: "var(--site-accent,#2d6a4f)" }} />
                <div>
                  <p className={`font-bold mb-1 ${!isOutlined ? "text-gray-900" : ""}`} style={{ color: isOutlined ? headClr : undefined }}>{title}</p>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-gray-700" : ""}`} style={{ color: isOutlined ? subClr : undefined }}>{content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ACTIVITIES ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► DESTINASI & AKTIVITAS" : "Destinasi & Aktivitas"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Apa yang Bisa Kita Lakukan di Kazakhstan
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACTIVITIES.map(({ img, title, desc }) => (
              <div key={title} className={`${cardClass} overflow-hidden`}
                style={cardBg ? { background: cardBg, borderColor: bdrClr, boxShadow: (isPixel || isMap || isKawaii || isTropical) ? `3px 3px 0 0 ${bdrClr}` : undefined } : {}}>
                <div className="relative h-44 w-full overflow-hidden">
                  <Image src={img} alt={title} fill className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                </div>
                <div className="p-5">
                  <h3 className={`font-bold mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                    style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-200" : ""}`}
                    style={{ color: subClr }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CARA KE SANA ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
            {isPixel ? "► RUTE DARI INDONESIA" : "Rute dari Indonesia"}
          </span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Cara ke Kazakhstan dari Jakarta
          </h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Jakarta → Kuala Lumpur → Almaty (Rekomendasi)", desc: "AirAsia CGK→KUL (~2 jam), lanjut Air Astana KUL→ALA (~6 jam). Total ±10–11 jam, harga paling terjangkau. Air Astana terbang langsung dari KL ke Almaty 4x seminggu." },
              { step: "02", title: "Jakarta → Dubai/Istanbul → Almaty (Alternatif)", desc: "Emirates via Dubai atau Turkish Airlines via Istanbul. Total ±13–16 jam. Pilihan ini lebih banyak frekuensinya dan kadang lebih murah jika pesan jauh hari." },
              { step: "03", title: "Almaty ke Astana (Dalam Kazakhstan)", desc: "Penerbangan domestik sekitar 2 jam (Air Astana, Fly Arystan). Kereta malam Almaty–Astana juga tersedia, sekitar 12 jam. Perjalanan malam ini terasa seperti petualangan tersendiri melintasi stepa yang luas." },
              { step: "04", title: "Almaty → Destinasi Alam", desc: "Sewa mobil dari Almaty ke Charyn Canyon (±200 km, 3 jam), Danau Kaindy (±250 km, 4 jam), Kolsai Lakes (±280 km, 4,5 jam). Gabung grup atau tur day trip lebih hemat." },
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
              { item: "Tiket pesawat PP (Jakarta–KL–Almaty)", range: "Rp 7.000.000 – 14.000.000" },
              { item: "Penerbangan domestik (Almaty–Astana PP)", range: "Rp 800.000 – 2.000.000" },
              { item: "Akomodasi 7 malam (hotel bintang 3)", range: "Rp 3.000.000 – 6.000.000" },
              { item: "Tour & aktivitas alam (Kaindy, Charyn, dll)", range: "Rp 4.000.000 – 8.000.000" },
              { item: "Makan & transport lokal", range: "Rp 2.000.000 – 4.000.000" },
              { item: "Visa", range: "Gratis (bebas visa 30 hari)" },
              { item: "Asuransi perjalanan", range: "Rp 400.000 – 900.000" },
            ].map(({ item, range }) => (
              <div key={item} className={`flex items-center justify-between gap-4 py-3 border-b ${!isOutlined ? "border-gray-200 dark:border-slate-800" : ""}`}
                style={{ borderColor: bdrClr }}>
                <span className={`text-sm ${!isOutlined ? "text-gray-700 dark:text-gray-300" : ""}`} style={{ color: subClr }}>{item}</span>
                <span className={`text-sm font-bold whitespace-nowrap ${!isOutlined ? "text-gray-900 dark:text-white" : ""} ${range === "Gratis (bebas visa 30 hari)" ? "text-green-600 dark:text-green-400" : ""}`}
                  style={{ color: range === "Gratis (bebas visa 30 hari)" ? "#16a34a" : headClr }}>{range}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 pt-4">
              <span className={`font-black ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`} style={{ color: headClr }}>Total Estimasi</span>
              <span className="font-black text-lg" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>Rp 20 – 38 juta / orang</span>
            </div>
          </div>
          <p className={`text-xs mt-4 ${!isOutlined ? "text-gray-400 dark:text-gray-600" : ""}`} style={{ color: subClr, opacity: 0.7 }}>
            * Estimasi 7–10 hari. Dengan paket tur Sundaftrip, biasanya lebih hemat karena sudah bundled dan group sharing.
          </p>
        </section>

        {/* ── PAKET TOUR dari DB ── */}
        {tours.length > 0 && (
          <section>
            <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>
              {isPixel ? "► PAKET TERSEDIA" : "Paket Tersedia"}
            </span>
            <h2 className={`text-3xl font-black mt-3 mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
              style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
              Paket Tour Kazakhstan dari Sundaftrip
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tours.map((tour) => (
                <Link key={tour.id} href={`/tours/${tour.slug ?? tour.id}`}
                  className={`group block overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isOutlined ? cardClass : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-300"}`}
                  style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
                  <div className="relative h-44 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {tour.heroImg
                      ? <Image src={tour.heroImg} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                      : <div className="flex items-center justify-center h-full"><MapPin size={28} className="text-gray-300" /></div>}
                    {tour.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-semibold" style={accentStyle}>
                        {tour.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className={`text-xs mb-1 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`} style={{ color: subClr }}>
                      {tour.country} · {tour.duration}
                    </p>
                    <h3 className={`font-bold text-sm leading-tight mb-3 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                      style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{tour.title}</h3>
                    <p className="font-black" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                      {(tour.promoPrice ?? tour.price) > 0 ? formatCurrency(tour.promoPrice ?? tour.price) : "Tanya Harga"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tours" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                Lihat semua paket tour <ChevronRight size={16} />
              </Link>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section>
          <span className={`${pillClass} inline-flex mb-3 text-xs font-bold`} style={eyebrowStyle}>FAQ</span>
          <h2 className={`text-3xl font-black mt-3 mb-8 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
            Pertanyaan yang Sering Ditanya
          </h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q}
                className={`group ${isOutlined ? cardClass : "border border-gray-200 dark:border-slate-800 rounded-2xl bg-gray-50 dark:bg-slate-900"}`}
                style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
                <summary className={`flex items-center justify-between px-6 py-4 cursor-pointer list-none select-none font-bold text-sm gap-4 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                  style={{ color: isOutlined ? headClr : undefined }}>
                  <span>{q}</span>
                  <ChevronRight size={15} className="shrink-0 transition-transform duration-200 group-open:rotate-90"
                    style={{ color: isOutlined ? bdrClr : "#9ca3af" }} />
                </summary>
                <div className={`px-6 pb-5 text-sm leading-relaxed border-t ${isOutlined ? "border-dashed" : "border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400"}`}
                  style={isOutlined ? { color: subClr, borderColor: bdrClr } : undefined}>
                  <p className="pt-4">{a}</p>
                </div>
              </details>
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
              Artikel Seputar Kazakhstan & Asia Tengah
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}
                  className={`group block overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isOutlined ? cardClass : "bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-300"}`}
                  style={cardBg ? { background: cardBg, borderColor: bdrClr } : {}}>
                  <div className="relative h-36 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {post.cover
                      ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                      : <div className="flex items-center justify-center h-full"><Camera size={24} className="text-gray-300" /></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-[11px] mb-2" style={{ color: subClr ?? "#9ca3af" }}>
                      <Clock size={10} /> {post.readTime}
                    </div>
                    <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                      style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>{post.title}</h3>
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
              : { background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 14%, #ffffff)", border: "1px solid #e5e7eb" }}>
            <h2 className={`text-3xl font-black mb-3 ${!isOutlined ? "text-gray-900" : ""}`}
              style={{ color: isOutlined ? headClr : undefined, fontFamily: isPixel ? "monospace" : undefined }}>
              {isPixel ? "> SIAP KE KAZAKHSTAN?" : "Siap Menjelajah Kazakhstan?"}
            </h2>
            <p className={`mb-8 max-w-lg mx-auto text-sm sm:text-base ${!isOutlined ? "text-gray-700" : ""}`} style={{ color: isOutlined ? subClr : undefined }}>
              Tim Sundaftrip siap bantu Anda merencanakan perjalanan ke Kazakhstan dari awal sampai akhir: tiket, itinerary, akomodasi, hingga guide lokal yang fasih.
            </p>
            <a href={waUrl} target="_blank" rel="noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-4 font-black text-sm transition ${isOutlined ? pillClass : "rounded-full hover:opacity-90"}`}
              style={isOutlined ? accentStyle : { background: "var(--site-accent,#2d6a4f)", color: "#111827" }}>
              <MessageCircle size={18} />
              {isPixel ? "[ CHAT WHATSAPP ]" : "Chat WhatsApp Sekarang"}
            </a>
          </section>
        )}

      </div>
    </div>
  );
}
