// ISR: konten CMS jarang berubah; revalidatePublicContent() me-revalidate on-write.
export const revalidate = 300;
import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import React from "react";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";
import Link from "next/link";
import { Users, ShieldCheck, Heart, CloudSun, MapPin, MessageCircle, Award, ArrowRight } from "lucide-react";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import GalleryZoom from "@/components/website/GalleryZoom";
import InquiryForm from "@/components/website/InquiryForm";

/* Daftar foto galeri: nama file dibaca dari /public/about-gallery, tapi yang
   DISAJIKAN versi medium ber-watermark (/about-gallery-md, maks 1366px) supaya
   original 2560px tak pernah ikut ter-download. Fallback ke original bila md
   belum ada. */
function getGalleryImages(): string[] {
  try {
    const mdDir = path.join(process.cwd(), "public", "about-gallery-md");
    const hasMd = fs.existsSync(mdDir);
    return fs
      .readdirSync(path.join(process.cwd(), "public", "about-gallery"))
      .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
      .sort()
      .map((f) => {
        const dir = hasMd && fs.existsSync(path.join(mdDir, f))
          ? "about-gallery-md"
          : "about-gallery";
        return `/${dir}/${encodeURIComponent(f)}`;
      });
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Cerita Sundaf Trip, spesialis perjalanan Rusia, Asia Tengah, dan aurora untuk traveler Indonesia yang ingin berangkat tanpa drama yang tidak perlu.",
  alternates: { canonical: "https://sundaftrip.com/about" },
};

/* ── Default fallbacks (dipakai kalau admin belum mengisi CMS) ── */
const DEFAULT_DESTINATIONS = [
  { label: "Rusia", sub: "Moskow · St. Petersburg · Murmansk · Teriberka" },
  { label: "Aurora Borealis", sub: "Berburu cahaya utara tanpa harus nebak semua sendiri" },
  { label: "Kazakhstan", sub: "Almaty · Astana · Danau Kaindy · Charyn Canyon" },
  { label: "Uzbekistan", sub: "Tashkent · Samarkand · Bukhara" },
  { label: "Kyrgyzstan", sub: "Bishkek · Issyk-Kul · Song Kol" },
  { label: "Tajikistan", sub: "Dushanbe · Pamir Highway" },
];

const VALUE_ICONS = [Users, ShieldCheck, Heart, CloudSun];

const DEFAULT_VALUES = [
  { title: "Grup kecil, cerita besar", desc: "Bukan rombongan bus yang buru-buru turun foto lalu naik lagi. Ritmenya kami jaga supaya tetap enak dinikmati." },
  { title: "Visa dibantu dari awal",    desc: "Kami bantu cek dokumen, alur pengajuan, dan risiko yang perlu kamu tahu sebelum berangkat." },
  { title: "Itinerary tetap manusiawi", desc: "Ada waktu explore, ada waktu istirahat, ada ruang buat benar-benar merasa sedang jalan-jalan." },
  { title: "Update kondisi lapangan",   desc: "Sebelum berangkat, kami cek lagi cuaca, visa, rute, dan situasi destinasi." },
];

const DEFAULT_STORY = [
  "Sundaftrip berawal dari rasa penasaran sama tempat-tempat yang jarang masuk daftar liburan orang Indonesia. Bukan cuma Paris, Tokyo, atau Korea, tapi Rusia saat musim dingin, kota tua di Asia Tengah, dan negeri-negeri bekas Uni Soviet yang ceritanya panjang banget.",
  "Dari perjalanan kecil, kami belajar satu hal: destinasi terbaik sering bukan yang paling ramai di timeline, tapi yang bikin kamu pulang bawa cerita berbeda.",
  "Lama-lama rutenya makin serius. Moskow dan St. Petersburg. Murmansk buat berburu aurora. Kazakhstan dengan danau birunya. Uzbekistan dengan Samarkand yang megah. Kyrgyzstan yang alamnya masih liar. Tajikistan dengan jalan Pamir yang legend banget.",
  "Sekarang 1500+ traveler Indonesia sudah kami bantu berangkat. Ada yang pertama kali ke Rusia, ada yang deg-degan urus visa, ada juga yang pulang-pulang malah ngajak keluarga dan teman buat ikut batch berikutnya.",
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
    const theme = rawTheme === "console" ? "atlas" : rawTheme;
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
  const { theme, company, blogCount, story, values, destinations, tagline } = await getData();
  const gallery = getGalleryImages();

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isFumayo   = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isFumayo;

  const pfx = isKawaii ? "kw" : isTropical ? "tr" : isPixel ? "px"
    : isGlobe ? "gl" : isMap ? "mp" : isAtlas ? "at" : isFumayo ? "fb"
    : "";

  const pageBg  = isFumayo ? "var(--fb-bg)"      : isAtlas ? "var(--at-bg)"      : isTropical ? "var(--tr-bg)"      : isKawaii ? "var(--kw-bg)"      : isPixel ? "var(--px-bg)"      : undefined;
  const headClr = isFumayo ? "var(--fb-text)"    : isAtlas ? "var(--at-text)"     : isTropical ? "var(--tr-text)"     : isKawaii ? "var(--kw-text)"     : isPixel ? "var(--px-text)"     : undefined;
  const subClr  = isFumayo ? "var(--fb-subtext)" : isAtlas ? "var(--at-subtext)"  : isTropical ? "var(--tr-subtext)"  : isKawaii ? "var(--kw-subtext)"  : isPixel ? "var(--px-subtext)"  : undefined;
  const cardBg  = isFumayo ? "var(--fb-card)"    : isAtlas ? "var(--at-card)"     : isTropical ? "var(--tr-card)"     : isKawaii ? "var(--kw-card)"     : isPixel ? "var(--px-card)"     : undefined;
  const bdrClr  = isFumayo ? "var(--fb-border)"  : isAtlas ? "var(--at-border)"   : isTropical ? "var(--tr-border)"   : isKawaii ? "var(--kw-border)"   : isPixel ? "var(--px-border)"   : undefined;
  const mintClr = isFumayo ? "var(--fb-mint)"    : isAtlas ? "var(--at-muted)"    : isTropical ? "var(--tr-mint)"     : isKawaii ? "var(--kw-mint)"     : isPixel ? "var(--px-cyan)"     : undefined;

  const pixelGrid = isAtlas ? {
    backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)",
    backgroundSize: "32px 32px",
  } : isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isFumayo ? {
    backgroundImage: "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)",
    backgroundSize: "26px 26px",
  } : {};

  const wrapperStyle = pageBg ? { backgroundColor: pageBg, ...pixelGrid, ...(isFumayo ? { fontFamily: "var(--fb-font)" } : {}) } : undefined;

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
    { value: "1500+", label: "Traveler Indonesia sudah kami dampingi" },
    { value: "1000+", label: "Pemohon visa kami bantu" },
    { value: "99%", label: "Approval rate pengurusan visa" },
    { value: `${blogCount || "10"}+`, label: "Artikel perjalanan dari tim kami" },
  ];

  return (
    <div
      className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`}
      style={wrapperStyle}
    >
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Tentang Kami", url: "/about" },
        ]}
      />
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
            Jalan ke Rusia, Asia Tengah, sampai aurora, tanpa drama yang gak perlu
          </h1>

          <p
            className={`text-lg leading-relaxed max-w-2xl ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`}
            style={isOutlined ? { color: subClr } : undefined}>
            {tagline || `Visa, bahasa, cuaca, rute, sampai pertanyaan "ini aman gak sih?" sering bikin maju-mundur duluan. Sundaf bantu beresin bagian ribetnya, supaya kamu bisa fokus berangkat dan menikmati perjalanannya.`}
          </p>

          {nib && (
            <p className="mt-3 text-xs flex items-center gap-1.5"
              style={isOutlined ? { color: subClr } : { color: "#9ca3af" }}>
              <Award size={12} /> Terdaftar resmi · NIB {nib}
            </p>
          )}

          <div
            className={`mt-8 p-5 ${isOutlined ? "border-2" : "rounded-2xl border border-blue-100 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/30"}`}
            style={isOutlined ? { background: cardBg, borderColor: bdrClr } : undefined}>
            <p
              className={`text-xs font-black uppercase mb-2 ${!isOutlined ? "text-blue-700 dark:text-blue-300" : ""}`}
              style={isOutlined ? { color: headClr } : undefined}>
              Profil brand formal
            </p>
            <p
              className={`text-sm leading-relaxed mb-4 ${!isOutlined ? "text-gray-700 dark:text-gray-300" : ""}`}
              style={isOutlined ? { color: subClr } : undefined}>
              Halaman ini dibuat lebih santai untuk traveler. Untuk versi formal tentang identitas brand, nama legal, layanan utama, dan rute spesialisasi Sundaf Trip, buka profil resmi kami.
            </p>
            <Link
              href="/sundaf-trip"
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 font-black text-sm transition ${
                isOutlined ? `${pfx}-btn` : "rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              }`}>
              Buka profil resmi <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 mb-2 ${isOutlined ? "border-2" : "rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"}`}
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
            Awalnya dari rasa penasaran
          </h2>
          <div className={`space-y-4 text-base leading-relaxed ${!isOutlined ? "text-gray-600 dark:text-gray-400" : ""}`}
            style={isOutlined ? { color: subClr } : undefined}>
            {story.map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* ── Galeri ─────────────────────────────────────────────── */}
        {gallery.length > 0 && (
          <>
            <div className={divCls} style={divStyle} />
            <div className="mb-12">
              <h2
                className={`text-2xl font-black mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                style={isOutlined ? { color: headClr } : undefined}>
                Bukti jalan, bukan cuma cerita
              </h2>
              <p className="text-sm mb-6"
                style={isOutlined ? { color: subClr } : { color: "#6b7280" }}>
                Cuplikan perjalanan peserta kami di Rusia, Asia Tengah, dan rute aurora. Klik untuk lihat lebih dekat.
              </p>
              <GalleryZoom images={gallery} />
            </div>
          </>
        )}

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className={divCls} style={divStyle} />

        {/* ── Destinasi ──────────────────────────────────────────── */}
        <div className="mb-12">
          <h2
            className={`text-2xl font-black mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Rute yang sering bikin traveler penasaran
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
            Cara kami bikin trip tetap waras
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

        {/* ── Form Konsultasi ────────────────────────────────────── */}
        <div className="mb-12">
          <h2
            className={`text-2xl font-black mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Cerita dulu rencana kamu
          </h2>
          <p className="text-sm mb-6"
            style={isOutlined ? { color: subClr } : { color: "#6b7280" }}>
            Tulis tujuan, tanggal, jumlah peserta, dan budget kasar. Tim Sundaf akan follow up via WhatsApp.
          </p>
          <InquiryForm />
        </div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className={divCls} style={divStyle} />

        {/* ── CTA ────────────────────────────────────────────────── */}
        <div className="text-center py-4">
          <h2
            className={`text-2xl font-black mb-3 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}>
            Mau coba rute yang beda dari orang-orang?
          </h2>
          <p className="text-sm mb-6"
            style={isOutlined ? { color: subClr } : { color: "#6b7280" }}>
            Ceritakan rencana, budget, dan tanggal kamu. Kami bantu lihat rute yang paling masuk akal.
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
            <Link
              href="/visa"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-sm transition ${
                isOutlined ? `${pfx}-pill` : "border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
              style={isOutlined ? { background: cardBg, color: headClr, borderColor: bdrClr } : undefined}>
              Layanan Visa
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
