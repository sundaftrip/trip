"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

interface Props {
  texts: Record<string, { id?: string; en?: string }>;
  company: Record<string, string>;
}

export default function ContactSection({ texts, company }: Props) {
  const [lang, setLang] = useState<"id" | "en">("id");
  useEffect(() => {
    const stored = localStorage.getItem("lang") as "id" | "en" | null;
    if (stored) setLang(stored);
  }, []);

  const t = (key: string, fallback: string) => texts[key]?.[lang] || fallback;
  const bankName = texts["payment_bank_name"]?.id || "";
  const bankAcc = texts["payment_bank_acc"]?.id || "";
  const bankHolder = texts["payment_bank_holder"]?.id || "";

  const wa = company["company_whatsapp"] || "";
  const email = company["company_email"] || "";
  const phone = company["company_phone"] || "";
  const address = company["company_address"] || "";

  const contacts = [
    address && { Icon: MapPin, label: "Alamat", value: address },
    phone && { Icon: Phone, label: "Telepon", value: phone },
    wa && { Icon: MessageCircle, label: "WhatsApp", value: wa.startsWith("62") ? `+${wa}` : wa },
    email && { Icon: Mail, label: "Email", value: email },
  ].filter(Boolean) as { Icon: typeof MapPin; label: string; value: string }[];

  const waMsg = encodeURIComponent(lang === "id" ? "Halo, saya ingin konsultasi paket tour" : "Hello, I'd like to inquire about tour packages");

  return (
    <section id="contact" className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-16 max-w-xl">
          <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-4">
            {lang === "id" ? "Hubungi Kami" : "Contact Us"}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("contact_title", "Siap Membantu Perjalanan Anda")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("contact_desc", "Konsultasikan perjalanan impian Anda bersama kami.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            {contacts.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-900 last:border-0">
                <Icon size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{value}</p>
                </div>
              </div>
            ))}

            {bankAcc && (
              <div className="pt-2">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-3">
                  {lang === "id" ? "Rekening Pembayaran" : "Payment Account"}
                </p>
                {bankName && <p className="text-xs text-gray-500 mb-0.5">{bankName}</p>}
                <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{bankAcc}</p>
                {bankHolder && <p className="text-xs text-gray-400 mt-0.5">a/n {bankHolder}</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between bg-gray-950 dark:bg-gray-900 rounded-2xl p-10 text-white">
            <div>
              <p className="text-xs tracking-[0.15em] uppercase mb-6" style={{ color: "#7abea4" }}>
                {lang === "id" ? "Konsultasi Gratis" : "Free Consultation"}
              </p>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 leading-snug">
                {lang === "id" ? "Bicara langsung dengan tim kami." : "Talk directly with our team."}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                {lang === "id"
                  ? "Kami bantu pilihkan paket sesuai kebutuhan dan anggaran Anda."
                  : "We help you choose the right package for your needs and budget."}
              </p>
            </div>
            {wa ? (
              <a href={`https://wa.me/${wa}?text=${waMsg}`} target="_blank" rel="noreferrer"
                className="mt-10 inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl transition-all self-start"
                style={{ background: "#2d6a4f", color: "#ffffff" }}>
                <MessageCircle size={16} /> WhatsApp Sekarang
              </a>
            ) : (
              <p className="mt-10 text-sm opacity-40">{email}</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
