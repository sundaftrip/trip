"use client";

import { useState, useEffect } from "react";
import { Shield, Heart, Clock, Award } from "lucide-react";
import AnimateIn from "./AnimateIn";
import { JojoSticker, type JojoShape } from "./JojoStickers";

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

  /* ── NUSANTARA ── */
  if (theme === "nusantara") {
    return (
      <section className="nu-page py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <AnimateIn>
            <h2 className="nu-section-title">{title}</h2>
            <p className="nu-section-sub mb-8">{subtitle}</p>
          </AnimateIn>
          <AnimateIn>
            <div className="nu-card overflow-hidden">
              {items.map(({ title, desc, Icon }) => (
                <div key={title} className="nu-row">
                  <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--nu-cream)", border: "1px solid var(--nu-line)" }}>
                    <Icon size={17} style={{ color: "var(--nu-gold)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="nu-display text-[18px] leading-tight" style={{ color: "var(--nu-navy)" }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--nu-muted)" }}>{desc}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--nu-gold)" }} className="shrink-0">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>
    );
  }

  /* ── Y2K KAWAII (attic) ── */
  if (theme === "attic") {
    return (
      <section className="atc-box atc-font p-4 sm:p-5">
        <h2 className="atc-title text-xl">{title} ♡</h2>
        <hr className="atc-divider" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(({ title, desc, Icon }) => (
            <div key={title} className="atc-box p-3 flex gap-3 items-start" style={{ background: "var(--atc-pink-soft)" }}>
              <div className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center"
                style={{ background: "var(--atc-card)", border: "1.5px solid var(--atc-border)" }}>
                <Icon size={17} style={{ color: "var(--atc-pink-deep)" }} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm" style={{ color: "var(--atc-ink)" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--atc-ink-soft)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ── GLOBE ── */
  if (theme === "teri") {
    const accents = ["var(--teri-c1)", "var(--teri-c2)", "var(--teri-c3)", "var(--teri-c4)"];
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="text-center mb-16">
              <span className="teri-pill mb-3 inline-flex">✦ Keunggulan Kami</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--teri-ink)" }}>{title}</h2>
              <p className="text-sm max-w-md mx-auto leading-relaxed mt-3" style={{ color: "var(--teri-sub)" }}>{subtitle}</p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {items.map(({ title, desc, Icon }, i) => (
              <AnimateIn key={title} delay={i * 100} className="h-full">
                <div className="teri-card h-full p-7">
                  <div className="w-14 h-14 flex items-center justify-center mb-4"
                    style={{ background: accents[i % 4], clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}>
                    <Icon size={22} style={{ color: "var(--teri-on-accent)" }} />
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2" style={{ color: "var(--teri-ink)" }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--teri-sub)" }}>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
  if (theme === "jojo") {
    const joShapes: JojoShape[] = ["star", "heart", "cloud", "sparkle"];
    return (
    <section className="py-24 jo-font" style={{ background: "transparent" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="text-center mb-14">
            <span className="jo-chip mb-4 inline-flex"><JojoSticker shape="sparkle" size={18} /> {subtitle}</span>
            <h2 className="text-3xl lg:text-5xl mt-2" style={{ color: "var(--jo-ink)", fontWeight: 900 }}>{title}</h2>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ title, desc }, i) => (
            <AnimateIn key={title} delay={i * 100}>
              <div className="jo-card p-6 h-full text-center">
                <div className="flex justify-center mb-4"><JojoSticker shape={joShapes[i % 4]} size={58} /></div>
                <h3 className="font-extrabold mb-2 text-[15px]" style={{ color: "var(--jo-ink)" }}>{title}</h3>
                <p className="text-xs font-semibold leading-relaxed" style={{ color: "var(--jo-sub)" }}>{desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
    );
  }

  if (theme === "atelier") return (
    <section className="py-24" style={{ background: "var(--atl-bg)" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <AnimateIn>
          <div className="max-w-2xl mb-14">
            <p className="atl-eyebrow mb-3">{subtitle}</p>
            <h2 className="text-3xl lg:text-[2.6rem] font-semibold tracking-tight" style={{ color: "var(--atl-ink)" }}>{title}</h2>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ title, desc, Icon }, i) => (
            <AnimateIn key={title} delay={i * 100}>
              <div className="atl-card p-6 h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "var(--atl-soft)" }}>
                  <Icon size={20} style={{ color: "var(--atl-accent)" }} />
                </div>
                <h3 className="font-semibold text-[15px] mb-2" style={{ color: "var(--atl-ink)" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--atl-sub)" }}>{desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  if (theme === "classic") return (
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

  /* ── VIBRANT ── */
  if (theme === "vibrant") return (
    <section className="py-24" style={{ background: "var(--site-accent,#2d6a4f)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">{title}</h2>
            <p className="text-white/60 text-sm">{subtitle}</p>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ title, desc, Icon }, i) => (
            <AnimateIn key={title} delay={i * 100}>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-7 border border-white/20 hover:bg-white/20 transition-colors duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm leading-snug">{title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── BOLD ── */
  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-20">{title}</h2>
        </AnimateIn>
        <div className="space-y-0 divide-y divide-gray-800">
          {items.map(({ title, desc, Icon }, i) => (
            <AnimateIn key={title} delay={i * 80} direction="left">
              <div className="flex items-start gap-8 py-8 group hover:bg-gray-900 px-4 -mx-4 rounded-xl transition-colors duration-300">
                <span className="text-4xl font-black text-gray-700 w-12 shrink-0 group-hover:text-white transition-colors duration-300">0{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={18} style={{ color: "var(--site-accent,#2d6a4f)" }} />
                    <h3 className="font-bold text-white text-base">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xl">{desc}</p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
