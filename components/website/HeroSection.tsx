"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1d4ed8 0%, transparent 50%)`
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="#f59e0b" className="text-amber-400" />)}
            </div>
            <span className="text-blue-300 text-sm font-medium">
              {t("hero_eyebrow", "Perjalanan Terpercaya")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-blue-100/80 mb-10 leading-relaxed max-w-xl">
            {t("hero_subtitle", "Paket wisata religi, umroh, haji, dan city tour terpercaya bersama CV Sundaf Holiday Group.")}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tours"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-2xl transition shadow-lg shadow-blue-500/25">
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={18} />
            </Link>
            <a href="https://wa.me/628111620207" target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 backdrop-blur-sm transition">
              💬 WhatsApp
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-14">
            {[
              { value: "500+", label: lang === "id" ? "Jamaah" : "Pilgrims" },
              { value: "50+", label: lang === "id" ? "Destinasi" : "Destinations" },
              { value: "10+", label: lang === "id" ? "Tahun Pengalaman" : "Years Experience" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-blue-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 40C1440 40 1080 0 720 0C360 0 0 40 0 40L0 80Z" className="fill-white dark:fill-slate-950" />
        </svg>
      </div>
    </section>
  );
}
