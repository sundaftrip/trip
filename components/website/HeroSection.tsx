"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
}

export default function HeroSection({ texts }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");
  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

  const t = (key: string, fallback: string) => texts[key]?.[lang] || fallback;

  return (
    <section className="min-h-screen flex flex-col justify-end bg-white dark:bg-black pb-20 lg:pb-28 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Eyebrow */}
        <p className="text-xs font-medium tracking-[0.2em] uppercase mb-8 text-gray-400 dark:text-gray-600">
          CV Sundaf Holiday Group — {t("hero_eyebrow", "Perjalanan Terpercaya")}
        </p>

        {/* Main headline */}
        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-bold leading-[1.0] tracking-tight text-gray-900 dark:text-white max-w-4xl mb-10">
          {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
        </h1>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-8 border-t border-gray-100 dark:border-gray-900">
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
            {t("hero_subtitle", "Paket wisata religi, umroh, haji, dan city tour terpercaya.")}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ background: "#2d6a4f" }}>
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={15} />
            </Link>
            <a href="https://wa.me/628111620207" target="_blank" rel="noreferrer"
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-4">
              WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
