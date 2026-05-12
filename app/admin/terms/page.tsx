"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function TermsPage() {
  const [bodyId, setBodyId] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/terms").then((r) => r.json()).then((d) => {
      setBodyId(d.bodyId ?? "");
      setBodyEn(d.bodyEn ?? "");
      setReady(true);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bodyId, bodyEn }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Syarat & Ketentuan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Konten halaman syarat dan ketentuan</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {saved ? "Tersimpan!" : saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setLang("id")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${lang === "id" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
        >
          Indonesia
        </button>
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition ${lang === "en" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
        >
          English
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {!ready ? (
          <div className="min-h-[300px] flex items-center justify-center text-gray-400 text-sm">Memuat konten...</div>
        ) : lang === "id" ? (
          <RichTextEditor key="id" value={bodyId} onChange={setBodyId} />
        ) : (
          <RichTextEditor key="en" value={bodyEn} onChange={setBodyEn} />
        )}
      </div>
    </div>
  );
}
