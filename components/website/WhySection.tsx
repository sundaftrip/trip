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
    { title: t("why_1_title", "Terpercaya & Berpengalaman"), desc: t("why_1_desc", "Lebih dari 10 tahun melayani jamaah dengan standar terbaik."), Icon: icons[0] },
    { title: t("why_2_title", "Pelayanan Penuh Kasih"), desc: t("why_2_desc", "Tim kami siap membantu 24/7 selama perjalanan Anda."), Icon: icons[1] },
    { title: t("why_3_title", "Jadwal Fleksibel"), desc: t("why_3_desc", "Berbagai pilihan jadwal keberangkatan sesuai kebutuhan Anda."), Icon: icons[2] },
    { title: t("why_4_title", "Bersertifikat Resmi"), desc: t("why_4_desc", "Terdaftar dan berizin resmi dari Kementerian Agama RI."), Icon: icons[3] },
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {lang === "id" ? "Mengapa Memilih Kami?" : "Why Choose Us?"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            {lang === "id"
              ? "Kami berkomitmen memberikan pengalaman perjalanan yang tak terlupakan"
              : "We are committed to providing unforgettable travel experiences"}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ title, desc, Icon }) => (
            <div key={title} className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition">
                <Icon size={22} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
