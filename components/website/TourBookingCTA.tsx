"use client";

/* CTA pemesanan tour. Sebelum membuka WhatsApp, rekam lead (nama + no. WA)
   ke CMS (Lead Masuk) lewat /api/inquiries, lalu lanjut ke WhatsApp dengan
   pesan terstruktur yang sudah dibangun di server. Pola sama dengan
   VisaOrderForm — alur tetap WA-first. */

import { useState } from "react";
import { MessageCircle } from "lucide-react";

interface Props {
  waHref: string;          // link wa.me lengkap (pesan sudah ter-encode di server)
  destination: string;     // judul tour, untuk kolom tujuan di Lead Masuk
  summary?: string;        // ringkasan harga/paket untuk catatan lead
  buttonClassName: string; // styling tombol mengikuti tema halaman
  buttonStyle?: React.CSSProperties;
}

export default function TourBookingCTA({
  waHref,
  destination,
  summary,
  buttonClassName,
  buttonStyle,
}: Props) {
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!name.trim()) { setErr("Nama wajib diisi."); return; }
    if (wa.replace(/\D/g, "").length < 8) { setErr("Nomor WhatsApp belum valid."); return; }
    if (!waHref) return;
    setSubmitting(true);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: wa.trim(),
          destination,
          message: summary?.trim() || "Tertarik via halaman tour",
          source: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
    } catch { /* tetap lanjut ke WhatsApp meski perekaman gagal */ }
    window.location.href = waHref;
  }

  const inputCls =
    "w-full text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2.5 outline-none focus:border-gray-400 dark:focus:border-gray-600";

  return (
    <div className="mb-3">
      <div className="space-y-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap *"
          className={inputCls}
        />
        <input
          value={wa}
          onChange={(e) => setWa(e.target.value)}
          inputMode="tel"
          placeholder="No. WhatsApp * (mis. 0812xxxx)"
          className={inputCls}
        />
        {err && <p className="text-xs text-red-500">{err}</p>}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className={buttonClassName}
        style={buttonStyle}
      >
        <MessageCircle size={18} /> {submitting ? "Memproses…" : "Pesan via WhatsApp"}
      </button>
    </div>
  );
}
