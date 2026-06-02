"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const DESTINATIONS = [
  "Rusia",
  "Aurora Borealis (Tromsø/Murmansk)",
  "Kazakhstan",
  "Uzbekistan",
  "Kyrgyzstan",
  "Tajikistan",
  "Belum tahu / minta saran",
];

export default function InquiryForm({
  defaultDestination = "",
  className = "",
}: {
  defaultDestination?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      whatsapp: fd.get("whatsapp"),
      email: fd.get("email"),
      destination: fd.get("destination"),
      travelDate: fd.get("travelDate"),
      message: fd.get("message"),
      website: fd.get("website"), // honeypot
      source: typeof window !== "undefined" ? window.location.pathname : "",
    };
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal mengirim. Coba lagi.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className={`rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center ${className}`}>
        <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: "var(--site-accent, #00ADB5)" }} />
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Terima kasih! 🙌</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Permintaan Anda sudah kami terima. Tim kami akan menghubungi via WhatsApp secepatnya.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--site-accent,#00ADB5)] focus:border-transparent transition";

  return (
    <form onSubmit={onSubmit} className={`space-y-3 ${className}`}>
      {/* Honeypot — disembunyikan dari manusia, diisi bot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="name" required placeholder="Nama lengkap *" className={inputCls} />
        <input name="whatsapp" required inputMode="tel" placeholder="No. WhatsApp *" className={inputCls} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select name="destination" defaultValue={defaultDestination} className={inputCls}>
          <option value="">Tujuan yang diminati…</option>
          {DESTINATIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input name="travelDate" placeholder="Rencana waktu (mis. Des 2026)" className={inputCls} />
      </div>

      <input name="email" type="email" placeholder="Email (opsional)" className={inputCls} />

      <textarea
        name="message"
        rows={3}
        placeholder="Ceritakan rencana & budget Anda (opsional)"
        className={inputCls}
      />

      {status === "error" && (
        <p className="text-sm text-red-500" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm text-white transition disabled:opacity-60"
        style={{ background: "var(--site-accent, #00ADB5)" }}
      >
        <Send size={16} />
        {status === "loading" ? "Mengirim…" : "Kirim Permintaan Konsultasi"}
      </button>
      <p className="text-xs text-gray-400">
        Atau langsung chat WhatsApp kami — respons lebih cepat di jam kerja.
      </p>
    </form>
  );
}
