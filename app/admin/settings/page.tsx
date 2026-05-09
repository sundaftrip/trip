"use client";

import { useEffect, useState } from "react";

const INFO_FIELDS = [
  { key: "company_name", label: "Nama Perusahaan" },
  { key: "company_nib", label: "NIB" },
  { key: "company_address", label: "Alamat" },
  { key: "company_phone", label: "Telepon" },
  { key: "company_whatsapp", label: "WhatsApp" },
  { key: "company_email", label: "Email" },
  { key: "company_website", label: "Website" },
];

const COLOR_FIELDS = [
  { key: "color_hero", label: "Judul Hero Utama", default: "#0d2018", hint: "Teks besar di halaman utama" },
  { key: "color_heading", label: "Judul Section", default: "#111827", hint: "Judul bagian di halaman utama" },
  { key: "color_tour_title", label: "Judul Paket Tour", default: "#111827", hint: "Nama tour di halaman daftar & detail" },
  { key: "color_blog_title", label: "Judul Blog", default: "#111827", hint: "Judul artikel blog" },
  { key: "color_accent", label: "Warna Aksen (Tombol & Harga)", default: "#2d6a4f", hint: "Warna tombol utama dan harga" },
  { key: "color_eyebrow", label: "Teks Kecil (Eyebrow)", default: "#6b7280", hint: "Teks kecil di atas judul hero" },
];

export default function SettingsPage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setData);
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function resetColor(key: string, defaultVal: string) {
    setData((d) => ({ ...d, [key]: defaultVal }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Informasi perusahaan dan tampilan website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Semua"}
        </button>
      </div>

      {/* Company Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Perusahaan</h2>
        {INFO_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input
              className="input"
              value={data[key] ?? ""}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Color Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Warna Tampilan Website</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Klik kotak warna untuk membuka color picker. Perubahan langsung berlaku setelah disimpan.</p>
        </div>
        <div className="space-y-4">
          {COLOR_FIELDS.map(({ key, label, default: defaultVal, hint }) => {
            const current = data[key] ?? defaultVal;
            return (
              <div key={key} className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={current}
                    onChange={(e) => setData({ ...data, [key]: e.target.value })}
                    className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700"
                    title={label}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-400">{hint}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {current}
                  </code>
                  {current !== defaultVal && (
                    <button
                      type="button"
                      onClick={() => resetColor(key, defaultVal)}
                      className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Preview</p>
          <p className="text-xs mb-1" style={{ color: data["color_eyebrow"] ?? "#6b7280" }}>CV SUNDAF HOLIDAY GROUP — PERJALANAN TERPERCAYA</p>
          <p className="text-2xl font-bold mb-2" style={{ color: data["color_hero"] ?? "#0d2018" }}>Wujudkan Perjalanan Impian Anda</p>
          <p className="text-sm font-semibold mb-1" style={{ color: data["color_heading"] ?? "#111827" }}>Kenapa Sundaf Trip?</p>
          <p className="text-sm" style={{ color: data["color_blog_title"] ?? "#111827" }}>Judul Artikel Blog</p>
          <div className="mt-2 inline-flex px-3 py-1.5 rounded-lg text-white text-sm font-semibold" style={{ background: data["color_accent"] ?? "#2d6a4f" }}>
            Lihat Tour
          </div>
        </div>

        {/* Save button below colors */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
          >
            {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Warna"}
          </button>
        </div>
      </div>
    </div>
  );
}
