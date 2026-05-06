"use client";

import { useEffect, useState } from "react";

const FIELDS = [
  { key: "company_name", label: "Nama Perusahaan" },
  { key: "company_nib", label: "NIB" },
  { key: "company_address", label: "Alamat" },
  { key: "company_phone", label: "Telepon" },
  { key: "company_whatsapp", label: "WhatsApp" },
  { key: "company_email", label: "Email" },
  { key: "company_website", label: "Website" },
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Informasi perusahaan yang tampil di receipt dan website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        {FIELDS.map(({ key, label }) => (
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
    </div>
  );
}
