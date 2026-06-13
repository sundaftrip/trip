"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

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

interface EditableSection {
  title: string;
  body: string;
  items: string[];
}

function normalizeSections(value?: GeoSection[] | null): EditableSection[] {
  return (value ?? []).map((section) => ({
    title: section.title ?? "",
    body: section.body ?? "",
    items: section.items && section.items.length > 0 ? section.items : [""],
  }));
}

function normalizeFaqs(value?: GeoFaq[] | null): GeoFaq[] {
  return (value ?? []).map((faq) => ({
    question: faq.question ?? "",
    answer: faq.answer ?? "",
  }));
}

function emptySection(): EditableSection {
  return { title: "", body: "", items: [""] };
}

function emptyFaq(): GeoFaq {
  return { question: "", answer: "" };
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
  const [sections, setSections] = useState<EditableSection[]>(() => normalizeSections(page?.sections));
  const [faqs, setFaqs] = useState<GeoFaq[]>(() => normalizeFaqs(page?.faqs));

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSection(index: number, key: keyof EditableSection, value: string | string[]) {
    setSections((prev) => prev.map((section, i) => (i === index ? { ...section, [key]: value } : section)));
  }

  function updateSectionItem(sectionIndex: number, itemIndex: number, value: string) {
    setSections((prev) => prev.map((section, i) => {
      if (i !== sectionIndex) return section;
      return {
        ...section,
        items: section.items.map((item, j) => (j === itemIndex ? value : item)),
      };
    }));
  }

  function addSectionItem(sectionIndex: number) {
    setSections((prev) => prev.map((section, i) => (
      i === sectionIndex ? { ...section, items: [...section.items, ""] } : section
    )));
  }

  function removeSectionItem(sectionIndex: number, itemIndex: number) {
    setSections((prev) => prev.map((section, i) => {
      if (i !== sectionIndex) return section;
      const nextItems = section.items.filter((_, j) => j !== itemIndex);
      return { ...section, items: nextItems.length > 0 ? nextItems : [""] };
    }));
  }

  function updateFaq(index: number, key: keyof GeoFaq, value: string) {
    setFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, [key]: value } : faq)));
  }

  function cleanSections(): GeoSection[] | null {
    const rows = sections.map((section) => ({
      title: section.title.trim(),
      body: section.body.trim(),
      items: section.items.map((item) => item.trim()).filter(Boolean),
    }));

    const incomplete = rows.find((section) => !section.title && (section.body || section.items.length > 0));
    if (incomplete) {
      setError("Judul konten tambahan wajib diisi jika isi atau poin sudah ditulis.");
      return null;
    }

    return rows
      .filter((section) => section.title)
      .map((section) => ({
        title: section.title,
        body: section.body || undefined,
        items: section.items.length > 0 ? section.items : undefined,
      }));
  }

  function cleanFaqs(): GeoFaq[] | null {
    const rows = faqs.map((faq) => ({
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    }));

    const incomplete = rows.find((faq) => (faq.question && !faq.answer) || (!faq.question && faq.answer));
    if (incomplete) {
      setError("Setiap FAQ harus punya pertanyaan dan jawaban.");
      return null;
    }

    return rows.filter((faq) => faq.question && faq.answer);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanedSections = cleanSections();
    if (!cleanedSections) return;
    const cleanedFaqs = cleanFaqs();
    if (!cleanedFaqs) return;

    setLoading(true);
    const res = await fetch(isEdit ? `/api/geo-pages/${(page as GeoFormData).id}` : "/api/geo-pages", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sections: cleanedSections, faqs: cleanedFaqs }),
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

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Konten Tambahan</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gunakan jika halaman perlu blok penjelasan ekstra.</p>
          </div>
          <button type="button" onClick={() => setSections((prev) => [...prev, emptySection()])}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
            <Plus size={16} /> Tambah Konten
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Belum ada konten tambahan.
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900 dark:text-white">Konten {sectionIndex + 1}</p>
                  <button type="button" onClick={() => setSections((prev) => prev.filter((_, i) => i !== sectionIndex))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition">
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
                <div>
                  <label className="label mb-1">Judul</label>
                  <input className="input" value={section.title} onChange={(e) => updateSection(sectionIndex, "title", e.target.value)} placeholder="Contoh: Biaya dan Proses" />
                </div>
                <div>
                  <label className="label mb-1">Isi</label>
                  <textarea className="input min-h-[100px]" value={section.body} onChange={(e) => updateSection(sectionIndex, "body", e.target.value)} placeholder="Tulis paragraf penjelasan singkat." />
                </div>
                <div className="space-y-2">
                  <label className="label">Poin-poin</label>
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2">
                      <input className="input" value={item} onChange={(e) => updateSectionItem(sectionIndex, itemIndex, e.target.value)} placeholder={`Poin ${itemIndex + 1}`} />
                      <button type="button" onClick={() => removeSectionItem(sectionIndex, itemIndex)}
                        className="shrink-0 inline-flex items-center justify-center w-10 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-950/30 transition"
                        aria-label="Hapus poin">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addSectionItem(sectionIndex)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition">
                    <Plus size={14} /> Tambah Poin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pertanyaan dan Jawaban</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">FAQ yang tampil di halaman dan membantu AI memahami jawaban.</p>
          </div>
          <button type="button" onClick={() => setFaqs((prev) => [...prev, emptyFaq()])}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
            <Plus size={16} /> Tambah FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Belum ada FAQ.
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900 dark:text-white">FAQ {index + 1}</p>
                  <button type="button" onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== index))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition">
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
                <div>
                  <label className="label mb-1">Pertanyaan</label>
                  <textarea className="input min-h-[76px]" value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)} placeholder="Contoh: Apakah WNI perlu visa untuk ke Rusia?" />
                </div>
                <div>
                  <label className="label mb-1">Jawaban</label>
                  <textarea className="input min-h-[110px]" value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} placeholder="Tulis jawaban yang jelas dan singkat." />
                </div>
              </div>
            ))}
          </div>
        )}
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
