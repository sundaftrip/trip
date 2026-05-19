"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  waNumber?: string;
  companyName?: string;
  theme?: "classic" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas";
}

export default function HeroSection({ texts, waNumber, companyName, theme = "classic" }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

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
      <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-[1.55fr_1fr] gap-10 lg:gap-14 items-center">
        <div>
          <div className="mb-8 hero-fade-up">
            <span className="at-pill" style={{ color: "var(--at-text)" }}>
              {eyebrow}
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,6.4rem)] font-bold leading-[0.92] tracking-tight mb-10 hero-fade-up"
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

        <div className="hero-fade-up">
          <div className="relative aspect-[4/5] w-full"
            style={{
              maskImage:
                "radial-gradient(70% 64% at 50% 47%, #000 46%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(70% 64% at 50% 47%, #000 46%, transparent 100%)",
            }}>
            <Image src="/trip-photos/trip-5.jpg"
              alt="Aurora borealis bersama traveler Sundaf Trip di Murmansk, Rusia"
              fill priority sizes="(max-width:1024px) 100vw, 40vw"
              className="object-cover" />
          </div>
          <p className="mt-3 text-xs font-medium tracking-wide" style={{ color: "var(--at-subtext)" }}>
            Aurora Borealis · Murmansk, Rusia
          </p>
        </div>
      </div>
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
