export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import React from "react";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import Link from "next/link";
import { Users, ShieldCheck, Heart, Sparkles, MapPin, MessageCircle, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Spesialis perjalanan ke Rusia, Asia Tengah, dan aurora borealis untuk traveler Indonesia. Dari visa sampai itinerary, semua kami rancang.",
};

/* ── Default fallbacks (dipakai kalau admin belum mengisi CMS) ── */
const DEFAULT_DESTINATIONS = [
  { label: "Rusia", sub: "Moskow · St. Petersburg · Trans-Siberian" },
  { label: "Kazakhstan", sub: "Almaty · Astana · Danau Kaindy" },
  { label: "Kyrgyzstan", sub: "Bishkek · Issyk-Kul · Song Kol" },
  { label: "Uzbekistan", sub: "Tashkent · Samarkand · Bukhara" },
  { label: "Tajikistan", sub: "Dushanbe · Pamir Highway" },
  { label: "Aurora Borealis", sub: "Tromsø · Murmansk · Lapland" },
];

const VALUE_ICONS = [Users, ShieldCheck, Heart, Sparkles];

const DEFAULT_VALUES = [
  { title: "Grup Kecil, Pengalaman Besar", desc: "Maksimal 10–12 orang per keberangkatan. Bukan rombongan bus — perjalanan yang terasa personal." },
  { title: "Pendampingan Penuh",           desc: "Dari proses visa, tiket, akomodasi, hingga kepulangan — semuanya kami handle dengan transparan." },
  { title: "Itinerary Manusiawi",          desc: "Tidak terburu-buru, tidak terlalu padat. Kami beri ruang untuk menikmati, bukan sekadar centang daftar." },
  { title: "Informasi Terkini",            desc: "Kami update kondisi visa, situasi lapangan, dan tips lokal sebelum setiap keberangkatan." },
];

const DEFAULT_STORY = [
  "Kami mulai dengan satu paket ke Moskow dan St. Petersburg — di saat kebanyakan agen wisata Indonesia masih fokus di Eropa Barat dan Asia Tenggara. Hasilnya? Peserta kami pulang dengan cerita yang tidak bisa mereka temukan di majalah travel mana pun.",
  "Dari sana kami meluas. Kazakhstan dengan danau-danau terpencilnya. Uzbekistan dengan Samarkand yang biru. Kyrgyzstan yang masih sangat jarang disentuh traveler Indonesia. Tajikistan dengan jalan Pamir yang legendaris. Dan aurora borealis di Tromsø yang membuat kamera gemetar.",
  "Lebih dari 700 traveler Indonesia telah mempercayakan perjalanan mereka kepada kami. Sebagian besar kembali lagi — dengan mengajak keluarga atau teman yang penasaran dengan cerita mereka.",
];

async function getData() {
  try {
    const [themeRow, companyRows, aboutRows, tourCount, blogCount] = await Promise.all([
      prisma.companyInfo.findFirst({ where: { key: "site_theme" } }),
      prisma.companyInfo.findMany({ where: { key: { startsWith: "company_" } } }),
      prisma.companyInfo.findMany({ where: { key: { startsWith: "about_" } } }),
      prisma.tour.count({ where: { status: { not: "DRAFT" } } }),
      prisma.blog.count({ where: { published: true } }),
    ]);
    const rawTheme = themeRow?.value ?? "classic";
    const theme = rawTheme === "console" ? "atlas" : rawTheme === "teri" ? "pixel" : rawTheme;
    const company: Record<string, string> = {};
    companyRows.forEach((r) => { company[r.key] = r.value; });
    const about: Record<string, string> = {};
    aboutRows.forEach((r) => { about[r.key] = r.value; });

    const story        = about.about_story        ? JSON.parse(about.about_story)        : DEFAULT_STORY;
    const valuesRaw    = about.about_values        ? JSON.parse(about.about_values)        : DEFAULT_VALUES;
    const destinations = about.about_destinations  ? JSON.parse(about.about_destinations)  : DEFAULT_DESTINATIONS;
    const tagline      = about.about_tagline       ?? "";

    const values = (valuesRaw as { title: string; desc: string }[]).map((v, i) => ({
      ...v,
      Icon: VALUE_ICONS[i % VALUE_ICONS.length],
    }));

    return { theme, company, tourCount, blogCount, story, values, destinations, tagline };
  } catch {
    const values = DEFAULT_VALUES.map((v, i) => ({ ...v, Icon: VALUE_ICONS[i] }));
    return { theme: "classic", company: {}, tourCount: 0, blogCount: 0, story: DEFAULT_STORY, values, destinations: DEFAULT_DESTINATIONS, tagline: "" };
  }
}

export default async function AboutPage() {
  const { theme, company, tourCount, blogCount, story, values, destinations, tagline } = await getData();

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isAtelier  = theme === "atelier";
  const isJojo     = theme === "jojo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isAtelier || isJojo;

  const pfx = isKawaii ? "kw" : isTropical ? "tr" : isPixel ? "px"
    : isGlobe ? "gl" : isMap ? "mp" : isAtlas ? "at"
    : isAtelier ? "atl" : isJojo ? "jo" : "";

  const pageBg  = isAtlas ? "var(--at-bg)"      : isTropical ? "var(--tr-bg)"      : isKawaii ? "var(--kw-bg)"      : isPixel ? "var(--px-bg)"      : isAtelier ? "var(--atl-bg)"      : isJojo ? "var(--jo-bg)"   : undefined;
  const headClr = isAtlas ? "var(--at-text)"     : isTropical ? "var(--tr-text)"     : isKawaii ? "var(--kw-text)"     : isPixel ? "var(--px-text)"     : isAtelier ? "var(--atl-ink)"     : isJojo ? "var(--jo-ink)"  : undefined;
  const subClr  = isAtlas ? "var(--at-subtext)"  : isTropical ? "var(--tr-subtext)"  : isKawaii ? "var(--kw-subtext)"  : isPixel ? "var(--px-subtext)"  : isAtelier ? "var(--atl-sub)"     : isJojo ? "var(--jo-sub)"  : undefined;
  const cardBg  = isAtlas ? "var(--at-card)"     : isTropical ? "var(--tr-card)"     : isKawaii ? "var(--kw-card)"     : isPixel ? "var(--px-card)"     : isAtelier ? "var(--atl-surface)" : isJojo ? "var(--jo-card)" : undefined;
  const bdrClr  = isAtlas ? "var(--at-border)"   : isTropical ? "var(--tr-border)"   : isKawaii ? "var(--kw-border)"   : isPixel ? "var(--px-border)"   : isAtelier ? "var(--atl-line)"    : isJojo ? "var(--jo-line)" : undefined;
  const mintClr = isAtlas ? "var(--at-muted)"    : isTropical ? "var(--tr-mint)"     : isKawaii ? "var(--kw-mint)"     : isPixel ? "var(--px-cyan)"     : isAtelier ? "var(--atl-bg)"      : isJojo ? "var(--jo-soft)" : undefined;

  const pixelGrid = isAtlas ? {
    backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)",
    backgroundSize: "32px 32px",
  } : isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : {};

  const wrapperStyle = pageBg ? { backgroundColor: pageBg, ...pixelGrid } : undefined;

  const name      = company["company_name"]      ?? "Sundaftrip";
  const nib       = company["company_nib"]       ?? "";
  const whatsapp  = toWaNumber(company["company_whatsapp"]);
  const waLink    = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Halo, saya ingin konsultasi paket wisata.")}` : "/tours";

  const divStyle = isOutlined
    ? { borderColor: bdrClr }
    : undefined;
  const divCls = isOutlined
    ? "border-t-2 border-dashed my-12"
    : "border-t border-gray-200 dark:border-gray-800 my-12";

  const STATS = [
    { value: "700+", label: "Traveler yang sudah kami fasilitasi" },
    { value: `${tourCount || "5"}+`, label: "Paket tour aktif tersedia" },
    { value: `${blogCount || "10"}+`, label: "Artikel perjalanan ditulis tim kami" },
  ];

  return (
    <div
      className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`}
      style={wrapperStyle}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="mb-12">
          {isOutlined ? (
            <span className={`${pfx}-pill mb-4 inline-flex text-xs uppercase tracking-widest font-black`}
              style={{ color: subClr }}>
              Tentang Kami
            </span>
          ) : (
            <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
              Tentang Kami
            </span>
          )}

          <h1
            className={`text-4xl lg:text-5xl font-black leading-tight mb-5 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Spesialis Perjalanan ke Rusia, Asia Tengah &amp; Aurora
          </h1>

          <p
            className={`text-lg leading-relaxed max-w-2xl ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`}
            style={isOutlined ? { color: subClr } : undefined}>
            {tagline || `${name} lahir dari keyakinan bahwa destinasi yang jarang dikunjungi traveler Indonesia justru menyimpan pengalaman paling tak terlupakan. Kami memulai ketika sangat sedikit agen wisata Indonesia yang berani masuk ke pasar Rusia dan Asia Tengah — dan kami terus di sini.`}
          </p>

          {nib && (
            <p className="mt-3 text-xs flex items-center gap-1.5"
              style={isOutlined ? { color: subClr } : { color: "#9ca3af" }}>
              <Award size={12} /> Terdaftar resmi · NIB {nib}
            </p>
          )}
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div
          className={`grid grid-cols-3 gap-4 p-6 mb-2 ${isOutlined ? "border-2" : "rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"}`}
          style={isOutlined ? { background: cardBg, borderColor: bdrClr } : undefined}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p
                className={`text-3xl font-black mb-1 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                style={isOutlined ? { color: headClr } : undefined}>
                {value}
              </p>
              <p className="text-xs leading-tight"
                style={isOutlined ? { color: subClr } : { color: "#6b7280" }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className={divCls} style={divStyle} />

        {/* ── Cerita kami ────────────────────────────────────────── */}
        <div className="mb-12">
          <h2
            className={`text-2xl font-black mb-4 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Cerita Kami
          </h2>
          <div className={`space-y-4 text-base leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`}
            style={isOutlined ? { color: subClr } : undefined}>
            {story.map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className={divCls} style={divStyle} />

        {/* ── Destinasi ──────────────────────────────────────────── */}
        <div className="mb-12">
          <h2
            className={`text-2xl font-black mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Destinasi yang Kami Spesialisasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {destinations.map(({ label, sub }: { label: string; sub: string }) => (
              <div
                key={label}
                className={`flex items-start gap-3 p-4 ${isOutlined ? "border-2" : "rounded-xl border border-gray-100 dark:border-gray-800"}`}
                style={isOutlined ? { background: cardBg, borderColor: bdrClr } : undefined}>
                <MapPin size={15} className="mt-0.5 shrink-0"
                  style={{ color: isOutlined ? bdrClr : "#9ca3af" }} />
                <div>
                  <p className={`font-black text-sm ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                    style={isOutlined ? { color: headClr } : undefined}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5"
                    style={isOutlined ? { color: subClr } : { color: "#9ca3af" }}>
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className={divCls} style={divStyle} />

        {/* ── Nilai kami ─────────────────────────────────────────── */}
        <div className="mb-12">
          <h2
            className={`text-2xl font-black mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Cara Kami Bekerja
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map(({ Icon, title, desc }: { Icon: React.ElementType; title: string; desc: string }) => (
              <div key={title} className="flex gap-4">
                <div
                  className={`w-10 h-10 shrink-0 flex items-center justify-center ${isOutlined ? "border-2" : "rounded-xl bg-gray-100 dark:bg-gray-800"}`}
                  style={isOutlined ? { background: mintClr ?? cardBg, borderColor: bdrClr } : undefined}>
                  <Icon size={18}
                    style={{ color: isOutlined ? headClr : "#374151" }} />
                </div>
                <div>
                  <p className={`font-black text-sm mb-1 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                    style={isOutlined ? { color: headClr } : undefined}>
                    {title}
                  </p>
                  <p className="text-sm leading-relaxed"
                    style={isOutlined ? { color: subClr } : { color: "#6b7280" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className={divCls} style={divStyle} />

        {/* ── CTA ────────────────────────────────────────────────── */}
        <div className="text-center py-4">
          <h2
            className={`text-2xl font-black mb-3 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Siap Merencanakan Perjalanan?
          </h2>
          <p className="text-sm mb-6"
            style={isOutlined ? { color: subClr } : { color: "#6b7280" }}>
            Konsultasi gratis — ceritakan tujuan dan budget Anda, kami bantu rancang itinerary terbaik.
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
              <MessageCircle size={16} /> Konsultasi via WhatsApp
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
