"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  waNumber?: string;
  companyName?: string;
  theme?: "classic" | "vibrant" | "bold";
}

function useEntryAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);
  return mounted;
}

const fadeUp = (delay = 0, visible = true) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? "none" : "translateY(28px)",
  transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
});

export default function HeroSection({ texts, waNumber, companyName, theme = "classic" }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");
  const ready = useEntryAnimation();

  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

  const t = (key: string, fallback: string) => texts[key]?.[lang] || fallback;
  const eyebrow = companyName
    ? `${companyName} — ${t("hero_eyebrow", "Perjalanan Terpercaya")}`
    : t("hero_eyebrow", "Perjalanan Terpercaya");

  /* ── VIBRANT ── */
  if (theme === "vibrant") return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-32 overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--site-accent,#2d6a4f) 0%, color-mix(in srgb, var(--site-accent,#2d6a4f) 65%, #000) 100%)" }}>
      {/* decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 bg-white blur-3xl pointer-events-none" style={fadeUp(0, ready)} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 bg-white blur-2xl pointer-events-none" style={fadeUp(200, ready)} />
      <div className="max-w-3xl mx-auto relative z-10">
        <p className="text-xs font-medium tracking-[0.25em] uppercase mb-8 text-white/60" style={fadeUp(0, ready)}>{eyebrow}</p>
        <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-tight tracking-tight text-white mb-8" style={fadeUp(120, ready)}>
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>
        <p className="text-base text-white/65 max-w-md mx-auto leading-relaxed mb-12" style={fadeUp(220, ready)}>
          {t("hero_subtitle", "Paket wisata terpercaya dengan pelayanan terbaik.")}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap" style={fadeUp(320, ready)}>
          <Link href="/tours"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold rounded-2xl bg-white transition-all hover:bg-white/90 hover:scale-105 shadow-xl"
            style={{ color: "var(--site-accent,#2d6a4f)" }}>
            {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
          </Link>
          {waNumber && (
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
              className="text-sm font-medium text-white/70 hover:text-white transition underline underline-offset-4">
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );

  /* ── BOLD ── */
  if (theme === "bold") return (
    <section className="min-h-screen flex flex-col justify-center bg-gray-950 px-4 py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-12 text-gray-600" style={fadeUp(0, ready)}>{eyebrow}</p>
        <h1
          className="text-[clamp(3rem,9vw,8rem)] font-black leading-[0.92] tracking-tight text-white max-w-5xl mb-16"
          style={{ ...fadeUp(100, ready), color: undefined }}
        >
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-10 border-t border-gray-800" style={fadeUp(250, ready)}>
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

  /* ── CLASSIC (default) ── */
  return (
    <section className="min-h-screen flex flex-col justify-end bg-white dark:bg-black pb-20 lg:pb-28 pt-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-8" style={{ ...fadeUp(0, ready), color: "var(--site-eyebrow,#6b7280)" }}>
          {eyebrow}
        </p>
        <h1
          className="text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[1.0] tracking-tight max-w-4xl mb-10"
          style={{ ...fadeUp(120, ready), color: "var(--site-hero,#0d2018)" }}
        >
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-gray-100 dark:border-gray-900" style={fadeUp(250, ready)}>
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
