"use client";

import { useEffect, useState } from "react";
import { PLAN, isFeatureEnabled } from "@/lib/plan";
import { Lock } from "lucide-react";

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

const THEMES = [
  { key: "classic", label: "Classic", desc: "Minimalis & bersih. Tipografi besar, latar putih.", feature: null },
  { key: "vibrant", label: "Vibrant", desc: "Warna penuh semangat. Hero dengan gradien warna aksen.", feature: "theme_vibrant" },
  { key: "bold", label: "Bold", desc: "Kesan premium & gelap. Hero gelap dengan kontras tinggi.", feature: "theme_bold" },
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setData((d) => ({ ...d, company_logo: url }));
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

        {/* Logo Upload */}
        <div>
          <label className="label">Logo Perusahaan</label>
          {data["company_logo"] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data["company_logo"]} alt="Logo" className="h-12 w-auto mb-2 object-contain" />
          )}
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500" />
        </div>

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
          <p className="text-xs mb-1" style={{ color: data["color_eyebrow"] ?? "#6b7280" }}>{data["company_name"] || "NAMA PERUSAHAAN"} — PERJALANAN TERPERCAYA</p>
          <p className="text-2xl font-bold mb-2" style={{ color: data["color_hero"] ?? "#0d2018" }}>Wujudkan Perjalanan Impian Anda</p>
          <p className="text-sm font-semibold mb-1" style={{ color: data["color_heading"] ?? "#111827" }}>Mengapa Kami?</p>
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

      {/* Theme Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-gray-900 dark:text-white">Tema Website</h2>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            PLAN === "pro"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}>
            {PLAN === "pro" ? "✦ PRO" : "BASIC"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Pilih tampilan halaman utama website</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map(({ key, label, desc, feature }) => {
            const unlocked = !feature || isFeatureEnabled(feature);
            const active = (data["site_theme"] ?? "classic") === key;
            return (
              <div key={key} className="relative">
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && setData((d) => ({ ...d, site_theme: key }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    !unlocked
                      ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-gray-700"
                      : active
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  {/* Mini preview */}
                  <div className={`h-16 rounded-lg mb-3 overflow-hidden relative ${
                    key === "classic" ? "bg-white border border-gray-200" :
                    key === "vibrant" ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
                    "bg-gray-900"
                  }`}>
                    <div className={`h-full flex p-2 ${key === "classic" ? "items-end" : "items-center justify-center"}`}>
                      <div className={`rounded ${key === "classic" ? "h-2 w-16 bg-gray-900" : "h-2 w-20 bg-white/80"}`} />
                    </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-gray-100/60 dark:bg-gray-900/60 flex items-center justify-center rounded-lg">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className={`text-sm font-semibold ${active && unlocked ? "text-blue-600" : "text-gray-900 dark:text-white"}`}>
                      {label}
                    </p>
                    {!unlocked && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">PRO</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              </div>
            );
          })}
        </div>
        {PLAN !== "pro" && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Tema Vibrant & Bold tersedia di paket Pro. Hubungi admin untuk upgrade.
            </p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
          >
            {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Tema"}
          </button>
        </div>
      </div>
    </div>
  );
}
