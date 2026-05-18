"use client";

import { useState, useEffect } from "react";
import { Shield, Heart, Clock, Award } from "lucide-react";
import AnimateIn from "./AnimateIn";

const icons = [Shield, Heart, Clock, Award];

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  theme?: string;
}

export default function WhySection({ texts, theme = "classic" }: Props) {
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

  const items = [
    { title: t("why_1_title", "Terpercaya & Berpengalaman"), desc: t("why_1_desc", "Lebih dari 10 tahun melayani jamaah."), Icon: icons[0] },
    { title: t("why_2_title", "Pelayanan Penuh Kasih"), desc: t("why_2_desc", "Tim kami siap membantu 24/7."), Icon: icons[1] },
    { title: t("why_3_title", "Jadwal Fleksibel"), desc: t("why_3_desc", "Berbagai pilihan jadwal keberangkatan."), Icon: icons[2] },
    { title: t("why_4_title", "Bersertifikat Resmi"), desc: t("why_4_desc", "Terdaftar resmi dari instansi terkait."), Icon: icons[3] },
  ];

  const title = lang === "id" ? "Mengapa Kami?" : "Why Us?";
  const subtitle = lang === "id" ? "Komitmen kami pada setiap perjalanan." : "Our commitment on every journey.";

  /* ── GLOBE ── */
  if (theme === "globe") {
    const cardBgs = ["var(--gl-sky)", "var(--gl-amber)", "var(--gl-coral)", "var(--gl-grass)"];
    const cardFgs = ["var(--gl-on-sky)", "var(--gl-on-amber)", "var(--gl-on-coral)", "var(--gl-on-grass)"];
    return (
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--gl-bg)" }}>
        <span className="absolute bottom-8 right-6 text-5xl pointer-events-none select-none gl-float-2" style={{ opacity: 0.1 }}>🏰</span>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-coral)", color: "var(--gl-on-coral)", borderColor: "transparent" }}>🏆 Keunggulan Kami</span>
                <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--gl-text)" }}>{title}</h2>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--gl-subtext)" }}>{subtitle}</p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(({ title, desc, Icon }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className="gl-card p-7 h-full" style={{ background: cardBgs[i] }}>
                  <p className="text-5xl font-black mb-3" style={{ color: "rgba(0,0,0,0.08)" }}>0{i + 1}</p>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "rgba(255,255,255,0.7)", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
                    <Icon size={20} style={{ color: "#1a2a3a" }} />
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2" style={{ color: cardFgs[i] }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: cardFgs[i], opacity: 0.85 }}>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section className="py-24 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <div>
              <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Keunggulan Kami</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--at-text)" }}>{title}</h2>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--at-subtext)" }}>{subtitle}</p>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ title, desc, Icon }, i) => (
            <AnimateIn key={title} delay={i * 100}>
              <div className="at-card p-7 h-full">
                <p className="text-5xl font-bold mb-3" style={{ color: "var(--at-muted)" }}>0{i + 1}</p>
                <div className="w-11 h-11 border flex items-center justify-center mb-4"
                  style={{ background: "var(--at-muted)", borderColor: "var(--at-border)" }}>
                  <Icon size={20} style={{ color: "var(--at-text)" }} />
                </div>
                <h3 className="font-semibold text-sm leading-snug mb-2" style={{ color: "var(--at-text)" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--at-subtext)" }}>{desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── MAP / ATLAS ── */
  if (theme === "map") {
    const cardBgs = ["var(--mp-water)", "var(--mp-land)", "var(--mp-rust)", "var(--mp-accent)"];
    const cardFgs = ["var(--mp-on-water)", "var(--mp-text)", "var(--mp-on-rust)", "var(--mp-on-accent)"];
    return (
      <section className="py-24 relative overflow-hidden"
        style={{ background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="mp-pill mb-3 inline-flex" style={{ background: "var(--mp-rust)", color: "var(--mp-on-rust)", borderColor: "var(--mp-border)" }}>Keunggulan Kami</span>
                <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>{title}</h2>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--mp-subtext)" }}>{subtitle}</p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(({ title, desc, Icon }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className="mp-card p-7 h-full" style={{ background: cardBgs[i] }}>
                  <p className="text-5xl font-black mb-3" style={{ color: "rgba(0,0,0,0.08)" }}>0{i + 1}</p>
                  <div className="w-11 h-11 border-2 flex items-center justify-center mb-4"
                    style={{ background: "var(--mp-card)", borderColor: "var(--mp-border)", boxShadow: "2px 2px 0 0 var(--mp-border)" }}>
                    <Icon size={20} style={{ color: "var(--mp-ink)" }} />
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2" style={{ color: cardFgs[i] }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: cardFgs[i], opacity: 0.85 }}>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── PIXEL ── */
  if (theme === "pixel") {
    const pixelBgs = ["var(--px-red)", "var(--px-yellow)", "var(--px-cyan)", "var(--px-purple)"];
    const pixelFgs = ["#ffffff", "var(--px-text)", "var(--px-text)", "#ffffff"];
    return (
      <section className="py-24 relative" style={{
        background: "var(--px-bg)",
        backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
        backgroundSize: "24px 24px",
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-purple)", color: "#ffffff" }}>► KEUNGGULAN</span>
                <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>{title}</h2>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{subtitle}</p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(({ title, desc, Icon }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className="px-card p-7 h-full" style={{ background: pixelBgs[i] }}>
                  <p className="text-4xl font-black mb-3" style={{ color: "rgba(0,0,0,0.12)", fontFamily: "monospace" }}>0{i + 1}</p>
                  <div className="w-11 h-11 border-2 flex items-center justify-center mb-4"
                    style={{ background: "var(--px-card)", borderColor: "var(--px-border)", boxShadow: "2px 2px 0 0 var(--px-shadow)" }}>
                    <Icon size={20} style={{ color: pixelBgs[i] }} />
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2" style={{ color: pixelFgs[i] }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: pixelFgs[i], opacity: 0.8 }}>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── KAWAII ── */
  if (theme === "kawaii") {
    const cardBgs = ["var(--kw-peach)", "var(--kw-sky)", "var(--kw-mint)", "var(--kw-blush)"];
    return (
      <section className="py-24" style={{ background: "var(--kw-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>✦ Keunggulan Kami</span>
                <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--kw-text)" }}>{title}</h2>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--kw-subtext)" }}>{subtitle}</p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(({ title, desc, Icon }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className="kw-card p-7 h-full" style={{ background: cardBgs[i] }}>
                  <p className="text-5xl font-black mb-3" style={{ color: "rgba(0,0,0,0.06)" }}>0{i + 1}</p>
                  <div className="w-11 h-11 rounded-2xl border-2 flex items-center justify-center mb-4"
                    style={{ background: "var(--kw-card)", borderColor: "var(--kw-border)", boxShadow: "2px 2px 0 0 var(--kw-shadow)" }}>
                    <Icon size={20} style={{ color: "var(--kw-border)" }} />
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2" style={{ color: "var(--kw-text)" }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--kw-subtext)" }}>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── TROPICAL ── */
  if (theme === "tropical") {
    const cardBgs = ["var(--tr-mint)", "var(--tr-sky)", "var(--tr-sun)", "var(--tr-pink)"];
    return (
      <section className="py-24" style={{ background: "var(--tr-bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-grape)", color: "var(--tr-text)" }}>🌟 Keunggulan Kami</span>
                <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--tr-text)" }}>{title}</h2>
              </div>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--tr-subtext)" }}>{subtitle}</p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(({ title, desc, Icon }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className="tr-card p-7 h-full" style={{ background: cardBgs[i] }}>
                  <p className="text-5xl font-black mb-3" style={{ color: "rgba(0,0,0,0.08)" }}>0{i + 1}</p>
                  <div className="w-11 h-11 rounded-2xl border-2 flex items-center justify-center mb-4"
                    style={{ background: "var(--tr-card)", borderColor: "var(--tr-border)", boxShadow: "2px 2px 0 0 var(--tr-shadow)" }}>
                    <Icon size={20} style={{ color: "var(--tr-text)" }} />
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2" style={{ color: "var(--tr-text)" }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--tr-subtext)" }}>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── CLASSIC ── */
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">{subtitle}</p>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden">
          {items.map(({ title, desc, Icon }, i) => (
            <AnimateIn key={title} delay={i * 100}>
              <div className="bg-white dark:bg-black p-8 h-full">
                <p className="text-xs text-gray-300 dark:text-gray-700 font-mono mb-6">0{i + 1}</p>
                <Icon size={20} style={{ color: "var(--site-accent,#2d6a4f)" }} className="mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm leading-snug">{title}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

}
