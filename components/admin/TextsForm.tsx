"use client";

import { useState } from "react";
import StickyFormActions from "./StickyFormActions";
import ImageUpload from "./ImageUpload";
import { sendJson } from "@/lib/admin-fetch";
import { HOME_TEXT_FIELDS } from "@/lib/home-text-fields";

interface Props {
  initialValues: Record<string, string>;
}

export default function TextsForm({ initialValues }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(HOME_TEXT_FIELDS.map((field) => [field.key, initialValues[field.key] ?? ""])),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const error = await sendJson("/api/texts", "PUT",
      Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { id: value.trim() }])));
    setSaving(false);
    setMessage(error ? { tone: "error", text: error } : { tone: "ok", text: "Tersimpan. Beranda sudah diperbarui." });
  }

  return (
    <div className="space-y-6">
      <StickyFormActions loading={saving} primaryLabel="Simpan" onSave={handleSave} />

      {message && (
        <div role={message.tone === "error" ? "alert" : "status"} className={`rounded-xl border p-4 text-sm ${
          message.tone === "error"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
        }`}>
          {message.text}
        </div>
      )}

      <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {HOME_TEXT_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="label mb-1" htmlFor={`text-${field.key}`}>{field.label}</label>
            {field.kind === "image" ? (
              <ImageUpload value={values[field.key] ?? ""} onChange={(url) => set(field.key, url)}
                folder="travel" uploadLabel="Upload foto beranda" publicImage />
            ) : field.kind === "textarea" ? (
              <textarea id={`text-${field.key}`} rows={3} maxLength={field.maxLength} className="input"
                value={values[field.key] ?? ""} placeholder={field.defaultValue}
                onChange={(e) => set(field.key, e.target.value)} />
            ) : (
              <input id={`text-${field.key}`} maxLength={field.maxLength} className="input"
                value={values[field.key] ?? ""} placeholder={field.defaultValue}
                onChange={(e) => set(field.key, e.target.value)} />
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.hint}</p>
          </div>
        ))}
      </section>

      <a href="/" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
        Lihat beranda
      </a>
    </div>
  );
}
