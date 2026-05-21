"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitFieldExpense } from "@/lib/keuangan/actions";
import { rupiah } from "@/lib/keuangan/format";

const INIT = { ok: false } as const;

const CATEGORIES = [
  "Makan Grup",
  "Tips & Gratuity",
  "Tiket Masuk / Atraksi",
  "Transport Lokal",
  "Akomodasi Tambahan",
  "Perlengkapan",
  "Darurat / Medis",
  "Lainnya",
];

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Menunggu", cls: "lapor-pill-pending" },
  APPROVED: { label: "Disetujui", cls: "lapor-pill-approved" },
  REJECTED: { label: "Ditolak", cls: "lapor-pill-rejected" },
};

type RecentItem = {
  id: string;
  date: Date | string;
  category: string;
  amount: number;
  photoUrl: string;
  status: string;
  submittedBy: string;
};

/** Kompres + resize foto ke max 1400px JPEG q80 → dataURL. */
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height / width) * MAX);
          width = MAX;
        } else {
          width = Math.round((width / height) * MAX);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Kamera/galeri tidak didukung di perangkat ini."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => reject(new Error("Gagal membaca foto."));
    img.src = url;
  });
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="lapor-btn" disabled={disabled || pending}>
      {pending ? "Mengirim…" : "Kirim Laporan Pengeluaran"}
    </button>
  );
}

export default function LaporForm({
  token,
  tripTitle,
  tripInfo,
  recent,
}: {
  token: string;
  tripTitle: string;
  tripInfo: string;
  recent: RecentItem[];
}) {
  const [state, formAction] = useActionState(submitFieldExpense, INIT);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [tlName, setTlName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setTlName(localStorage.getItem("lapor-tl-name") || "");
  }, []);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setPhotoUrl("");
      setUploadErr("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr("");
    try {
      const dataUrl = await compress(file);
      const res = await fetch("/api/lapor/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, image: dataUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengunggah foto.");
      setPhotoUrl(json.url);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="lapor-wrap">
      <div className="lapor-head">
        <div className="lapor-brand">
          SUNDAF<b>·</b>TRIP
        </div>
        <div className="lapor-title">Lapor Pengeluaran Trip</div>
        <div className="lapor-trip">
          {tripTitle} — {tripInfo}
        </div>
        <div className="lapor-head-note">
          Foto setiap struk/nota, lalu catat di sini. Laporan masuk antrian
          dan diverifikasi kantor. Foto bukti wajib.
        </div>
      </div>

      <form ref={formRef} action={formAction} className="lapor-card">
        <div className="lapor-sec-title">Catat Pengeluaran Baru</div>

        {state.ok && (
          <div className="lapor-alert lapor-alert-ok">
            ✓ Laporan terkirim. Menunggu verifikasi kantor. Silakan lanjut
            catat pengeluaran berikutnya.
          </div>
        )}
        {state.error && (
          <div className="lapor-alert lapor-alert-error">⚠ {state.error}</div>
        )}

        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="photoUrl" value={photoUrl} />

        <div className="lapor-field">
          <label className="lapor-label">
            Foto Struk / Nota <span className="req">*</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          {photoUrl ? (
            <div className="lapor-photo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Bukti" />
              <button
                type="button"
                className="lapor-photo-change"
                onClick={() => fileRef.current?.click()}
              >
                Ganti Foto
              </button>
            </div>
          ) : (
            <div className="lapor-photo" onClick={() => fileRef.current?.click()}>
              <div className="lapor-photo-icon">📷</div>
              <div className="lapor-photo-text">
                {uploading ? "Mengunggah foto…" : "Ambil / Pilih Foto Nota"}
              </div>
              <div className="lapor-photo-sub">Ketuk untuk buka kamera</div>
            </div>
          )}
          {uploadErr && <div className="lapor-hint" style={{ color: "#c4402f" }}>{uploadErr}</div>}
        </div>

        <div className="lapor-field">
          <label className="lapor-label">
            Kategori <span className="req">*</span>
          </label>
          <select className="lapor-select" name="category" defaultValue="" required>
            <option value="" disabled>
              — Pilih kategori —
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="lapor-field">
          <label className="lapor-label">
            Nominal (Rp) <span className="req">*</span>
          </label>
          <input
            className="lapor-input"
            name="amount"
            type="number"
            inputMode="numeric"
            placeholder="0"
            required
          />
        </div>

        <div className="lapor-field">
          <label className="lapor-label">
            Tanggal Transaksi <span className="req">*</span>
          </label>
          <input
            className="lapor-input"
            name="date"
            type="date"
            defaultValue={today}
            required
          />
        </div>

        <div className="lapor-field">
          <label className="lapor-label">Keterangan (opsional)</label>
          <textarea
            className="lapor-textarea"
            name="note"
            placeholder="Contoh: makan siang 18 pax di restoran lokal"
          />
        </div>

        <div className="lapor-field">
          <label className="lapor-label">
            Nama Anda (TL) <span className="req">*</span>
          </label>
          <input
            className="lapor-input"
            name="submittedBy"
            placeholder="Nama lengkap"
            defaultValue={tlName}
            onChange={(e) => setTlName(e.target.value)}
            onBlur={() => tlName && localStorage.setItem("lapor-tl-name", tlName)}
            required
          />
        </div>

        <SubmitButton disabled={!photoUrl || uploading} />
        {!photoUrl && (
          <div className="lapor-hint" style={{ textAlign: "center", marginTop: 8 }}>
            Unggah foto bukti dulu untuk bisa mengirim.
          </div>
        )}
      </form>

      <div className="lapor-card">
        <div className="lapor-sec-title">Riwayat Pengeluaran Trip Ini</div>
        {recent.length === 0 ? (
          <div className="lapor-empty">Belum ada pengeluaran dilaporkan.</div>
        ) : (
          recent.map((r) => {
            const st = STATUS[r.status] ?? STATUS.PENDING;
            return (
              <div key={r.id} className="lapor-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="lapor-row-thumb" src={r.photoUrl} alt="" />
                <div className="lapor-row-main">
                  <div className="lapor-row-cat">{r.category}</div>
                  <div className="lapor-row-meta">
                    {new Date(r.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    · {r.submittedBy} ·{" "}
                    <span className={`lapor-pill ${st.cls}`}>{st.label}</span>
                  </div>
                </div>
                <div className="lapor-row-amt">{rupiah(r.amount)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
