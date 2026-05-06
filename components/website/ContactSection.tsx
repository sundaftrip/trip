"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
}

export default function ContactSection({ texts }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");
  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

  const t = (key: string, fallback: string) => texts[key]?.[lang] || fallback;
  const bankName = texts["payment_bank_name"]?.id || "BCA";
  const bankAcc = texts["payment_bank_acc"]?.id || "-";
  const bankHolder = texts["payment_bank_holder"]?.id || "CV SUNDAF HOLIDAY GROUP";

  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Info */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2d6a4f" }}>
              {lang === "id" ? "Hubungi Kami" : "Contact Us"}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t("contact_title", "Siap Membantu Anda")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10">
              {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
            </p>

            <div className="space-y-5">
              {[
                { Icon: MapPin, label: "Alamat", value: "Epiwalk Office Suite Lt. 5 Unit A501, Kuningan, Jakarta Selatan" },
                { Icon: Phone, label: "Telepon", value: "021-22321146" },
                { Icon: MessageCircle, label: "WhatsApp", value: "+62 811 1620 207" },
                { Icon: Mail, label: "Email", value: "sundaf.group@gmail.com" },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(45,106,79,0.1)" }}>
                    <Icon size={17} style={{ color: "#2d6a4f" }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment */}
            <div className="mt-10 p-5 rounded-2xl border" style={{ borderColor: "rgba(45,106,79,0.2)", background: "rgba(45,106,79,0.04)" }}>
              <p className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: "#2d6a4f" }}>
                {lang === "id" ? "Rekening Pembayaran" : "Payment Account"}
              </p>
              <p className="font-bold text-gray-900 dark:text-white">{bankName}</p>
              <p className="text-xl font-mono font-bold my-1" style={{ color: "#2d6a4f" }}>{bankAcc}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">a/n {bankHolder}</p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="rounded-3xl p-10 text-white" style={{ background: "linear-gradient(135deg, #1e4d38 0%, #0d2018 100%)" }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#7abea4" }}>
              {lang === "id" ? "Siap Berangkat?" : "Ready to Go?"}
            </p>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-snug">
              {lang === "id" ? "Konsultasi Gratis via WhatsApp" : "Free Consultation via WhatsApp"}
            </h3>
            <p className="text-sm mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {lang === "id"
                ? "Tim kami siap membantu Anda memilih paket yang sesuai kebutuhan dan anggaran."
                : "Our team is ready to help you choose the right package for your needs and budget."}
            </p>
            <a href="https://wa.me/628111620207?text=Halo Sundaf Trip, saya ingin konsultasi paket tour"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 font-bold rounded-xl transition-all duration-200"
              style={{ background: "#ffffff", color: "#1e4d38" }}>
              <MessageCircle size={18} />
              WhatsApp Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
