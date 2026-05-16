"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { JojoSticker, JojoStickerField } from "./JojoStickers";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  waNumber?: string;
  companyName?: string;
  theme?: "classic" | "vibrant" | "bold" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "atelier" | "jojo";
  featuredImage?: string | null;
  heroImages?: string[];
}

export default function HeroSection({ texts, waNumber, companyName, theme = "classic", featuredImage, heroImages = [] }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

  /* Atelier hero carousel — auto-advance */
  const atlSlides = heroImages.length > 0 ? heroImages : (featuredImage ? [featuredImage] : []);
  useEffect(() => {
    if (theme !== "atelier" || atlSlides.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % atlSlides.length), 5500);
    return () => clearInterval(id);
  }, [theme, atlSlides.length]);

  const t = (key: string, fallback: string) => {
    const val = texts[key];
    if (!val) return fallback;
    if (lang === "en") return val.en || val.id || fallback;
    return val.id || val.en || fallback;
  };
  const eyebrow = companyName
    ? `${companyName} — ${t("hero_eyebrow", "Perjalanan Terpercaya")}`
    : t("hero_eyebrow", "Perjalanan Terpercaya");

  /* Render tiap kata sebagai block — agar akronim vertikal (mis. S-U-N-D-A-F) terbaca */
  const TitleWords = ({ extra }: { extra?: React.ReactNode }) => (
    <>
      {t("hero_title", "Wujudkan Perjalanan Impian Anda")
        .split(/\s+/).filter(Boolean)
        .map((word, i) => <span key={i} className="block">{word}</span>)}
      {extra}
    </>
  );

  /* ── KAWAII ── */
  if (theme === "kawaii") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "var(--kw-bg)" }}>
      {/* Floating cute decorations */}
      <span className="absolute top-32 right-12 lg:right-32 text-5xl kw-float-1 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.55 }}>♡</span>
      <span className="absolute top-48 right-[35%] text-3xl kw-float-2 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.4 }}>✦</span>
      <span className="absolute bottom-20 left-12 lg:left-24 text-4xl kw-float-3 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.45 }}>★</span>
      <span className="absolute top-40 left-[42%] text-2xl kw-float-4 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.35 }}>✨</span>
      <span className="absolute bottom-36 right-[22%] text-3xl kw-float-2 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.4, animationDelay: "1s" }}>♡</span>
      <span className="absolute top-28 left-8 text-xl kw-float-3 pointer-events-none select-none" style={{ color: "var(--kw-border)", opacity: 0.3 }}>◇</span>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="kw-pill" style={{ background: "var(--kw-peach)", color: "var(--kw-text)" }}>
            ✈ {eyebrow}
          </span>
        </div>

        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--kw-text)" }}>
          <TitleWords extra={<span className="inline-block ml-3 text-[35%] align-middle kw-float-1" style={{ color: "var(--kw-border)" }}>♡</span>} />
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="kw-pill" style={{ background: "var(--kw-sky)", color: "var(--kw-text)" }}>
            🗺️ {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="kw-pill" style={{ background: "var(--kw-blush)", color: "var(--kw-text)", transform: "rotate(-1.5deg)" }}>
            🌸 Paket Lengkap
          </span>
          <span className="kw-pill" style={{ background: "var(--kw-sun)", color: "var(--kw-text)", transform: "rotate(1deg)" }}>
            ⭐ Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="kw-btn px-8 py-4 text-sm font-black"
            style={{ background: "var(--kw-border)", color: "#ffffff" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="kw-btn px-8 py-4 text-sm font-black"
              style={{ background: "var(--kw-card)", color: "var(--kw-text)" }}>
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── TROPICAL ── */
  if (theme === "tropical") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "var(--tr-bg)" }}>
      {/* Floating decorative blobs */}
      <div className="absolute top-28 right-8 lg:right-28 w-40 h-40 rounded-full border-2 tr-float-1 pointer-events-none"
        style={{ background: "var(--tr-mint)", borderColor: "var(--tr-border)" }} />
      <div className="absolute top-52 right-2 lg:right-12 w-20 h-20 rounded-full border-2 tr-float-2 pointer-events-none"
        style={{ background: "var(--tr-sky)", borderColor: "var(--tr-border)" }} />
      <div className="absolute bottom-14 left-4 lg:left-20 w-28 h-28 rounded-full border-2 tr-float-3 pointer-events-none"
        style={{ background: "var(--tr-sun)", borderColor: "var(--tr-border)" }} />
      <div className="absolute bottom-28 right-[38%] w-10 h-10 rounded-full border-2 tr-float-4 pointer-events-none"
        style={{ background: "var(--tr-pink)", borderColor: "var(--tr-border)" }} />
      <div className="absolute top-36 left-[45%] w-7 h-7 rounded-full border-2 tr-float-2 pointer-events-none"
        style={{ background: "var(--tr-grape)", borderColor: "var(--tr-border)" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="tr-pill" style={{ background: "var(--tr-mint)", color: "var(--tr-text)" }}>
            ✈ {eyebrow}
          </span>
        </div>

        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--tr-text)" }}>
          <TitleWords />
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="tr-pill" style={{ background: "var(--tr-sky)", color: "var(--tr-text)" }}>
            🗺️ {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="tr-pill" style={{ background: "var(--tr-pink)", color: "var(--tr-text)", transform: "rotate(-2deg)" }}>
            🌴 Paket Lengkap
          </span>
          <span className="tr-pill" style={{ background: "var(--tr-sun)", color: "var(--tr-text)", transform: "rotate(1.5deg)" }}>
            ⭐ Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="tr-btn px-8 py-4 text-sm font-black"
            style={{ background: "var(--site-accent)", color: "#fff" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="tr-btn px-8 py-4 text-sm font-black"
              style={{ background: "var(--tr-card)", color: "var(--tr-text)" }}>
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
            <TitleWords />
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
          <TitleWords />
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

  /* ── GLOBE / WORLD LANDMARKS ── */
  if (theme === "globe") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "var(--gl-bg)" }}>
      {/* Floating landmark decorations */}
      <span className="absolute top-32 right-12 lg:right-32 text-5xl gl-float-1 pointer-events-none select-none" style={{ opacity: 0.6 }}>🗼</span>
      <span className="absolute top-48 right-[35%] text-3xl gl-float-2 pointer-events-none select-none" style={{ opacity: 0.45 }}>🏛️</span>
      <span className="absolute bottom-20 left-12 lg:left-24 text-4xl gl-float-3 pointer-events-none select-none" style={{ opacity: 0.5 }}>🕌</span>
      <span className="absolute top-40 left-[42%] text-2xl gl-float-4 pointer-events-none select-none" style={{ opacity: 0.4 }}>🗽</span>
      <span className="absolute bottom-36 right-[22%] text-3xl gl-float-2 pointer-events-none select-none" style={{ opacity: 0.45, animationDelay: "1.2s" }}>✈️</span>
      <span className="absolute top-28 left-8 text-xl gl-float-3 pointer-events-none select-none" style={{ opacity: 0.35 }}>🌍</span>
      <span className="absolute bottom-14 right-8 text-2xl gl-float-1 pointer-events-none select-none" style={{ opacity: 0.4, animationDelay: "2s" }}>🏰</span>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="gl-pill" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>
            ✈ {eyebrow}
          </span>
        </div>

        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--gl-text)" }}>
          <TitleWords extra={<span className="inline-block ml-3 text-[30%] align-middle gl-float-1" style={{ opacity: 0.7 }}>🌍</span>} />
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="gl-pill" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>
            🗺️ {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="gl-pill" style={{ background: "var(--gl-amber)", color: "var(--gl-on-amber)", borderColor: "transparent", transform: "rotate(-1.5deg)" }}>
            🧳 Paket Lengkap
          </span>
          <span className="gl-pill" style={{ background: "var(--gl-grass)", color: "var(--gl-on-grass)", borderColor: "transparent", transform: "rotate(1deg)" }}>
            ⭐ Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="gl-btn px-8 py-4 text-sm font-black"
            style={{ background: "var(--gl-border)", color: "#ffffff", borderColor: "var(--gl-border)" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="gl-btn px-8 py-4 text-sm font-black"
              style={{ background: "var(--gl-card)", color: "var(--gl-text)" }}>
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{ background: "var(--mp-bg)" }}>

      {/* Animated lat/lon grid overlay */}
      <div className="absolute inset-0 mp-grid-bg pointer-events-none" />

      {/* Parchment land silhouette — large organic shape, top-right */}
      <div className="absolute -top-32 right-0 w-[55%] h-[110%] pointer-events-none hidden lg:block"
        style={{ background: "var(--mp-land)", clipPath: "polygon(18% 0%, 100% 0%, 100% 100%, 8% 100%, 0% 60%, 5% 30%)", opacity: 0.72 }} />

      {/* Contour rings inside the land area */}
      <div className="absolute top-16 right-[15%] w-64 h-64 rounded-full border pointer-events-none mp-terrain-1" style={{ borderColor: "var(--mp-border)", opacity: 0.15 }} />
      <div className="absolute top-28 right-[20%] w-44 h-44 rounded-full border pointer-events-none mp-terrain-2" style={{ borderColor: "var(--mp-border)", opacity: 0.12 }} />
      <div className="absolute top-40 right-[26%] w-28 h-28 rounded-full border pointer-events-none mp-terrain-3" style={{ borderColor: "var(--mp-border)", opacity: 0.10 }} />

      {/* Sea route line + location pins */}
      <div className="absolute top-56 left-0 w-[55%] mp-route pointer-events-none" style={{ opacity: 0.5 }} />
      <div className="absolute mp-pin pointer-events-none" style={{ top: "220px", left: "18%" }} />
      <div className="absolute mp-pin pointer-events-none" style={{ top: "220px", left: "35%", animationDelay: "0.8s" }} />
      <div className="absolute mp-pin pointer-events-none" style={{ top: "220px", left: "50%", animationDelay: "1.6s" }} />

      {/* Compass rose — bottom-right of land area */}
      <div className="absolute bottom-12 right-[8%] mp-compass hidden lg:flex items-center justify-center" style={{ width: 56, height: 56 }}>
        <div className="mp-compass-n" />
        <div className="mp-compass-c" />
      </div>

      {/* Outer frame border — like a real map */}
      <div className="absolute inset-3 border pointer-events-none hidden lg:block" style={{ borderColor: "color-mix(in srgb, var(--mp-border) 30%, transparent)" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="mp-pill" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            {eyebrow}
          </span>
        </div>

        <h1 className="text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] tracking-tight max-w-3xl mb-10 hero-fade-up"
          style={{ color: "var(--mp-text)", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 900 }}>
          <TitleWords />
        </h1>

        <div className="flex flex-wrap gap-2.5 mb-12 hero-fade-up">
          <span className="mp-pill" style={{ background: "color-mix(in srgb, var(--mp-water) 30%, var(--mp-land))", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="mp-pill" style={{ background: "color-mix(in srgb, var(--mp-water) 30%, var(--mp-land))", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            Paket Lengkap
          </span>
          <span className="mp-pill" style={{ background: "color-mix(in srgb, var(--mp-water) 30%, var(--mp-land))", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
            Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="mp-btn px-8 py-4 text-sm font-bold"
            style={{ background: "var(--mp-accent)", color: "#ffffff", borderColor: "var(--mp-border)" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="mp-btn px-8 py-4 text-sm font-bold"
              style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── PIXEL ART ── */
  if (theme === "pixel") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4"
      style={{
        background: "var(--px-bg)",
        backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
        backgroundSize: "24px 24px",
      }}>
      {/* Floating pixel blocks */}
      <div className="absolute top-32 right-16 lg:right-36 w-8 h-8 px-float-1 pointer-events-none"
        style={{ background: "var(--px-red)", border: "2px solid var(--px-border)", boxShadow: "3px 3px 0 0 var(--px-shadow)", opacity: 0.7 }} />
      <div className="absolute top-56 right-[30%] w-5 h-5 px-float-2 pointer-events-none"
        style={{ background: "var(--px-yellow)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.65 }} />
      <div className="absolute bottom-24 left-16 lg:left-32 w-6 h-6 px-float-3 pointer-events-none"
        style={{ background: "var(--px-cyan)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.6 }} />
      <div className="absolute top-44 left-[42%] w-4 h-4 px-float-4 pointer-events-none"
        style={{ background: "var(--px-purple)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.55 }} />
      <div className="absolute bottom-40 right-[20%] w-7 h-7 px-float-2 pointer-events-none"
        style={{ background: "var(--px-green)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.6, animationDelay: "1s" }} />
      <div className="absolute top-28 left-8 w-4 h-4 px-float-3 pointer-events-none"
        style={{ background: "var(--px-red)", border: "2px solid var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)", opacity: 0.45, animationDelay: "0.8s" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="px-pill" style={{ background: "var(--px-yellow)", color: "var(--px-on-yellow)" }}>
            ► {eyebrow}
          </span>
        </div>

        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-black leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--px-text)", fontFamily: "monospace" }}>
          <TitleWords />
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="px-pill" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>
            [MAP] {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="px-pill" style={{ background: "var(--px-purple)", color: "#ffffff" }}>
            [PKG] Paket Lengkap
          </span>
          <span className="px-pill" style={{ background: "var(--px-green)", color: "#111827" }}>
            [★★★] Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="px-btn px-8 py-4 text-sm"
            style={{ background: "var(--site-accent)", color: "#ffffff" }}>
            {t("hero_btn", "LIHAT TOUR")} ►
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="px-btn px-8 py-4 text-sm"
              style={{ background: "var(--px-card)", color: "var(--px-text)" }}>
              [WA] CHAT KAMI
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-28 pb-20 px-4 at-grid-bg"
      style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 hero-fade-up">
          <span className="at-pill" style={{ color: "var(--at-text)" }}>
            {eyebrow}
          </span>
        </div>

        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[0.92] tracking-tight max-w-4xl mb-10 hero-fade-up"
          style={{ color: "var(--at-text)" }}>
          <TitleWords />
        </h1>

        <div className="flex flex-wrap gap-3 mb-12 hero-fade-up">
          <span className="at-pill" style={{ color: "var(--at-subtext)" }}>
            {t("hero_subtitle", "Destinasi Pilihan")}
          </span>
          <span className="at-pill" style={{ color: "var(--at-subtext)" }}>
            Paket Lengkap
          </span>
          <span className="at-pill" style={{ color: "var(--at-subtext)" }}>
            Terpercaya
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/tours"
            className="at-btn-solid px-8 py-4 text-sm">
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="at-btn px-8 py-4 text-sm"
              style={{ color: "var(--at-text)" }}>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── JOJO — sticker book ── */
  if (theme === "jojo") return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden px-4 pt-32 pb-20"
      style={{ background: "transparent" }}>
      <JojoStickerField />
      <div className="max-w-4xl mx-auto w-full text-center relative z-10 jo-font">
        <div className="jo-pop inline-block mb-8" style={{ animationDelay: ".05s" }}>
          <span className="jo-chip"><JojoSticker shape="star" size={20} /> {eyebrow}</span>
        </div>

        <h1 className="jo-pop text-[clamp(2.8rem,8vw,6rem)] leading-[1.05] tracking-tight mb-7"
          style={{ color: "var(--jo-ink)", fontWeight: 900, animationDelay: ".15s" }}>
          <TitleWords extra={<span className="inline-block ml-3 align-middle jo-bob"><JojoSticker shape="heart" size={50} /></span>} />
        </h1>

        <p className="jo-pop text-base sm:text-lg max-w-xl mx-auto mb-9 font-semibold"
          style={{ color: "var(--jo-sub)", animationDelay: ".28s" }}>
          {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
        </p>

        <div className="jo-pop flex flex-wrap items-center justify-center gap-4 mb-10" style={{ animationDelay: ".4s" }}>
          <Link href="/tours" className="jo-btn">
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={16} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="jo-btn-soft">
              WhatsApp
            </a>
          )}
        </div>

        <div className="jo-pop flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: ".52s" }}>
          <span className="jo-chip"><JojoSticker shape="cloud" size={18} /> {t("hero_subtitle", "Destinasi Pilihan")}</span>
          <span className="jo-chip"><JojoSticker shape="sparkle" size={18} /> Paket Lengkap</span>
          <span className="jo-chip"><JojoSticker shape="face" size={18} /> Terpercaya</span>
        </div>
      </div>
    </section>
  );

  /* ── ATELIER — clean editorial travel, hero carousel ── */
  if (theme === "atelier") return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* slides */}
      {atlSlides.length > 0 ? atlSlides.map((src, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === slide ? 1 : 0 }} aria-hidden={i !== slide}>
          <Image src={src} alt="" fill className="object-cover" priority={i === 0} sizes="100vw" />
        </div>
      )) : (
        <div className="absolute inset-0" style={{ background: "var(--atl-ink)" }} aria-hidden />
      )}

      {/* gradient overlay agar teks terbaca */}
      <div className="absolute inset-0" aria-hidden
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 48%, rgba(0,0,0,0.42) 100%)" }} />

      {/* konten */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col justify-end pb-24 lg:pb-28">
        <div className="max-w-3xl atl-fade">
          <p className="atl-eyebrow text-white/85 mb-5">{eyebrow}</p>
          <h1 className="text-white font-semibold leading-[1.06] tracking-tight mb-6 text-[clamp(2.6rem,6vw,5.2rem)]">
            {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
          </h1>
          <p className="text-white/85 text-base sm:text-lg max-w-xl mb-9 leading-relaxed">
            {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link href="/tours" className="atl-btn-solid">
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={16} />
            </Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="atl-btn-light">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* carousel controls */}
      {atlSlides.length > 1 && (
        <>
          <div className="absolute z-20 bottom-10 right-6 sm:right-10 lg:right-12 flex items-center gap-2.5">
            {atlSlides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
                className={`atl-dot ${i === slide ? "atl-dot-on" : ""}`} />
            ))}
          </div>
          <div className="absolute z-20 bottom-10 left-6 sm:left-10 lg:left-12 flex items-center gap-2">
            <button onClick={() => setSlide((s) => (s - 1 + atlSlides.length) % atlSlides.length)}
              aria-label="Sebelumnya"
              className="w-11 h-11 rounded-full flex items-center justify-center text-white border border-white/45 bg-white/10 backdrop-blur-sm hover:bg-white/25 transition">
              <ArrowRight size={17} className="rotate-180" />
            </button>
            <button onClick={() => setSlide((s) => (s + 1) % atlSlides.length)}
              aria-label="Berikutnya"
              className="w-11 h-11 rounded-full flex items-center justify-center text-white border border-white/45 bg-white/10 backdrop-blur-sm hover:bg-white/25 transition">
              <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}
    </section>
  );

  /* ── CLASSIC ── */
  return (
    <section className="min-h-screen flex flex-col justify-end pb-20 lg:pb-28 pt-32 overflow-hidden"
      style={{ background: "var(--site-bg, #ffffff)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full hero-fade-up">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-8"
          style={{ color: "var(--site-eyebrow,#6b7280)" }}>
          {eyebrow}
        </p>
        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[1.0] tracking-tight max-w-4xl mb-10"
          style={{ color: "var(--site-hero,#0d2018)" }}>
          <TitleWords />
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
