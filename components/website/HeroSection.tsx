"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  waNumber?: string;
  companyName?: string;
  theme?: "classic" | "vibrant" | "bold" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "atelier" | "jojo" | "teri" | "attic" | "nusantara";
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

  /* Render tiap kata sebagai block. Huruf pertama (akronim S-U-N-D-A-F)
     tetap berdiri & warna asal; sisa kata di belakangnya rontok fisika. */
  const FALL_PHYSICS = [
    { dx: "-118px", rot: "-684deg" },
    { dx: "104px",  rot: "548deg"  },
    { dx: "-72px",  rot: "-912deg" },
    { dx: "136px",  rot: "742deg"  },
    { dx: "-128px", rot: "-596deg" },
    { dx: "88px",   rot: "868deg"  },
  ];
  const TitleWords = ({ extra }: { extra?: React.ReactNode }) => {
    let g = 0; // indeks huruf global — stagger tiap huruf rontok
    return (
      <>
        {t("hero_title", "Wujudkan Perjalanan Impian Anda")
          .split(/\s+/).filter(Boolean)
          .map((word, i) => (
            <span key={i} className="block">
              {word.charAt(0)}
              {word.slice(1).split("").map((ch, j) => {
                const gi = g++;
                const p = FALL_PHYSICS[gi % FALL_PHYSICS.length];
                return (
                  <span key={j} className="sundaf-fall"
                    style={{ ["--n" as string]: gi, ["--dx" as string]: p.dx, ["--rot" as string]: p.rot }}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        {extra}
      </>
    );
  };

  /* ── Y2K KAWAII (attic) — area 3-kolom ala situs 2000-an ── */
  if (theme === "attic") {
    const aHero = featuredImage ?? heroImages[0] ?? null;
    return (
      <section className="atc-font grid grid-cols-1 md:grid-cols-[0.9fr_1.5fr_1fr] gap-3 sm:gap-4">
        {/* kiri — widget profil */}
        <div className="atc-box p-4 flex flex-col items-center text-center gap-3">
          <span className="atc-pill">♡ Hello!</span>
          <div className="overflow-hidden rounded-md w-full" style={{ border: "1.5px solid var(--atc-border)", aspectRatio: "1" }}>
            {aHero
              ? <Image src={aHero} alt="" width={260} height={260} className="w-full h-full object-cover" priority />
              : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: "var(--atc-pink-soft)" }}>🧸</div>}
          </div>
          <p className="text-xs font-semibold" style={{ color: "var(--atc-ink-soft)" }}>have a nice trip ~ ♪</p>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="atc-btn w-full">Guestbook ✎</a>
          )}
        </div>
        {/* tengah — welcome (semua teks editable via CMS → Teks Website) */}
        <div className="atc-box p-5 flex flex-col">
          <h2 className="atc-title text-2xl">{t("hero_title", "Welcome! ✦")}</h2>
          <hr className="atc-divider" />
          <p className="text-sm leading-relaxed flex-1 whitespace-pre-line" style={{ color: "var(--atc-ink)" }}>
            {t("hero_welcome", `Assalamualaikum! Selamat datang di ${companyName || "Sundaf Trip"} ✈️🕌 — teman perjalanan Anda menjelajah Rusia, ramah Muslim, hangat, dan berkesan. Yuk jelajahi katalog tour kami!`)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/tours" className="atc-btn">{t("hero_btn", "Lihat Katalog")} →</Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="atc-btn"
                style={{ background: "var(--atc-mint)", color: "var(--atc-ink)" }}>WhatsApp</a>
            )}
          </div>
        </div>
        {/* kanan — updates */}
        <div className="atc-box p-4">
          <h2 className="atc-title text-lg">{t("hero_updates_title", "Updates ✿")}</h2>
          <hr className="atc-divider" />
          <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--atc-ink)" }}>
            {t("hero_updates", "Baru! Paket Russia, Aurora & Asia Tengah tersedia. Hubungi kami untuk jadwal & harga terkini.")}
          </p>
          <div className="mt-3 flex gap-1.5 text-base select-none">✿ ✦ ♡ ✦ ✿</div>
        </div>
      </section>
    );
  }

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
    <section className="lg:min-h-screen flex flex-col justify-center relative overflow-hidden pt-24 lg:pt-28 pb-20 px-4 at-grid-bg"
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
  if (theme === "jojo") {
    const joHero = featuredImage ?? heroImages[0] ?? null;
    return (
      <section className="relative overflow-hidden px-4 pt-32 pb-20 lg:pb-24">
        {/* ikon dekoratif sudut */}
        <span className="jo-deco text-[2.1rem] hidden sm:block" style={{ top: "17%", left: "8%", transform: "rotate(-14deg)" }}>🧳</span>
        <span className="jo-deco text-[2.1rem] hidden sm:block" style={{ top: "21%", right: "9%", transform: "rotate(13deg)" }}>🕌</span>
        <span className="jo-deco text-[1.7rem]" style={{ bottom: "19%", left: "11%", transform: "rotate(9deg)" }}>🪆</span>
        <span className="jo-deco text-[1.7rem]" style={{ bottom: "15%", right: "12%", transform: "rotate(-11deg)" }}>✈️</span>

        <div className="max-w-3xl mx-auto w-full text-center relative z-10 jo-font">
          <div className="jo-pop inline-block mb-7" style={{ animationDelay: ".05s" }}>
            <div className="jo-bob mx-auto rounded-full overflow-hidden"
              style={{ width: 168, height: 168, border: "5px solid var(--jo-card)",
                boxShadow: "0 0 0 4px var(--jo-peach-outer), 0 0 0 7px var(--jo-line), 0 14px 30px var(--jo-shadow)" }}>
              {joHero
                ? <Image src={joHero} alt="" width={336} height={336} className="w-full h-full object-cover" priority />
                : <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "var(--jo-peach)" }}>✈️</div>}
            </div>
          </div>

          <div className="jo-pop mb-5" style={{ animationDelay: ".12s" }}>
            <span className="jo-chip">🌙 {eyebrow}</span>
          </div>

          <h1 className="jo-pop jo-head text-[clamp(1.9rem,5vw,3.2rem)] leading-[1.2] mb-4"
            style={{ color: "var(--jo-navy)", animationDelay: ".18s" }}>
            Assalamualaikum! Selamat datang di{" "}
            <span style={{ color: "var(--jo-accent-on)" }}>{companyName || "Sundaf Trip"}</span> ✈️🕌
          </h1>

          <p className="jo-pop text-base sm:text-lg max-w-xl mx-auto mb-9"
            style={{ color: "var(--jo-sub)", animationDelay: ".26s" }}>
            {t("hero_subtitle", "Teman perjalanan Anda menjelajah Rusia — ramah Muslim, hangat, dan berkesan.")}
          </p>

          <div className="jo-pop flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: ".34s" }}>
            <Link href="/tours" className="jo-btn">{t("hero_btn", "Lihat Katalog")} <ArrowRight size={16} /></Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="jo-btn-soft">WhatsApp</a>
            )}
          </div>
        </div>
      </section>
    );
  }

  /* ── TERI — honeycomb, shadow warni-warni, tepi tombol bergerigi ── */
  if (theme === "teri") {
    const hex = "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)";
    return (
      <section className="lg:min-h-screen flex flex-col justify-center relative overflow-hidden px-4 pt-32 pb-20">
        {/* hexagon mengambang warna-warni */}
        <div className="absolute pointer-events-none hidden sm:block" style={{ top: "15%", right: "12%", width: 76, height: 84, background: "var(--teri-c1)", clipPath: hex }} />
        <div className="absolute pointer-events-none" style={{ top: "24%", left: "9%", width: 46, height: 52, background: "var(--teri-c2)", clipPath: hex }} />
        <div className="absolute pointer-events-none hidden sm:block" style={{ bottom: "16%", right: "19%", width: 38, height: 42, background: "var(--teri-c3)", clipPath: hex }} />
        <div className="absolute pointer-events-none" style={{ bottom: "21%", left: "15%", width: 58, height: 64, background: "var(--teri-c4)", clipPath: hex }} />

        <div className="max-w-4xl mx-auto w-full text-center relative z-10">
          <div className="hero-fade-up mb-8">
            <span className="teri-pill">✦ {eyebrow}</span>
          </div>
          <h1 className="hero-fade-up text-[clamp(2.8rem,8vw,6.4rem)] font-black leading-[1.02] tracking-tight mb-7"
            style={{ color: "var(--teri-ink)" }}>
            <TitleWords />
          </h1>
          <p className="hero-fade-up text-base sm:text-lg max-w-xl mx-auto mb-9 font-semibold"
            style={{ color: "var(--teri-sub)" }}>
            {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
          </p>
          <div className="hero-fade-up flex flex-wrap items-center justify-center gap-5 mb-10">
            <Link href="/tours" className="teri-btn">
              Lihat Tour <ArrowRight size={16} />
            </Link>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="teri-btn-ghost">
                WhatsApp
              </a>
            )}
          </div>
          <div className="hero-fade-up flex flex-wrap items-center justify-center gap-3">
            <span className="teri-chip">{t("hero_subtitle", "Destinasi Pilihan")}</span>
            <span className="teri-chip">Paket Lengkap</span>
            <span className="teri-chip">Terpercaya</span>
          </div>
        </div>
      </section>
    );
  }

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

  /* ── NUSANTARA ── */
  if (theme === "nusantara") {
    const heroImage = texts["hero_image"]?.id || featuredImage || heroImages[0] || "/hero-bali.jpg";
    return (
      <section className="nu-page nu-hero">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <div className="grid md:grid-cols-[1fr_1fr] gap-8 items-center pt-6 pb-12">
            <div className="hero-fade-up">
              <p className="nu-eyebrow mb-5">{eyebrow}</p>
              <h1 className="nu-display text-[clamp(2.4rem,5.5vw,3.6rem)] mb-5" style={{ color: "var(--nu-navy)" }}>
                {t("hero_title", "Perjalanan Nyaman,")}<br />
                <span style={{ color: "var(--nu-navy-soft)" }}>{t("hero_title_2", "Kenangan Tak Terlupakan")}</span>
              </h1>
              <p className="text-[15px] leading-relaxed mb-7 max-w-md" style={{ color: "var(--nu-muted)" }}>
                {t("hero_subtitle", "Nikmati pengalaman wisata terbaik bersama kami dengan pelayanan yang hangat dan terpercaya.")}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="#tours" className="nu-btn-gold">
                  {t("hero_btn", "Lihat Paket Wisata")} <ArrowRight size={15} />
                </Link>
                {waNumber && (
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="nu-btn-ghost">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
            <div className="nu-hero-art aspect-[5/4] md:aspect-[5/5] hero-fade-up">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="" loading="eager" />
            </div>
          </div>
        </div>
      </section>
    );
  }

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
