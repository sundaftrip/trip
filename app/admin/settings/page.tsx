"use client";

import { useEffect, useState } from "react";
import { isFeatureEnabledFor, type Plan } from "@/lib/plan";
import { COLOR_SCHEMES } from "@/lib/color-schemes";
import { Lock } from "lucide-react";

const INFO_FIELDS = [
  { key: "company_name", label: "Nama Perusahaan" },
  { key: "company_nib", label: "NIB" },
  { key: "company_address", label: "Alamat" },
  { key: "company_phone", label: "Telepon" },
  { key: "company_whatsapp", label: "WhatsApp" },
  { key: "company_email", label: "Email" },
  { key: "company_website", label: "Website" },
  { key: "company_instagram", label: "Instagram (username, mis. sundaf.trip)" },
];

const FONTS = [
  { key: "jost",          label: "Jost",             desc: "Modern & geometris — default",        sample: "Perjalanan Impian" },
  { key: "plus-jakarta",  label: "Plus Jakarta Sans", desc: "Kontemporer, sedikit rounded",        sample: "Perjalanan Impian" },
  { key: "dm-sans",       label: "DM Sans",           desc: "Bersih & ramah, mudah dibaca",        sample: "Perjalanan Impian" },
  { key: "outfit",        label: "Outfit",            desc: "Geometris & modern, elegan",          sample: "Perjalanan Impian" },
  { key: "nunito",        label: "Nunito",            desc: "Bulat & hangat, kesan ramah",         sample: "Perjalanan Impian" },
  { key: "playfair",      label: "Playfair Display",  desc: "Serif elegan, kesan premium & mewah", sample: "Perjalanan Impian" },
  { key: "raleway",       label: "Raleway",           desc: "Tipis & elegan, lifestyle & travel",  sample: "Perjalanan Impian" },
  { key: "poppins",       label: "Poppins",           desc: "Populer & friendly, sangat terbaca",  sample: "Perjalanan Impian" },
];

const FONT_CSS_VAR: Record<string, string> = {
  jost:          "var(--font-jost)",
  "plus-jakarta": "var(--font-plus-jakarta)",
  "dm-sans":     "var(--font-dm-sans)",
  outfit:        "var(--font-outfit)",
  nunito:        "var(--font-nunito)",
  playfair:      "var(--font-playfair)",
  raleway:       "var(--font-raleway)",
  poppins:       "var(--font-poppins)",
};

const THEMES = [
  { key: "classic",  label: "Classic",  desc: "Minimalis & bersih. Tipografi besar, latar putih.",                   feature: null },
  { key: "teri",     label: "JOJO",     desc: "Pixel-art cozy valley. Nuansa hangat hijau-kayu, sudut tajam, shadow pixel.", feature: null },
];

export default function SettingsPage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeScheme, setActiveScheme] = useState<string>("");
  const [plan, setPlan] = useState<Plan>("basic");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setData(d);
      setActiveScheme(d["color_scheme"] ?? "forest");
    });
    // Plan diresolusi dari MASTER lewat /api/plan
    fetch("/api/plan").then((r) => r.json()).then((d) => {
      if (d?.plan) setPlan(d.plan);
    }).catch(() => {});
  }, []);

  // Helper lokal: cek fitur berdasarkan plan yang sudah diresolusi
  const isFeatureEnabled = (feature: string) => isFeatureEnabledFor(feature, plan);
  const isPro = plan === "pro";

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

  function applyScheme(schemeId: string) {
    const scheme = COLOR_SCHEMES.find((s) => s.id === schemeId);
    if (!scheme) return;
    setActiveScheme(schemeId);
    setData((d) => ({ ...d, ...scheme.colors, color_scheme: schemeId }));
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

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setData((d) => ({ ...d, favicon_logo: url }));
  }

  const currentAccent = data["color_accent"] ?? "#2d6a4f";
  const currentHero = data["color_hero"] ?? "#0d2018";
  const currentEyebrow = data["color_eyebrow"] ?? "#6b7280";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Informasi perusahaan dan tampilan website</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
          {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Semua"}
        </button>
      </div>

      {/* Company Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Perusahaan</h2>
        {INFO_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input className="input" value={data[key] ?? ""}
              onChange={(e) => setData({ ...data, [key]: e.target.value })} />
          </div>
        ))}
      </div>

      {/* Branding / Logo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Branding</h2>
          <p className="text-xs text-gray-400 mt-0.5">Logo yang dipakai di seluruh tampilan website dan admin.</p>
        </div>

        {/* Logo Utama + Favicon side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Logo Utama */}
          <div>
            <label className="label">Logo Utama</label>
            <p className="text-xs text-gray-400 mb-3">Navbar, sidebar admin, OG image. Gunakan PNG transparan.</p>
            <div className="h-20 flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 mb-3 overflow-hidden">
              {data["company_logo"]
                ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data["company_logo"]} alt="Logo" className="h-14 w-auto object-contain" />
                  </>
                )
                : <span className="text-xs text-gray-400">Belum ada logo</span>}
            </div>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs text-gray-500" />
          </div>

          {/* Favicon */}
          <div>
            <label className="label">Favicon <span className="font-normal text-gray-400 text-xs">(ikon tab)</span></label>
            <p className="text-xs text-gray-400 mb-3">Ikon kotak kecil di tab browser. Kosong → pakai Logo Utama.</p>
            <div className="h-20 flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 mb-3 overflow-hidden">
              {data["favicon_logo"]
                ? (
                  <div className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data["favicon_logo"]} alt="Favicon" className="h-10 w-10 object-contain rounded-lg" />
                    <button type="button" onClick={() => setData((d) => ({ ...d, favicon_logo: "" }))}
                      className="text-[10px] text-red-500 hover:text-red-700">Hapus</button>
                  </div>
                )
                : <span className="text-xs text-gray-400">Pakai Logo Utama</span>}
            </div>
            <input type="file" accept="image/*" onChange={handleFaviconUpload} className="text-xs text-gray-500" />
          </div>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Skema Warna</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pilih satu skema — semua warna website berubah sekaligus.</p>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            isFeatureEnabled("color_schemes")
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}>
            {isFeatureEnabled("color_schemes") ? "✦ PRO" : "BASIC"}
          </span>
        </div>

        {!isFeatureEnabled("color_schemes") && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <Lock size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Skema warna tersedia di paket Pro. Hubungi admin untuk upgrade.
            </p>
          </div>
        )}

        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ${!isFeatureEnabled("color_schemes") ? "opacity-50 pointer-events-none select-none" : ""}`}>
          {COLOR_SCHEMES.map((scheme) => {
            const isActive = activeScheme === scheme.id;
            return (
              <button key={scheme.id} type="button" onClick={() => applyScheme(scheme.id)}
                disabled={!isFeatureEnabled("color_schemes")}
                className={`text-left rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  isActive
                    ? "border-blue-500 shadow-md shadow-blue-100 dark:shadow-none scale-[1.02]"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:scale-[1.01]"
                }`}>
                <div className="flex h-10">
                  {scheme.swatch.map((color, i) => (
                    <div key={i} className="flex-1" style={{ background: color }} />
                  ))}
                </div>
                <div className="p-2.5">
                  <p className={`text-xs font-semibold ${isActive ? "text-blue-600" : "text-gray-900 dark:text-white"}`}>
                    {scheme.name}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-snug">{scheme.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Preview */}
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4" style={{ background: currentHero }}>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase mb-2" style={{ color: currentEyebrow }}>
              {data["company_name"] || "NAMA PERUSAHAAN"} — PERJALANAN TERPERCAYA
            </p>
            <p className="text-2xl font-black text-white leading-tight">Wujudkan Perjalanan<br />Impian Anda</p>
          </div>
          <div className="px-5 py-3 bg-white dark:bg-gray-900 flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-lg text-white text-xs font-bold" style={{ background: currentAccent }}>
              Lihat Tour
            </div>
            <span className="text-xs text-gray-400">Warna Aksen → Tombol & Harga</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
            {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Skema"}
          </button>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-gray-900 dark:text-white">Tema Layout</h2>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            isPro
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}>
            {isPro ? "✦ PRO" : "BASIC"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-5">Pilih tampilan layout halaman utama</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {THEMES.map(({ key, label, desc, feature }) => {
            const unlocked = !feature || isFeatureEnabled(feature);
            const active = (data["site_theme"] ?? "classic") === key;
            return (
              <div key={key} className="relative">
                <button type="button" disabled={!unlocked}
                  onClick={() => unlocked && setData((d) => ({ ...d, site_theme: key }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    !unlocked ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-gray-700" :
                    active ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]" :
                    "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}>
                  {/* Mini layout preview */}
                  <div className={`h-20 rounded-lg mb-3 overflow-hidden relative ${
                    key === "classic" ? "bg-white border border-gray-100" :
                    key === "vibrant" ? "bg-white border border-gray-100" :
                    key === "atelier" ? "bg-white border border-gray-100" :
                    key === "jojo" ? "border border-gray-100" :
                    key === "console" ? "bg-white border border-gray-100" :
                    "bg-gray-950"
                  }`} style={key === "jojo" ? { background: "#fff8f0" } : undefined}>
                    {key === "jojo" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                        <div className="rounded-full" style={{ width: 22, height: 22, background: "#ffd6ba", boxShadow: "0 0 0 2px #ffdab9, 0 0 0 4px #ecb389" }} />
                        <div className="h-5 w-20 rounded-xl" style={{ background: "rgba(255,255,255,0.9)", border: "2px solid #ffdab9", boxShadow: "inset 0 0 0 2px #ecb389" }} />
                        <div className="h-3.5 w-12 rounded-full" style={{ background: "#e8834a" }} />
                      </div>
                    )}
                    {key === "atelier" && (
                      <div className="absolute inset-0 overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #3a4a5a, #6b7d8a)" }}>
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)" }} />
                        <div className="absolute left-2.5 bottom-2.5 right-2.5">
                          <div className="h-1.5 w-6 rounded-sm mb-1.5" style={{ background: currentAccent }} />
                          <div className="h-2.5 w-20 rounded-sm bg-white mb-1" />
                          <div className="h-1.5 w-12 rounded-sm bg-white/60 mb-2" />
                          <div className="h-3.5 w-12 rounded-md" style={{ background: currentAccent }} />
                        </div>
                        <div className="absolute right-2.5 top-2.5 flex gap-1">
                          <div className="h-1.5 w-4 rounded-full bg-white" />
                          <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
                          <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
                        </div>
                      </div>
                    )}
                    {key === "classic" && (
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="h-1.5 w-12 rounded bg-gray-900 mb-1.5" />
                        <div className="h-3 w-20 rounded bg-gray-900 mb-1" />
                        <div className="h-1 w-16 rounded bg-gray-300" />
                      </div>
                    )}
                    {key === "vibrant" && (
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 p-2 flex flex-col justify-center">
                          <div className="h-1 w-8 rounded mb-1" style={{ background: currentEyebrow }} />
                          <div className="h-2.5 w-12 rounded mb-1" style={{ background: currentHero }} />
                          <div className="h-1.5 w-8 rounded" style={{ background: currentHero, opacity: 0.5 }} />
                        </div>
                        <div className="w-1/2 bg-gray-100 rounded-l-xl" />
                      </div>
                    )}
                    {key === "bold" && (
                      <div className="absolute inset-0 p-2 flex flex-col justify-end">
                        <div className="h-1 w-8 rounded bg-gray-600 mb-1.5" />
                        <div className="h-4 w-20 rounded bg-white mb-1" />
                        <div className="h-1 w-14 rounded bg-gray-700" />
                      </div>
                    )}
                    {key === "tropical" && (
                      <div className="absolute inset-0 flex flex-col justify-end p-2" style={{ background: "#fffdf7" }}>
                        <div className="flex gap-1 mb-1">
                          <div className="h-4 w-12 rounded-full border border-black bg-[#d1fae5]" style={{ boxShadow: "1px 1px 0 0 #000" }} />
                          <div className="h-4 w-8 rounded-full border border-black bg-[#dbeafe]" style={{ boxShadow: "1px 1px 0 0 #000" }} />
                        </div>
                        <div className="h-2 w-16 rounded border border-black bg-[#10b981]" style={{ boxShadow: "1px 1px 0 0 #000" }} />
                      </div>
                    )}
                    {key === "kawaii" && (
                      <div className="absolute inset-0 flex flex-col justify-end p-2" style={{ background: "#fef4ee" }}>
                        <div className="flex gap-1 items-center mb-1.5">
                          <span className="text-xs" style={{ color: "#d4754e" }}>♡</span>
                          <div className="h-4 w-10 rounded-full border bg-[#fce7f3]" style={{ borderColor: "#d4754e", boxShadow: "1px 1px 0 0 #d4754e" }} />
                          <span className="text-[9px]" style={{ color: "#d4754e" }}>✦</span>
                        </div>
                        <div className="h-5 w-16 rounded-full border font-black text-[8px] flex items-center justify-center" style={{ background: "#d4754e", borderColor: "#d4754e", boxShadow: "1px 1px 0 0 #d4754e", color: "white" }}>Lihat Tour</div>
                      </div>
                    )}
                    {key === "pixel" && (
                      <div className="absolute inset-0 flex flex-col justify-end p-2" style={{ background: "#f0eeff", backgroundImage: "linear-gradient(rgba(26,26,46,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,46,0.05) 1px,transparent 1px)", backgroundSize: "6px 6px" }}>
                        <div className="flex gap-1 items-center mb-1.5">
                          <div className="w-3 h-3 border" style={{ background: "#e74c3c", borderColor: "#1a1a2e", boxShadow: "1px 1px 0 0 #1a1a2e" }} />
                          <div className="w-3 h-3 border" style={{ background: "#f1c40f", borderColor: "#1a1a2e", boxShadow: "1px 1px 0 0 #1a1a2e" }} />
                          <div className="w-3 h-3 border" style={{ background: "#00b4d8", borderColor: "#1a1a2e", boxShadow: "1px 1px 0 0 #1a1a2e" }} />
                        </div>
                        <div className="h-5 w-16 border font-black text-[8px] flex items-center justify-center" style={{ background: currentAccent, borderColor: "#1a1a2e", boxShadow: "2px 2px 0 0 #1a1a2e", color: "white", fontFamily: "monospace" }}>TOUR →</div>
                      </div>
                    )}
                    {key === "teri" && (
                      <div className="absolute inset-0 flex flex-col justify-end p-2.5" style={{ background: "#fdf3e3" }}>
                        {/* hexagon mengambang */}
                        <div className="absolute" style={{ top: 5, right: 8, width: 16, height: 18, background: "#ff8fab", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
                        <div className="absolute" style={{ top: 16, right: 24, width: 11, height: 12, background: "#4ecdc4", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
                        {/* kartu shadow ganda warni */}
                        <div className="h-6 w-20 rounded-md mb-2" style={{ background: "#fffdf7", border: "2px solid #342f4a", boxShadow: "3px 3px 0 0 #ff8fab, 6px 6px 0 0 #4ecdc4" }} />
                        <div className="h-4 w-12 rounded-sm" style={{ background: "#7c5cff" }} />
                      </div>
                    )}
                    {key === "globe" && (
                      <div className="absolute inset-0 flex flex-col justify-end p-2.5" style={{ background: "#fef9f0" }}>
                        {/* floating landmark emoji decorations */}
                        <span className="absolute top-1.5 right-2 text-[11px]" style={{ opacity: 0.55 }}>🗼</span>
                        <span className="absolute top-4 left-2 text-[9px]"   style={{ opacity: 0.45 }}>🕌</span>
                        <span className="absolute top-1 right-7 text-[8px]"  style={{ opacity: 0.4 }}>✈️</span>
                        {/* pill badge */}
                        <div className="flex gap-1 mb-1.5">
                          <div className="h-4 px-2 rounded-full text-[7px] font-black flex items-center" style={{ background: "#56c7e0", color: "#111827" }}>🗺️ Destinasi</div>
                          <div className="h-4 px-1.5 rounded-full text-[7px] font-black flex items-center" style={{ background: "#f5a623", color: "#111827" }}>⭐</div>
                        </div>
                        {/* CTA button */}
                        <div className="h-5 w-16 rounded-lg text-[8px] font-black flex items-center justify-center text-white shadow-md" style={{ background: currentAccent }}>
                          Lihat Tour ✈
                        </div>
                      </div>
                    )}
                    {key === "map" && (
                      <div className="absolute inset-0 flex flex-col justify-end p-2.5" style={{ background: "#f4efe6" }}>
                        {/* grid lines */}
                        <div className="absolute inset-0 rounded-lg" style={{ backgroundImage: "linear-gradient(rgba(100,70,30,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(100,70,30,0.07) 1px,transparent 1px)", backgroundSize: "14px 14px" }} />
                        {/* CSS pin markers */}
                        <div className="absolute top-3 left-5 w-2 h-2 rounded-full" style={{ background: "#c46b3a", boxShadow: "0 0 0 2px #c46b3a44" }} />
                        <div className="absolute top-5 right-6 w-1.5 h-1.5 rounded-full" style={{ background: "#2d4a6b", boxShadow: "0 0 0 2px #2d4a6b44" }} />
                        {/* CSS compass */}
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full border" style={{ borderColor: "#b8956a", background: "#faf6ee" }} />
                        {/* route dashed line */}
                        <div className="absolute top-[18px] left-6 right-8 h-px" style={{ backgroundImage: "repeating-linear-gradient(90deg,#2d4a6b 0,#2d4a6b 4px,transparent 4px,transparent 8px)" }} />
                        {/* pill label */}
                        <div className="flex gap-1 mb-1.5 relative z-10">
                          <div className="h-4 px-1.5 text-[7px] font-black flex items-center border" style={{ background: "#faf6ee", borderColor: "#b8956a", color: "#2c1e10" }}>RUTE</div>
                          <div className="h-4 px-1.5 text-[7px] font-black flex items-center" style={{ background: "#d4aa6a", color: "#2c1e10" }}>ATLAS</div>
                        </div>
                        {/* CTA */}
                        <div className="h-5 w-16 border-2 text-[8px] font-black flex items-center justify-center relative z-10" style={{ borderColor: "#b8956a", background: currentAccent, color: "#fff", boxShadow: "2px 2px 0 #b8956a" }}>
                          Jelajahi
                        </div>
                      </div>
                    )}
                    {key === "atlas" && (
                      <div className="absolute inset-0 flex flex-col justify-end p-2.5" style={{ background: "#ffffff" }}>
                        {/* grid lines */}
                        <div className="absolute inset-0 rounded-lg" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.06) 1px,transparent 1px)", backgroundSize: "10px 10px" }} />
                        {/* thin card */}
                        <div className="absolute top-3 left-3 right-3 h-8 border rounded" style={{ background: "#ffffff", borderColor: "#1a1a1a" }}>
                          <div className="absolute inset-x-2 top-1.5 h-1 rounded-sm bg-gray-900 w-10" />
                          <div className="absolute inset-x-2 bottom-1.5 h-0.5 rounded-sm bg-gray-300 w-8" />
                        </div>
                        {/* pill label */}
                        <div className="flex gap-1 mb-1.5 relative z-10">
                          <div className="h-4 px-1.5 text-[7px] font-semibold flex items-center border" style={{ background: "transparent", borderColor: "#1a1a1a", color: "#0a0a0a", borderRadius: "2px" }}>PAKET</div>
                          <div className="h-4 px-1.5 text-[7px] font-semibold flex items-center border" style={{ background: "transparent", borderColor: "#1a1a1a", color: "#0a0a0a", borderRadius: "2px" }}>TOUR</div>
                        </div>
                        {/* CTA */}
                        <div className="h-5 w-16 border text-[8px] font-semibold flex items-center justify-center relative z-10" style={{ borderColor: "#1a1a1a", background: "#0a0a0a", color: "#ffffff", borderRadius: "4px" }}>
                          Lihat Tour
                        </div>
                      </div>
                    )}
                    {key === "console" && (
                      <div className="absolute inset-0 flex" style={{ background: "#ffffff" }}>
                        <div className="w-1/3 h-full border-r flex flex-col gap-1 p-1.5" style={{ borderColor: "#1a1a1a", background: "#fafafa" }}>
                          <div className="h-1.5 w-8 rounded-sm" style={{ background: currentAccent }} />
                          <div className="h-1 w-full rounded-sm bg-gray-300 mt-1.5" />
                          <div className="h-1 w-full rounded-sm" style={{ background: currentAccent }} />
                          <div className="h-1 w-full rounded-sm bg-gray-300" />
                          <div className="h-1 w-3/4 rounded-sm bg-gray-300" />
                        </div>
                        <div className="flex-1 relative" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.06) 1px,transparent 1px)", backgroundSize: "10px 10px" }}>
                          <div className="absolute top-2 left-2 right-2 h-6 border rounded" style={{ borderColor: "#1a1a1a" }} />
                          <div className="absolute bottom-2 left-2 h-3 w-10 rounded" style={{ background: "#0a0a0a" }} />
                        </div>
                      </div>
                    )}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-gray-100/70 dark:bg-gray-900/70 flex items-center justify-center rounded-lg">
                        <Lock size={16} className="text-gray-400" />
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

        {!isPro && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Tema Catalog, Bold, Tropical, Kawaii, Pixel Art, Globe & Atlas Map tersedia di paket Pro. Hubungi admin untuk upgrade.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
            {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Tema"}
          </button>
        </div>
      </div>

      {/* Font Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Font Website</h2>
          <p className="text-xs text-gray-500 mt-1">Pilih tipografi untuk seluruh halaman website</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FONTS.map(({ key, label, desc, sample }) => {
            const active = (data["site_font"] ?? "jost") === key;
            const cssVar = FONT_CSS_VAR[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setData((d) => ({ ...d, site_font: key }))}
                className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                  active
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <p
                  className="text-xl font-bold mb-0.5 leading-tight"
                  style={{ fontFamily: cssVar }}
                >
                  {sample}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <p className={`text-xs font-semibold ${active ? "text-blue-600" : "text-gray-800 dark:text-white"}`}>{label}</p>
                    <p className="text-[10px] text-gray-400 leading-snug">{desc}</p>
                  </div>
                  {active && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0">Aktif</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60">
            {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Font"}
          </button>
        </div>
      </div>
    </div>
  );
}
