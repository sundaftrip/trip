"use client";

import { useState } from "react";
import StickyFormActions from "./StickyFormActions";

interface Section {
  section: string;
  keys: string[];
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
  const [lang, setLang] = useState<"id" | "en">("id");

  function set(key: string, field: "id" | "en", value: string) {
    setValues((p) => ({ ...p, [key]: { ...p[key], [field]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/texts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <StickyFormActions
        loading={saving}
        primaryLabel={saved ? "Tersimpan!" : "Simpan Semua"}
        onSave={handleSave}
      />
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
                <textarea
                  rows={key === "hero_sundaf" ? 8 : 2}
                  className="input"
                  value={values[key]?.[lang] ?? ""}
                  onChange={(e) => set(key, lang, e.target.value)}
                  placeholder={`Teks ${labelFromKey(key)} (${lang.toUpperCase()})`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
}
