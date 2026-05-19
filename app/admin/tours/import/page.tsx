"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

interface ParsedRow {
  title: string;
  country: string;
  tripDate: string | null;
  duration: string | null;
}

// Kompres & ubah ukuran maks 1600px, JPEG 85% — sama seperti uploader utama
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1600;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height / width) * MAX); width = MAX; }
        else { width = Math.round((width / height) * MAX); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas tidak tersedia")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Gagal kompres")); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", 0.85);
    };
    img.onerror = () => reject(new Error("Gagal membaca gambar"));
    img.src = url;
  });
}

// "2024" -> 2024-06-15, "2024-08" -> 2024-08-15, "2024-08-15" -> apa adanya
function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{4}$/.test(s)) return `${s}-06-15`;
  if (/^\d{4}-\d{1,2}$/.test(s)) { const [y, m] = s.split("-"); return `${y}-${m.padStart(2, "0")}-15`; }
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

export default function ImportToursPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const rows = useMemo<ParsedRow[]>(() => {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        return {
          title: parts[0] ?? "",
          country: parts[1] ?? "",
          tripDate: normalizeDate(parts[2] ?? ""),
          duration: parts[3] || null,
        };
      });
  }, [text]);

  const validRows = rows.filter((r) => r.title && r.country);

  async function handleImport() {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      // 1. Upload semua foto (urutan = urutan baris)
      const urls: (string | null)[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgress(`Mengupload foto ${i + 1}/${files.length}...`);
        let uploadFile = files[i];
        try { uploadFile = await compressImage(files[i]); } catch { /* pakai asli */ }
        const fd = new FormData();
        fd.append("file", uploadFile);
        fd.append("folder", "tours/portfolio");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? `Upload foto ${i + 1} gagal`);
        urls.push(data.url);
      }

      // 2. Gabungkan baris + foto (berdasarkan urutan)
      const tours = validRows.map((r, i) => ({
        title: r.title,
        country: r.country,
        tripDate: r.tripDate,
        duration: r.duration,
        heroImg: urls[i] ?? null,
      }));

      // 3. Kirim ke API import
      setProgress("Menyimpan tour...");
      const res = await fetch("/api/tours/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tours }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Import gagal");
      setDone(data.created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import gagal");
    }
    setProgress("");
    setBusy(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/tours" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-3">
          <ArrowLeft size={15} /> Kembali ke Tour
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Massal Tour</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Buat banyak tour sekaligus — cocok untuk arsip trip yang sudah selesai.
        </p>
      </div>

      {done !== null ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32} />
          <p className="font-semibold text-green-800 dark:text-green-300">{done} tour berhasil dibuat</p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            Semua berstatus aktif. Yang tanggalnya sudah lewat tampil sebagai &ldquo;Trip Selesai&rdquo;.
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => router.push("/admin/tours")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
              Lihat Daftar Tour
            </button>
            <button onClick={() => { setDone(null); setText(""); setFiles([]); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg transition">
              Import Lagi
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Panduan format */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">Cara pakai</p>
            <p>Tulis <b>satu trip per baris</b>, pisahkan kolom dengan tanda <code className="bg-blue-100 dark:bg-blue-800/40 px-1 rounded">|</code> :</p>
            <p className="font-mono text-xs mt-2 bg-white dark:bg-gray-900 rounded p-2 border border-blue-200 dark:border-blue-800">
              Judul | Negara | Tanggal | Durasi<br />
              Open Trip Aurora Murmansk | Russia | 2024-12 | 7 Hari 5 Malam<br />
              Jelajah Uzbekistan | Uzbekistan | 2023 | 9 Hari
            </p>
            <p className="mt-2">Tanggal boleh <b>2024</b>, <b>2024-12</b>, atau <b>2024-12-20</b>. Durasi boleh dikosongkan.
              Foto diunggah terpisah di bawah — <b>urutan foto = urutan baris</b>.</p>
          </div>

          {/* Textarea baris */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Daftar Trip</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="Open Trip Aurora Murmansk | Russia | 2024-12 | 7 Hari 5 Malam"
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">{validRows.length} baris valid terbaca.</p>
          </div>

          {/* Upload foto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Foto Trip</label>
            <p className="text-xs text-gray-500 mb-3">Pilih semua foto sekaligus (tahan Cmd/Ctrl saat klik, atau Cmd/Ctrl+A). Urutan foto = urutan baris.</p>
            <input
              ref={fileRef}
              type="file" accept="image/*" multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 transition"
            >
              <Upload size={16} /> Pilih Foto
            </button>
            {files.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {files.length} foto dipilih. {files.length !== validRows.length &&
                  <span className="text-orange-600">Jumlah foto ({files.length}) berbeda dari jumlah baris ({validRows.length}).</span>}
              </p>
            )}
          </div>

          {/* Preview */}
          {validRows.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <p className="px-4 py-3 text-sm font-medium border-b border-gray-200 dark:border-gray-700">Pratinjau ({validRows.length})</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
                      <th className="px-4 py-2">#</th><th className="px-4 py-2">Judul</th>
                      <th className="px-4 py-2">Negara</th><th className="px-4 py-2">Tanggal</th>
                      <th className="px-4 py-2">Durasi</th><th className="px-4 py-2">Foto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{r.title}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{r.country}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{r.tripDate ?? <span className="text-orange-500">— kosong —</span>}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{r.duration ?? "-"}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{files[i] ? files[i].name : <span className="text-gray-400">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={busy || validRows.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
          >
            <Upload size={16} />
            {busy ? progress || "Memproses..." : `Import ${validRows.length} Tour`}
          </button>
        </>
      )}
    </div>
  );
}
