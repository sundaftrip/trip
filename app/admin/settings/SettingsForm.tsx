"use client";

import { useEffect, useState } from "react";
import StickyFormActions from "@/components/admin/StickyFormActions";
import ImageUpload from "@/components/admin/ImageUpload";
import { readApiError, sendJson } from "@/lib/admin-fetch";
import { COMPANY_SETTING_FIELDS } from "@/lib/company-settings";

export default function SettingsForm() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error(await readApiError(res, "Pengaturan gagal dimuat."));
        return res.json();
      })
      .then((values: Record<string, string>) => setData(values))
      .catch((error: unknown) => {
        setLoadFailed(true);
        setMessage({ tone: "error", text: `${error instanceof Error ? error.message : "Pengaturan gagal dimuat."} Muat ulang halaman sebelum menyimpan.` });
      })
      .finally(() => setLoaded(true));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const payload = Object.fromEntries(
      [...COMPANY_SETTING_FIELDS.map((field) => field.key), "company_logo"].map((key) => [key, data[key] ?? ""]),
    );
    const error = await sendJson("/api/settings", "PUT", payload);
    setSaving(false);
    setMessage(error ? { tone: "error", text: error } : { tone: "ok", text: "Pengaturan tersimpan dan website diperbarui." });
  }

  if (!loaded) return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Memuat…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Informasi perusahaan dan logo yang tampil di website.</p>
      </div>
      <StickyFormActions loading={saving} disabled={loadFailed} primaryLabel="Simpan" onSave={handleSave} />

      {message && (
        <div role={message.tone === "error" ? "alert" : "status"} className={`rounded-xl border p-4 text-sm ${
          message.tone === "error"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
        }`}>
          {message.text}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">Informasi perusahaan</h2>
        {COMPANY_SETTING_FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="label" htmlFor={`setting-${key}`}>{label}</label>
            <input id={`setting-${key}`} className="input" value={data[key] ?? ""}
              onChange={(e) => setData((current) => ({ ...current, [key]: e.target.value }))} />
            {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Logo</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Tampil di navigasi website, CMS, dan gambar bagikan. Pakai PNG transparan.</p>
        </div>
        <ImageUpload value={data.company_logo ?? ""} folder="travel" uploadLabel="Upload logo" keepOriginal
          onChange={(url) => setData((current) => ({ ...current, company_logo: url }))} />
      </section>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Tampilan website memakai tema Sundaf (Atlas) yang tetap; warna, font, dan tema tidak lagi diatur dari CMS.
      </p>
    </div>
  );
}
