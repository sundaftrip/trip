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

export default function HeroSection({ texts, waNumber, companyName, theme = "classic" }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");
  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

  const t = (key: string, fallback: string) => texts[key]?.[lang] || fallback;
  const eyebrow = companyName
    ? `${companyName} — ${t("hero_eyebrow", "Perjalanan Terpercaya")}`
    : t("hero_eyebrow", "Perjalanan Terpercaya");

  if (theme === "vibrant") {
    return (
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-32"
        style={{
          background:
            "linear-gradient(135deg, var(--site-accent, #2d6a4f) 0%, color-mix(in srgb, var(--site-accent, #2d6a4f) 70%, #000) 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-6 text-white/70">{eyebrow}</p>
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-tight tracking-tight text-white mb-8">
            {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
          </h1>
          <p className="text-base text-white/70 max-w-md mx-auto leading-relaxed mb-10">
            {t("hero_subtitle", "Paket wisata religi, umroh, haji, dan city tour terpercaya.")}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl bg-white transition-all hover:bg-white/90"
              style={{ color: "var(--site-accent, #2d6a4f)" }}
            >
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
            </Link>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-white/80 hover:text-white transition underline underline-offset-4"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (theme === "bold") {
    return (
      <section className="min-h-screen flex flex-col justify-center bg-gray-950 px-4 py-32">
        <div className="max-w-7xl mx-auto w-full">
          <p className="text-xs font-medium tracking-[0.2em] uppercase mb-10 text-gray-500">{eyebrow}</p>
          <h1 className="text-[clamp(3rem,9vw,8rem)] font-black leading-[0.95] tracking-tight text-white max-w-5xl mb-12">
            {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-gray-800">
            <p className="text-base text-gray-400 max-w-sm leading-relaxed">
              {t("hero_subtitle", "Paket wisata religi, umroh, haji, dan city tour terpercaya.")}
            </p>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all border border-white/20 hover:border-white/60"
                style={{ background: "var(--site-accent, #2d6a4f)" }}
              >
                {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
              </Link>
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-gray-500 hover:text-white transition underline underline-offset-4"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // classic (default)
  return (
    <section className="min-h-screen flex flex-col justify-end bg-white dark:bg-black pb-20 lg:pb-28 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-8" style={{ color: "var(--site-eyebrow, #6b7280)" }}>
          {eyebrow}
        </p>

        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[1.0] tracking-tight max-w-4xl mb-10" style={{ color: "var(--site-hero, #0d2018)" }}>
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-gray-100 dark:border-gray-900">
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            {t("hero_subtitle", "Paket wisata religi, umroh, haji, dan city tour terpercaya.")}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ background: "var(--site-accent, #2d6a4f)" }}>
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
