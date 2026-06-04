"use client";

/* Form pemesanan visa per-negara, menggantikan kartu harga statis di
   /visa/[slug]. User pilih varian + jumlah applicant + opsional catatan,
   submit → buka WhatsApp dengan pesan terstruktur (country, paket,
   jumlah, subtotal, catatan).
   Tidak ada payment gateway, alur tetap WA-first, sesuai pola situs. */

import { useMemo, useState } from "react";
import { CheckCircle2, Minus, Plus, MessageCircle } from "lucide-react";

export interface OrderVariant {
  id: string;
  name: string;
  priceIDR: number | null;
  processingTime: string | null;
}

interface Props {
  countryName: string;
  waNumber: string;
  variants: OrderVariant[];
  /** Fallback price label untuk kartu tanpa varian (mis. "Gratis", "Mulai Rp 300.000"). */
  fallbackCostLabel: string;
  fallbackIsFree: boolean;
}

const RUPIAH = new Intl.NumberFormat("id-ID");

function formatRp(n: number): string {
  return `Rp ${RUPIAH.format(n)}`;
}

export default function VisaOrderForm({
  countryName,
  waNumber,
  variants,
  fallbackCostLabel,
  fallbackIsFree,
}: Props) {
  const hasVariants = variants.length > 0;
  const [selectedId, setSelectedId] = useState<string>(variants[0]?.id ?? "");
  const [applicants, setApplicants] = useState(1);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? variants[0] ?? null,
    [selectedId, variants],
  );

  const subtotal = useMemo(() => {
    if (!selected?.priceIDR) return null;
    return selected.priceIDR * applicants;
  }, [selected, applicants]);

  const headlinePrice = useMemo(() => {
    if (!hasVariants) return fallbackCostLabel;
    if (selected?.priceIDR) return formatRp(selected.priceIDR);
    return "Tanya Harga";
  }, [hasVariants, selected, fallbackCostLabel]);

  const waLink = useMemo(() => {
    if (!waNumber) return "";
    const lines = [`Halo, saya ingin pesan visa ${countryName}.`, ""];
    if (selected) {
      lines.push(`Paket: ${selected.name}`);
      if (selected.processingTime) lines.push(`Estimasi: ${selected.processingTime}`);
    }
    lines.push(`Jumlah pelamar: ${applicants} orang`);
    if (subtotal !== null) {
      lines.push(`Subtotal estimasi: ${formatRp(subtotal)}`);
    }
    if (notes.trim()) {
      lines.push("");
      lines.push(`Catatan: ${notes.trim()}`);
    }
    lines.push("");
    lines.push("Mohon info proses dan dokumen yang dibutuhkan. Terima kasih.");
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [waNumber, countryName, selected, applicants, subtotal, notes]);

  // Submit: rekam lead ke CMS (Lead Masuk) lalu lanjut ke WhatsApp.
  async function submitOrder() {
    setErr("");
    if (!name.trim()) { setErr("Nama wajib diisi."); return; }
    if (wa.replace(/\D/g, "").length < 8) { setErr("Nomor WhatsApp belum valid."); return; }
    if (!waLink) return;
    setSubmitting(true);
    const parts: string[] = [];
    if (selected) parts.push(`Paket: ${selected.name}`);
    parts.push(`Jumlah pelamar: ${applicants}`);
    if (subtotal !== null) parts.push(`Subtotal: ${formatRp(subtotal)}`);
    if (notes.trim()) parts.push(`Catatan: ${notes.trim()}`);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: wa.trim(),
          destination: `Visa ${countryName}`,
          message: parts.join(" · "),
          source: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
    } catch { /* tetap lanjut ke WhatsApp meski perekaman gagal */ }
    window.location.href = waLink;
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-1">
        {hasVariants ? (subtotal ? "Subtotal" : "Mulai dari") : fallbackIsFree ? "Biaya" : "Mulai dari"}
      </p>
      <p
        className={`text-3xl font-bold mb-1 ${
          fallbackIsFree && !hasVariants
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {subtotal !== null ? formatRp(subtotal) : headlinePrice}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        {fallbackIsFree && !hasVariants
          ? "Tidak perlu visa untuk WNI"
          : "Sudah termasuk biaya layanan Sundaf Trip"}
      </p>

      {hasVariants && (
        <>
          {/* Varian selector */}
          <div className="space-y-2 mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Pilih paket
            </p>
            {variants.map((v) => {
              const active = v.id === selectedId;
              return (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  className={`w-full text-left rounded-xl border-2 p-3 transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {v.name}
                      </p>
                      {v.processingTime && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Proses {v.processingTime}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {v.priceIDR ? formatRp(v.priceIDR) : "Tanya Harga"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Jumlah applicant */}
          <div className="flex items-center justify-between mb-4 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2.5">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Jumlah pelamar</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Bisa diubah saat konsultasi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setApplicants((n) => Math.max(1, n - 1))}
                disabled={applicants <= 1}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800"
                aria-label="Kurangi pelamar"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-sm tabular-nums">{applicants}</span>
              <button
                type="button"
                onClick={() => setApplicants((n) => Math.min(20, n + 1))}
                disabled={applicants >= 20}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800"
                aria-label="Tambah pelamar"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Catatan (collapsible) */}
          {!showNotes ? (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 underline-offset-4 hover:underline"
            >
              + Tambah catatan (opsional)
            </button>
          ) : (
            <div className="mb-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Mis. tanggal keberangkatan, kebutuhan khusus, dll."
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 outline-none focus:border-gray-400 dark:focus:border-gray-600"
              />
            </div>
          )}
        </>
      )}

      {/* Feature ticks */}
      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 mb-5">
        {[
          "Dokumen di-review tim profesional",
          "Update progress via WhatsApp",
          "Antar/jemput dokumen Jabodetabek",
        ].map((line) => (
          <div key={line} className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden />
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Data pemesan — direkam ke CMS (Lead Masuk) */}
      {waLink && (
        <div className="space-y-2 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap *"
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 outline-none focus:border-gray-400 dark:focus:border-gray-600"
          />
          <input
            value={wa}
            onChange={(e) => setWa(e.target.value)}
            inputMode="tel"
            placeholder="No. WhatsApp * (mis. 0812xxxx)"
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 outline-none focus:border-gray-400 dark:focus:border-gray-600"
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
      )}

      {/* CTA */}
      {waLink ? (
        <button
          type="button"
          onClick={submitOrder}
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full text-center px-5 py-3.5 rounded-xl text-white font-semibold transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ background: "#25D366" }}
        >
          <MessageCircle size={16} aria-hidden />
          {submitting ? "Memproses…" : "Pesan via WhatsApp"}
        </button>
      ) : (
        <p className="text-center text-xs text-gray-400">
          Nomor WhatsApp belum di-set di CMS.
        </p>
      )}
    </div>
  );
}
