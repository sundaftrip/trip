"use client";

import { useState, useMemo } from "react";

/* Editor katalog visa — admin tempel pricelist (1 baris per layanan).
   Disimpan ke companyInfo key "visa_catalog" lewat /api/settings. */
export default function VisaEditor({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validRows = useMemo(
    () => text.split("\n").filter((l) => l.trim() && l.includes("|")),
    [text],
  );

  async function save() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visa_catalog: text }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
        <p className="font-semibold mb-1">Cara mengisi</p>
        <p>Satu layanan per baris, kolom dipisah tanda <code className="bg-blue-100 dark:bg-blue-800/40 px-1 rounded">|</code> :</p>
        <p className="font-mono text-xs mt-2 bg-white dark:bg-gray-900 rounded p-2 border border-blue-200 dark:border-blue-800">
          Negara | Jenis Visa | Harga | Estimasi | Catatan<br />
          Jepang | Single Entry | Rp 950.000 | 5-8 hari kerja | via Jakarta<br />
          Russia | E-Visa | Rp 1.400.000 | 5 hari kerja |<br />
          Saudi Arabia | E-Visa Umroh | | 5 hari kerja | hubungi untuk harga
        </p>
        <p className="mt-2">Kolom <b>Harga</b> boleh dikosongkan — di website akan tampil &ldquo;Tanya Harga&rdquo;. Kolom <b>Estimasi</b> &amp; <b>Catatan</b> opsional.</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        placeholder="Jepang | Single Entry | Rp 950.000 | 5-8 hari kerja | via Jakarta"
        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      />

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
          {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Katalog Visa"}
        </button>
        <span className="text-xs text-gray-500">{validRows.length} layanan terbaca</span>
      </div>
    </div>
  );
}
