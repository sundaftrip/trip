"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import StickyFormActions from "@/components/admin/StickyFormActions";
import { sendJson } from "@/lib/admin-fetch";

export default function TermsEditor() {
  const [bodyId, setBodyId] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/terms").then((r) => r.json()).then((d) => {
      setBodyId(d.bodyId ?? "");
      setBodyEn(d.bodyEn ?? "");
      setReady(true);
    }).catch(() => setMessage({ tone: "error", text: "Konten gagal dimuat. Muat ulang halaman sebelum menyimpan." }));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const error = await sendJson("/api/terms", "PUT", { bodyId, bodyEn });
    setSaving(false);
    setMessage(error ? { tone: "error", text: error } : { tone: "ok", text: "Tersimpan. Halaman Syarat & Ketentuan sudah diperbarui." });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Syarat & Ketentuan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Konten halaman syarat dan ketentuan</p>
        </div>
      </div>
      <StickyFormActions
        loading={saving}
        disabled={!ready}
        primaryLabel="Simpan"
        onSave={handleSave}
      />
      {message && (
        <div role={message.tone === "error" ? "alert" : "status"} className={`rounded-xl border p-4 text-sm ${
          message.tone === "error"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 sm:inline-grid">
        <button
          onClick={() => setLang("id")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${lang === "id" ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 dark:text-gray-300"}`}
        >
          Indonesia
        </button>
        <button
          onClick={() => setLang("en")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${lang === "en" ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 dark:text-gray-300"}`}
        >
          English
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
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
