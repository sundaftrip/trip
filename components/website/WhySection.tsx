"use client";

import { useState, useEffect } from "react";
import { Shield, Heart, Clock, Award } from "lucide-react";

const icons = [Shield, Heart, Clock, Award];

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
}

export default function WhySection({ texts }: Props) {
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
    { title: t("why_4_title", "Bersertifikat Resmi"), desc: t("why_4_desc", "Terdaftar resmi dari Kemenag RI."), Icon: icons[3] },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {lang === "id" ? "Mengapa Kami?" : "Why Us?"}
          </h2>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            {lang === "id" ? "Komitmen kami pada setiap perjalanan." : "Our commitment on every journey."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden">
          {items.map(({ title, desc, Icon }, i) => (
            <div key={title} className="bg-white dark:bg-black p-8">
              <p className="text-xs text-gray-300 dark:text-gray-700 font-mono mb-6">0{i + 1}</p>
              <Icon size={20} style={{ color: "#2d6a4f" }} className="mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm leading-snug">{title}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
