export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageCircle, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — Pertanyaan Umum",
  description: "Jawaban atas pertanyaan paling sering tentang paket tour Rusia, Asia Tengah, dan aurora borealis bersama Sundaftrip.",
};

const SECTION_ORDER = ["Umum", "Visa & Dokumen", "Pembayaran & Deposit", "Di Lapangan"];

async function getData() {
  try {
    const [themeRow, companyRows, faqs] = await Promise.all([
      prisma.companyInfo.findFirst({ where: { key: "site_theme" } }),
      prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp"] } } }),
      prisma.faq.findMany({
        where: { active: true },
        orderBy: [{ section: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      }),
    ]);
    const company: Record<string, string> = {};
    companyRows.forEach((r) => { company[r.key] = r.value; });
    const rawTheme = themeRow?.value ?? "classic";
    return { theme: rawTheme === "console" ? "atlas" : rawTheme, company, faqs };
  } catch {
    return { theme: "classic", company: {}, faqs: [] };
  }
}

export default async function FaqPage() {
  const { theme, company, faqs } = await getData();

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

  const pageBg  = isAtlas ? "var(--at-bg)"     : isTropical ? "var(--tr-bg)"     : isKawaii ? "var(--kw-bg)"     : isPixel ? "var(--px-bg)"     : isAtelier ? "var(--atl-bg)"      : isJojo ? "var(--jo-bg)"   : undefined;
  const headClr = isAtlas ? "var(--at-text)"    : isTropical ? "var(--tr-text)"    : isKawaii ? "var(--kw-text)"    : isPixel ? "var(--px-text)"    : isAtelier ? "var(--atl-ink)"     : isJojo ? "var(--jo-ink)"  : undefined;
  const subClr  = isAtlas ? "var(--at-subtext)" : isTropical ? "var(--tr-subtext)" : isKawaii ? "var(--kw-subtext)" : isPixel ? "var(--px-subtext)" : isAtelier ? "var(--atl-sub)"     : isJojo ? "var(--jo-sub)"  : undefined;
  const cardBg  = isAtlas ? "var(--at-card)"    : isTropical ? "var(--tr-card)"    : isKawaii ? "var(--kw-card)"    : isPixel ? "var(--px-card)"    : isAtelier ? "var(--atl-surface)" : isJojo ? "var(--jo-card)" : undefined;
  const bdrClr  = isAtlas ? "var(--at-border)"  : isTropical ? "var(--tr-border)"  : isKawaii ? "var(--kw-border)"  : isPixel ? "var(--px-border)"  : isAtelier ? "var(--atl-line)"    : isJojo ? "var(--jo-line)" : undefined;

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

  // Group FAQs by section, preserving SECTION_ORDER
  const grouped = SECTION_ORDER.map(sec => ({
    section: sec,
    items: faqs.filter(f => f.section === sec),
  })).filter(g => g.items.length > 0);

  // Also include any custom sections not in SECTION_ORDER
  const extraSections = [...new Set(faqs.map(f => f.section))].filter(s => !SECTION_ORDER.includes(s));
  extraSections.forEach(sec => {
    grouped.push({ section: sec, items: faqs.filter(f => f.section === sec) });
  });

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
            Tidak menemukan jawaban yang Anda cari? Hubungi tim kami langsung via WhatsApp.
          </p>
        </div>

        {/* ── FAQ Sections ── */}
        {grouped.length === 0 ? (
          <div className={`text-center py-16 ${!isOutlined ? "text-gray-400" : ""}`}
            style={isOutlined ? { color: subClr } : undefined}>
            <p className="text-sm">Belum ada FAQ yang tersedia.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ section, items }) => (
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
                  {items.map(({ id, question, answer }) => (
                    <details
                      key={id}
                      className={`group ${isOutlined ? "border-2" : "rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"}`}
                      style={isOutlined ? { background: cardBg, borderColor: bdrClr } : undefined}
                    >
                      <summary
                        className={`flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none font-black text-sm gap-4 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                        style={isOutlined ? { color: headClr } : undefined}
                      >
                        <span>{question}</span>
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
                        <p className="pt-4">{answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
