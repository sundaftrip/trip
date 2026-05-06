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
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#0d2018" }}>
      {/* Green glow accents */}
      <div className="absolute top-1/3 right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,106,79,0.25) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(82,160,130,0.12) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:pt-36 w-full">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{ border: "1px solid rgba(82,160,130,0.3)", background: "rgba(30,77,56,0.4)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#52a082" }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#7abea4" }}>
              {t("hero_eyebrow", "Perjalanan Terpercaya")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6" style={{ color: "#ffffff" }}>
            {t("hero_title", "Wujudkan Perjalanan Impian Anda")}
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-relaxed max-w-lg mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>
            {t("hero_subtitle", "Paket wisata religi, umroh, haji, dan city tour terpercaya bersama CV Sundaf Holiday Group.")}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/tours"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-xl transition-all duration-200"
              style={{ background: "#2d6a4f", color: "#ffffff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#3a8567")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2d6a4f")}>
              {t("hero_btn", "Lihat Paket Tour")} <ArrowRight size={17} />
            </Link>
            <a href="https://wa.me/628111620207" target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-xl transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.06)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.12)" }}>
              WhatsApp Kami
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-10 mt-16 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { value: "500+", label: lang === "id" ? "Jamaah" : "Pilgrims" },
              { value: "50+", label: lang === "id" ? "Destinasi" : "Destinations" },
              { value: "10+", label: lang === "id" ? "Tahun Pengalaman" : "Years of Experience" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold" style={{ color: "#ffffff" }}>{stat.value}</p>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }} />
    </section>
  );
}
