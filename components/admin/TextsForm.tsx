"use client";

import { useState } from "react";
import StickyFormActions from "./StickyFormActions";
import ImageUpload from "./ImageUpload";

interface Section {
  section: string;
  keys: string[];
}

interface Props {
  sections: Section[];
  initialValues: Record<string, { id?: string; en?: string }>;
}

function labelFromKey(key: string) {
  const labels: Record<string, string> = {
    home_hero_eyebrow: "Label kecil hero",
    home_hero_title: "Judul utama hero",
    home_hero_body: "Deskripsi hero",
    home_hero_image: "Gambar latar hero",
    home_hero_image_alt: "Deskripsi aksesibilitas gambar",
    hero_eyebrow: "Label hero alternatif",
    hero_title: "Judul hero alternatif",
    hero_subtitle: "Deskripsi hero alternatif",
    hero_btn: "Teks tombol hero alternatif",
  };
  if (labels[key]) return labels[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function helpFromKey(key: string) {
  const help: Record<string, string> = {
    home_hero_eyebrow: "Teks kapital kecil di atas judul beranda.",
    home_hero_title: "Judul terbesar yang pertama dilihat pengunjung.",
    home_hero_body: "Ringkasan nilai layanan di bawah judul.",
    home_hero_image: "Dipakai sebagai gambar utama beranda pada desktop dan mobile.",
    home_hero_image_alt: "Jelaskan isi foto secara singkat untuk pembaca layar dan SEO gambar.",
  };
  return help[key] ?? "";
}

export default function TextsForm({ sections, initialValues }: Props) {
  const [values, setValues] = useState<Record<string, { id: string; en: string }>>(
    () => {
      const init: Record<string, { id: string; en: string }> = {};
      sections.forEach(({ keys }) =>
        keys.forEach((k) => {
          init[k] = { id: initialValues[k]?.id ?? "", en: initialValues[k]?.en ?? "" };
        })
      );
      return init;
    }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");

  function set(key: string, field: "id" | "en", value: string) {
    setValues((p) => ({ ...p, [key]: { ...p[key], [field]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Teks website gagal disimpan.");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Teks website gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <StickyFormActions
        loading={saving}
        primaryLabel={saved ? "Tersimpan!" : "Simpan Semua"}
        onSave={handleSave}
      />
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Bahasa:</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button onClick={() => setLang("id")} className={`px-4 py-1.5 text-sm font-medium transition ${lang === "id" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"}`}>🇮🇩 Indonesia</button>
          <button onClick={() => setLang("en")} className={`px-4 py-1.5 text-sm font-medium transition ${lang === "en" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"}`}>🇬🇧 English</button>
        </div>
      </div>

      {sections.map(({ section, keys }) => (
        <div key={section} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{section}</h2>
          <div className="space-y-4">
            {keys.map((key) => (
              <div key={key}>
                <label className="label mb-1">{labelFromKey(key)}</label>
                {helpFromKey(key) && (
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{helpFromKey(key)}</p>
                )}
                {key === "home_hero_image" ? (
                  <div>
                    <ImageUpload
                      value={values[key]?.id ?? ""}
                      onChange={(url) => set(key, "id", url)}
                      folder="site/home"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Gambar dipakai bersama untuk semua bahasa.
                    </p>
                  </div>
                ) : (
                  <textarea
                    rows={key === "home_hero_body" || key === "hero_subtitle" ? 3 : 2}
                    className="input"
                    value={values[key]?.[lang] ?? ""}
                    onChange={(e) => set(key, lang, e.target.value)}
                    placeholder={`Teks ${labelFromKey(key)} (${lang.toUpperCase()})`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
