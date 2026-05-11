"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  waNumber?: string;
  companyName?: string;
  theme?: "classic" | "vibrant" | "bold" | "tropical";
  featuredImage?: string | null;
}

export default function HeroSection({ texts, waNumber, companyName, theme = "classic", featuredImage }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

  const t = (key: string, fallback: string) => texts[key]?.[lang] || fallback;
  const eyebrow = companyName
    ? `${companyName} — ${t("hero_eyebrow", "Perjalanan Terpercaya")}`
    : t("hero_eyebrow", "Perjalanan Terpercaya");

  /* ── TROPICAL ── */
  if (theme === "tropical") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "#fffdf7" }}>
      {/* Floating decorative blobs */}
      <div className="absolute top-28 right-8 lg:right-28 w-40 h-40 rounded-full border-2 border-black tr-float-1 pointer-events-none" style={{ background: "#d1fae5" }} />
      <div className="absolute top-52 right-2 lg:right-12 w-20 h-20 rounded-full border-2 border-black tr-float-2 pointer-events-none" style={{ background: "#bfdbfe" }} />
      <div className="absolute bottom-14 left-4 lg:left-20 w-28 h-28 rounded-full border-2 border-black tr-float-3 pointer-events-none" style={{ background: "#fef3c7" }} />
      <div className="absolute bottom-28 right-[38%] w-10 h-10 rounded-full border-2 border-black tr-float-4 pointer-events-none" style={{ background: "#fce7f3" }} />
      <div className="absolute top-36 left-[45%] w-7 h-7 rounded-full border-2 border-black tr-float-2 pointer-events-none" style={{ background: "#ede9fe" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Eyebrow sticker */}
        <div className="mb-8 hero-fade-up">
          <span className="tr-pill" style={{ background: "#d1fae5" }}>
            ✈ {eyebrow}
          </span>
        </div>

        {/* Big heading */}
        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "#1a1a1a" }}>
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>

        {/* Floating info tags */}
        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="tr-pill" style={{ background: "#dbeafe" }}>
            🗺️ {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="tr-pill" style={{ background: "#fce7f3", transform: "rotate(-2deg)" }}>
            🌴 Paket Lengkap
          </span>
          <span className="tr-pill" style={{ background: "#fef3c7", transform: "rotate(1.5deg)" }}>
            ⭐ Terpercaya
          </span>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="tr-btn px-8 py-4 text-sm font-black"
            style={{ background: "#10b981", color: "#1a1a1a" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="tr-btn px-8 py-4 text-sm font-black"
              style={{ background: "white", color: "#1a1a1a" }}>
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── CATALOG (vibrant) ── */
  if (theme === "vibrant") return (
    <section className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-16 pt-28 pb-12 lg:pt-36 min-h-[60vh] lg:min-h-screen hero-fade-up">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: "var(--site-eyebrow,#6b7280)" }}>
          {eyebrow}
        </p>
        <div className="py-8 lg:py-0">
          <p className="text-xs font-mono text-gray-300 dark:text-gray-700 mb-6 tracking-widest">— 01</p>
          <h1 className="text-[clamp(2.8rem,6vw,6rem)] font-black leading-[0.92] tracking-tight mb-8"
            style={{ color: "var(--site-hero,#0d2018)" }}>
            {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link href="/tours"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold text-white rounded-2xl transition-all hover:opacity-90 hover:scale-105 shadow-lg"
            style={{ background: "var(--site-accent,#2d6a4f)" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="text-sm font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition underline underline-offset-4">
              WhatsApp ↗
            </a>
          )}
        </div>
      </div>

      <div className="relative w-full lg:w-[45%] h-64 lg:h-auto shrink-0 overflow-hidden hero-fade-left">
        {featuredImage ? (
          <Image src={featuredImage} alt="Featured Tour" fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 45vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--site-accent,#2d6a4f)", opacity: 0.12 }}>
            <MapPin size={48} className="text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent lg:from-white/10 dark:from-gray-950/40" />
        <div className="absolute bottom-6 right-6 text-right">
          <div className="inline-block px-4 py-2 rounded-xl text-white text-xs font-bold backdrop-blur-sm"
            style={{ background: "var(--site-accent,#2d6a4f)" }}>
            Katalog {new Date().getFullYear()}
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-semibold"
            style={{ writingMode: "vertical-rl" }}>
            Unique Collection
          </p>
        </div>
      </div>
    </section>
  );

  /* ── BOLD ── */
  if (theme === "bold") return (
    <section className="min-h-screen flex flex-col justify-center bg-gray-950 px-4 py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full hero-fade-up">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-12 text-gray-600">{eyebrow}</p>
        <h1 className="text-[clamp(3rem,9vw,8rem)] font-black leading-[0.92] tracking-tight text-white max-w-5xl mb-16">
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-10 border-t border-gray-800">
          <p className="text-base text-gray-500 max-w-sm leading-relaxed">
            {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/tours"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-2xl transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "var(--site-accent,#2d6a4f)" }}>
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
            </Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                className="text-sm font-medium text-gray-600 hover:text-white transition underline underline-offset-4">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  /* ── CLASSIC ── */
  return (
    <section className="min-h-screen flex flex-col justify-end bg-white dark:bg-black pb-20 lg:pb-28 pt-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full hero-fade-up">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-8"
          style={{ color: "var(--site-eyebrow,#6b7280)" }}>
          {eyebrow}
        </p>
        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[1.0] tracking-tight max-w-4xl mb-10"
          style={{ color: "var(--site-hero,#0d2018)" }}>
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-gray-100 dark:border-gray-900">
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: "var(--site-accent,#2d6a4f)" }}>
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
            </Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-4">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
