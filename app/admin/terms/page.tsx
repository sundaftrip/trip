"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import StickyFormActions from "@/components/admin/StickyFormActions";
import { cmsErrorMessage, requestCmsJson } from "@/lib/cms-request";

export default function TermsPage() {
  const [bodyId, setBodyId] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [lang, setLang] = useState<"id" | "en">("id");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [baseline, setBaseline] = useState({ bodyId: "", bodyEn: "" });

  useEffect(() => {
    requestCmsJson<{ bodyId?: string | null; bodyEn?: string | null }>("/api/terms").then((d) => {
      if (!d || Array.isArray(d) || (d.bodyId != null && typeof d.bodyId !== "string") || (d.bodyEn != null && typeof d.bodyEn !== "string")) throw new Error("Konten syarat tidak valid. Muat ulang sebelum menyimpan.");
      setBodyId(d.bodyId ?? "");
      setBodyEn(d.bodyEn ?? "");
      setBaseline({ bodyId: d.bodyId ?? "", bodyEn: d.bodyEn ?? "" });
      setReady(true);
    }).catch((error) => setError(cmsErrorMessage(error)));
  }, []);

  async function handleSave() {
    if (!ready || saving) return;
    const snapshot = { bodyId, bodyEn };
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await requestCmsJson("/api/terms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      setBaseline(snapshot);
      setSaved(true);
    } catch (error) {
      setError(cmsErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const dirty = bodyId !== baseline.bodyId || bodyEn !== baseline.bodyEn;

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
        disabled={!ready || !dirty}
        primaryLabel={saved && !dirty ? "Tersimpan!" : "Simpan"}
        onSave={handleSave}
      />
      {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error} {!ready && <button type="button" className="underline" onClick={() => window.location.reload()}>Muat ulang</button>}</div>}
      {saved && !dirty && <p role="status" className="text-sm text-emerald-700">Perubahan tersimpan.</p>}

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
          <div className="min-h-[300px] flex items-center justify-center text-gray-400 text-sm">{error ? "Konten belum berhasil dimuat." : "Memuat konten..."}</div>
        ) : lang === "id" ? (
          <RichTextEditor key="id" value={bodyId} onChange={setBodyId} />
        ) : (
          <RichTextEditor key="en" value={bodyEn} onChange={setBodyEn} />
        )}
      </div>
    </div>
  );
}
