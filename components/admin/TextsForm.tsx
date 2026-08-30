"use client";

import { useState } from "react";
import StickyFormActions from "./StickyFormActions";
import { changedValues, cmsErrorMessage, requestCmsJson } from "@/lib/cms-request";
import { TEXT_LABELS } from "@/lib/website-texts";

interface Section {
  section: string;
  keys: string[];
  hint?: string;
}

interface Props {
  sections: Section[];
  initialValues: Record<string, { id?: string; en?: string }>;
}

function labelFromKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
  const [baseline, setBaseline] = useState(values);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");

  function set(key: string, field: "id" | "en", value: string) {
    setSaved(false);
    setValues((p) => ({ ...p, [key]: { ...p[key], [field]: value } }));
  }

  async function handleSave() {
    if (saving) return;
    const snapshot = values;
    const changes = changedValues(snapshot, baseline);
    if (!Object.keys(changes).length) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await requestCmsJson("/api/texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      setBaseline(snapshot);
      setSaved(true);
    } catch (error) {
      setError(cmsErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <StickyFormActions
        loading={saving}
        disabled={!Object.keys(changedValues(values, baseline)).length}
        primaryLabel={saved ? "Tersimpan!" : "Simpan Semua"}
        onSave={handleSave}
      />
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}
      {saved && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">Perubahan tersimpan.</p>}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Bahasa:</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button onClick={() => setLang("id")} className={`px-4 py-1.5 text-sm font-medium transition ${lang === "id" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"}`}>🇮🇩 Indonesia</button>
          <button onClick={() => setLang("en")} className={`px-4 py-1.5 text-sm font-medium transition ${lang === "en" ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50"}`}>🇬🇧 English</button>
        </div>
      </div>
      {lang === "en" && <p className="text-sm text-gray-500">Arsip terjemahan lama, hanya baca. Bahasa Inggris pada tampilan aktif memakai penerjemah website dan belum mengambil nilai EN dari editor ini.</p>}

      {sections.map(({ section, keys, hint }) => (
        <div key={section} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{section}</h2>
          {hint && <p className="mb-4 text-sm text-gray-500">{hint}</p>}
          <div className="space-y-4">
            {keys.map((key) => (
              <div key={key}>
                <label htmlFor={`text-${key}`} className="label mb-1">{TEXT_LABELS[key] || labelFromKey(key)}</label>
                <textarea
                  id={`text-${key}`}
                  disabled={saving || lang === "en"}
                  rows={key === "hero_sundaf" ? 8 : 2}
                  className="input"
                  value={values[key]?.[lang] ?? ""}
                  onChange={(e) => set(key, lang, e.target.value)}
                  placeholder={`Teks ${TEXT_LABELS[key] || labelFromKey(key)} (${lang.toUpperCase()})`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
