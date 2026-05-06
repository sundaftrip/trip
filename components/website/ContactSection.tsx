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
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t("contact_title", "Hubungi Kami")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
            </p>

            <div className="space-y-4">
              {[
                { Icon: MapPin, label: "Alamat", value: "Epiwalk Office Suite Lt. 5 Unit A501, Kuningan, Setiabudi, Jakarta Selatan" },
                { Icon: Phone, label: "Telepon", value: "021-22321146" },
                { Icon: MessageCircle, label: "WhatsApp", value: "+62 811 1620 207" },
                { Icon: Mail, label: "Email", value: "sundaf.group@gmail.com" },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment info */}
            <div className="mt-8 p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                {lang === "id" ? "Rekening Pembayaran" : "Payment Account"}
              </p>
              <p className="font-bold text-gray-900 dark:text-white">{bankName}</p>
              <p className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 my-1">{bankAcc}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">a/n {bankHolder}</p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
            <p className="text-blue-200 text-sm font-medium mb-3">
              {lang === "id" ? "Siap Berangkat?" : "Ready to Go?"}
            </p>
            <h3 className="text-2xl font-bold mb-4">
              {lang === "id" ? "Konsultasi Gratis via WhatsApp" : "Free Consultation via WhatsApp"}
            </h3>
            <p className="text-blue-100 text-sm mb-8">
              {lang === "id"
                ? "Tim kami siap membantu Anda memilih paket yang sesuai kebutuhan dan anggaran."
                : "Our team is ready to help you choose the right package for your needs and budget."}
            </p>
            <a href="https://wa.me/628111620207?text=Halo Sundaf Trip, saya ingin konsultasi paket tour"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition">
              <MessageCircle size={20} /> WhatsApp Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
