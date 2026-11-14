"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readApiError } from "@/lib/admin-fetch";
import type { AdminPoolData, ImportSummary } from "@/lib/pool/store";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1UY8ipbb-c_-fu-uySmC45pAkhwXvM7lrKi_b_OpBW10/edit";

export default function ImportPanel({ data }: { data: AdminPoolData }) {
  const router = useRouter();
  const kz = data.destinations.find((d) => d.engine === "kazakhstan");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ summary: ImportSummary; saved: boolean } | null>(null);

  async function run(dryRun: boolean) {
    if (!kz || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/pool-admin/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId: kz.id, text, dryRun }),
      });
      if (!res.ok) {
        setError(await readApiError(res, "Impor gagal. Coba lagi."));
      } else {
        const body = (await res.json()) as { value: ImportSummary };
        setResult({ summary: body.value, saved: !dryRun });
        if (!dryRun) router.refresh();
      }
    } catch {
      setError("Koneksi gagal. Periksa internet lalu coba lagi.");
    }
    setBusy(false);
  }

  if (!kz) return null;
  const s = result?.summary;
  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
        <p className="font-bold text-gray-900 dark:text-white">Pindahkan pendaftar lama dari Google Sheet</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Buka Sheet <a href={SHEET_URL} target="_blank" rel="noreferrer" className="text-teal-700 underline dark:text-teal-400">SUNDAF · Pool Kazakhstan</a>, tab <b>Pendaftar</b>.</li>
          <li>Pilih semua (Ctrl/Cmd + A), salin, lalu tempel di kotak di bawah. Baris judul harus ikut.</li>
          <li>Tekan <b>Periksa dulu</b>. Kalau angkanya cocok, tekan <b>Impor sekarang</b>.</li>
        </ol>
        <p className="mt-2 text-xs text-gray-500">
          Aman diulang: kode pendaftaran yang sudah ada tidak dibuat dua kali. Baris &quot;KZ+KG (segera)&quot; masuk sebagai daftar minat dan tidak dihitung di pool, sama seperti di Sheet.
        </p>
      </div>

      <textarea
        value={text} onChange={(e) => { setText(e.target.value); setResult(null); }} rows={10}
        aria-label="Tempel isi tab Pendaftar" placeholder={"Waktu daftar\tKode\tNama\tWhatsApp\tJumlah orang\tTanggal tiba\tPaket\t…"}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />

      <div className="flex gap-2">
        <button type="button" disabled={busy || !text.trim()} onClick={() => run(true)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
          {busy ? "Memeriksa…" : "Periksa dulu"}
        </button>
        <button type="button" disabled={busy || !s || result?.saved || s.created + s.updated === 0} onClick={() => run(false)} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
          Impor sekarang
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      {s && (
        <div className={`rounded-xl border p-4 text-sm ${result?.saved ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200" : "border-gray-200 dark:border-gray-800 dark:text-gray-300"}`}>
          <p className="font-bold">{result?.saved ? "Selesai diimpor" : "Hasil pemeriksaan (belum disimpan)"}</p>
          <ul className="mt-1 space-y-0.5">
            <li>{s.created} pendaftar baru {result?.saved ? "dimasukkan" : "akan dimasukkan"}</li>
            <li>{s.updated} pendaftar impor lama {result?.saved ? "diperbarui" : "akan diperbarui"} dari Sheet</li>
            <li>{s.unchanged} sudah ada di website, tidak diubah</li>
            <li>{s.skipped.length} baris dilewati</li>
          </ul>
          {s.skipped.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
              {s.skipped.slice(0, 30).map((x, i) => <li key={i}>Baris {x.line}: {x.reason}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
