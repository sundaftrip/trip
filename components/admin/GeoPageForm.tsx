"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { GeoFaq, GeoPageContent, GeoSection } from "@/types/geo";

interface GeoFormData {
  id?: string;
  routePath: string;
  title: string;
  eyebrow?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  answer: string;
  primaryCtaLabel?: string | null;
  primaryCtaHref?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
  sections?: GeoSection[] | null;
  faqs?: GeoFaq[] | null;
  schemaType?: string | null;
  published?: boolean;
  order?: number;
}

function jsonText(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

export default function GeoPageForm({ page }: { page?: GeoFormData | GeoPageContent }) {
  const router = useRouter();
  const isEdit = "id" in (page ?? {}) && !!(page as GeoFormData | undefined)?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initial = useMemo(() => ({
    routePath: page?.routePath ?? "",
    title: page?.title ?? "",
    eyebrow: page?.eyebrow ?? "",
    metaTitle: page?.metaTitle ?? "",
    metaDescription: page?.metaDescription ?? "",
    answer: page?.answer ?? "",
    primaryCtaLabel: page?.primaryCtaLabel ?? "",
    primaryCtaHref: page?.primaryCtaHref ?? "",
    secondaryCtaLabel: page?.secondaryCtaLabel ?? "",
    secondaryCtaHref: page?.secondaryCtaHref ?? "",
    schemaType: page?.schemaType ?? "WebPage",
    published: page?.published ?? true,
    order: (page as GeoFormData | undefined)?.order ?? 0,
  }), [page]);

  const [form, setForm] = useState(initial);
  const [sectionsText, setSectionsText] = useState(jsonText(page?.sections));
  const [faqsText, setFaqsText] = useState(jsonText(page?.faqs));

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    let sections: unknown;
    let faqs: unknown;
    try {
      sections = JSON.parse(sectionsText || "[]");
      faqs = JSON.parse(faqsText || "[]");
    } catch {
      setError("Sections dan FAQ harus berupa JSON valid.");
      return;
    }

    setLoading(true);
    const res = await fetch(isEdit ? `/api/geo-pages/${(page as GeoFormData).id}` : "/api/geo-pages", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sections, faqs }),
    });
    setLoading(false);

    if (res.ok) {
      router.push("/admin/geo");
      router.refresh();
      return;
    }
    const payload = await res.json().catch(() => null);
    setError(payload?.error ?? "Gagal menyimpan halaman GEO.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label mb-1">Route Path *</label>
            <input required className="input font-mono text-sm" value={form.routePath} onChange={(e) => set("routePath", e.target.value)} placeholder="/visa-rusia-wni" />
          </div>
          <div>
            <label className="label mb-1">Schema Type</label>
            <input className="input" value={form.schemaType} onChange={(e) => set("schemaType", e.target.value)} placeholder="WebPage / CollectionPage / Article" />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1">Title *</label>
            <input required className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className="label mb-1">Eyebrow</label>
            <input className="input" value={form.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value)} />
          </div>
          <div>
            <label className="label mb-1">Meta Title</label>
            <input className="input" value={form.metaTitle ?? ""} onChange={(e) => set("metaTitle", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1">Meta Description</label>
            <textarea className="input min-h-[80px]" value={form.metaDescription ?? ""} onChange={(e) => set("metaDescription", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1">Jawaban Singkat *</label>
            <textarea required className="input min-h-[120px]" value={form.answer} onChange={(e) => set("answer", e.target.value)} />
          </div>
          <div>
            <label className="label mb-1">Primary CTA Label</label>
            <input className="input" value={form.primaryCtaLabel ?? ""} onChange={(e) => set("primaryCtaLabel", e.target.value)} />
          </div>
          <div>
            <label className="label mb-1">Primary CTA Href</label>
            <input className="input font-mono text-sm" value={form.primaryCtaHref ?? ""} onChange={(e) => set("primaryCtaHref", e.target.value)} />
          </div>
          <div>
            <label className="label mb-1">Secondary CTA Label</label>
            <input className="input" value={form.secondaryCtaLabel ?? ""} onChange={(e) => set("secondaryCtaLabel", e.target.value)} />
          </div>
          <div>
            <label className="label mb-1">Secondary CTA Href</label>
            <input className="input font-mono text-sm" value={form.secondaryCtaHref ?? ""} onChange={(e) => set("secondaryCtaHref", e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="published" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 rounded" />
          <label htmlFor="published" className="text-sm text-gray-700 dark:text-gray-300">Published</label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <label className="label mb-2">Sections JSON</label>
          <textarea className="input min-h-[320px] font-mono text-xs" value={sectionsText} onChange={(e) => setSectionsText(e.target.value)} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <label className="label mb-2">FAQ JSON</label>
          <textarea className="input min-h-[320px] font-mono text-xs" value={faqsText} onChange={(e) => setFaqsText(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition">
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Halaman GEO"}
        </button>
        <button type="button" onClick={() => router.push("/admin/geo")}
          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 transition">
          Batal
        </button>
      </div>
    </form>
  );
}
