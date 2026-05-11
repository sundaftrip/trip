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

  const t = (key: string, fallback: string) => texts[key]?.[lang] || fallback;

  const items = [
    { title: t("why_1_title", "Terpercaya & Berpengalaman"), desc: t("why_1_desc", "Lebih dari 10 tahun melayani jamaah."), Icon: icons[0] },
    { title: t("why_2_title", "Pelayanan Penuh Kasih"), desc: t("why_2_desc", "Tim kami siap membantu 24/7."), Icon: icons[1] },
    { title: t("why_3_title", "Jadwal Fleksibel"), desc: t("why_3_desc", "Berbagai pilihan jadwal keberangkatan."), Icon: icons[2] },
    { title: t("why_4_title", "Bersertifikat Resmi"), desc: t("why_4_desc", "Terdaftar resmi dari instansi terkait."), Icon: icons[3] },
  ];

  const title = lang === "id" ? "Mengapa Kami?" : "Why Us?";
  const subtitle = lang === "id" ? "Komitmen kami pada setiap perjalanan." : "Our commitment on every journey.";

  /* ── TROPICAL ── */
  if (theme === "tropical") {
    const cardBgs = ["#d1fae5", "#dbeafe", "#fef3c7", "#fce7f3"];
    return (
      <section className="py-24" style={{ background: "#fffdf7" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
              <div>
                <span className="tr-pill mb-3 inline-flex" style={{ background: "#ede9fe" }}>🌟 Keunggulan Kami</span>
                <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "#1a1a1a" }}>{title}</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{subtitle}</p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(({ title, desc, Icon }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className="tr-card p-7 h-full" style={{ background: cardBgs[i] }}>
                  <p className="text-5xl font-black mb-3" style={{ color: "rgba(0,0,0,0.08)" }}>0{i + 1}</p>
                  <div className="w-11 h-11 rounded-2xl border-2 border-black flex items-center justify-center bg-white mb-4"
                    style={{ boxShadow: "2px 2px 0 0 #1a1a1a" }}>
                    <Icon size={20} style={{ color: "#1a1a1a" }} />
                  </div>
                  <h3 className="font-black text-sm leading-snug mb-2" style={{ color: "#1a1a1a" }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#4b5563" }}>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── CLASSIC ── */
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
