"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import StickyFormActions from "./StickyFormActions";

import type {
  GeoDestinationActivity,
  GeoDestinationBudgetItem,
  GeoDestinationContent,
  GeoDestinationGuideCard,
  GeoDestinationQuickFact,
  GeoDestinationQuickFactIcon,
  GeoDestinationTravelStep,
  GeoFaq,
  GeoPageContent,
  GeoSection,
} from "@/types/geo";

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
  content?: GeoDestinationContent | null;
  destination?: GeoDestinationContent | null;
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

function initialDestination(page?: GeoFormData | GeoPageContent): GeoDestinationContent | null {
  return page?.destination ?? ("content" in (page ?? {}) ? (page as GeoFormData).content ?? null : null);
}

function emptyQuickFact(): GeoDestinationQuickFact {
  return { icon: "map-pin", label: "", value: "" };
}

function emptyGuideCard(): GeoDestinationGuideCard {
  return { title: "", content: "" };
}

function emptyActivity(): GeoDestinationActivity {
  return { title: "", desc: "", img: "", video: "", credit: "" };
}

function emptyTravelStep(index: number): GeoDestinationTravelStep {
  return { step: String(index + 1).padStart(2, "0"), title: "", desc: "" };
}

function emptyBudgetItem(): GeoDestinationBudgetItem {
  return { item: "", range: "" };
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
  const [destination, setDestination] = useState<GeoDestinationContent | null>(() => initialDestination(page));

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDestination(updater: (value: GeoDestinationContent) => GeoDestinationContent) {
    setDestination((prev) => (prev ? updater(prev) : prev));
  }

  function updateQuickFact(index: number, key: keyof GeoDestinationQuickFact, value: string) {
    updateDestination((prev) => ({
      ...prev,
      quickFacts: prev.quickFacts.map((item, i) => (
        i === index ? { ...item, [key]: key === "icon" ? value as GeoDestinationQuickFactIcon : value } : item
      )),
    }));
  }

  function updateIntroParagraph(index: number, value: string) {
    updateDestination((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        paragraphs: prev.intro.paragraphs.map((paragraph, i) => (i === index ? value : paragraph)),
      },
    }));
  }

  function updateGuideCard(index: number, key: keyof GeoDestinationGuideCard, value: string) {
    updateDestination((prev) => ({
      ...prev,
      guide: {
        ...prev.guide,
        cards: prev.guide.cards.map((card, i) => (i === index ? { ...card, [key]: value } : card)),
      },
    }));
  }

  function updateActivity(index: number, key: keyof GeoDestinationActivity, value: string) {
    updateDestination((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        items: prev.activities.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
      },
    }));
  }

  function updateTravelStep(index: number, key: keyof GeoDestinationTravelStep, value: string) {
    updateDestination((prev) => ({
      ...prev,
      travel: {
        ...prev.travel,
        steps: prev.travel.steps.map((step, i) => (i === index ? { ...step, [key]: value } : step)),
      },
    }));
  }

  function updateBudgetItem(index: number, key: keyof GeoDestinationBudgetItem, value: string) {
    updateDestination((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        items: prev.budget.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
      },
    }));
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
      body: JSON.stringify({ ...form, sections: cleanedSections, faqs: cleanedFaqs, content: destination }),
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
      <StickyFormActions
        loading={loading}
        primaryLabel={isEdit ? "Simpan Perubahan" : "Buat Halaman GEO"}
        cancelHref="/admin/geo"
      />

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
            <label className="label mb-1">Ringkasan utama *</label>
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

      {destination && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Konten Halaman Destinasi</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Field ini mengatur isi utama halaman destinasi publik.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Hero</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">Label kecil</label>
                <input className="input" value={destination.hero.eyebrow} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, eyebrow: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Gambar Hero URL</label>
                <input className="input font-mono text-xs" value={destination.hero.image} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, image: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Judul baris 1</label>
                <input className="input" value={destination.hero.titleLine1} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, titleLine1: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Judul baris 2</label>
                <input className="input" value={destination.hero.titleLine2} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, titleLine2: e.target.value } }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label mb-1">Alt gambar</label>
                <input className="input" value={destination.hero.imageAlt} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, imageAlt: e.target.value } }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label mb-1">Deskripsi Hero</label>
                <textarea className="input min-h-[90px]" value={destination.hero.description} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">CTA jika paket tersedia</label>
                <input className="input" value={destination.hero.primaryCtaLabel} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, primaryCtaLabel: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">CTA jika paket belum ada</label>
                <input className="input" value={destination.hero.allToursCtaLabel} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, allToursCtaLabel: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">CTA WhatsApp</label>
                <input className="input" value={destination.hero.secondaryCtaLabel} onChange={(e) => updateDestination((prev) => ({ ...prev, hero: { ...prev.hero, secondaryCtaLabel: e.target.value } }))} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Fakta Cepat</h3>
              <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, quickFacts: [...prev.quickFacts, emptyQuickFact()] }))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 transition">
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="space-y-3">
              {destination.quickFacts.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[150px_1fr_1fr_auto] gap-3">
                  <select className="input" value={item.icon} onChange={(e) => updateQuickFact(index, "icon", e.target.value)}>
                    <option value="map-pin">Lokasi</option>
                    <option value="plane">Pesawat</option>
                    <option value="calendar">Kalender</option>
                    <option value="thermometer">Suhu</option>
                    <option value="wallet">Budget</option>
                  </select>
                  <input className="input" value={item.label} onChange={(e) => updateQuickFact(index, "label", e.target.value)} placeholder="Label" />
                  <input className="input" value={item.value} onChange={(e) => updateQuickFact(index, "value", e.target.value)} placeholder="Nilai" />
                  <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, quickFacts: prev.quickFacts.filter((_, i) => i !== index) }))}
                    className="inline-flex items-center justify-center px-3 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-950/30 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Tentang Destinasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">Label kecil</label>
                <input className="input" value={destination.intro.eyebrow} onChange={(e) => updateDestination((prev) => ({ ...prev, intro: { ...prev.intro, eyebrow: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Judul</label>
                <input className="input" value={destination.intro.title} onChange={(e) => updateDestination((prev) => ({ ...prev, intro: { ...prev.intro, title: e.target.value } }))} />
              </div>
            </div>
            <div className="space-y-3">
              {destination.intro.paragraphs.map((paragraph, index) => (
                <div key={index} className="flex gap-2">
                  <textarea className="input min-h-[90px]" value={paragraph} onChange={(e) => updateIntroParagraph(index, e.target.value)} placeholder={`Paragraf ${index + 1}`} />
                  <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, intro: { ...prev.intro, paragraphs: prev.intro.paragraphs.filter((_, i) => i !== index) } }))}
                    className="shrink-0 inline-flex items-center justify-center w-10 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-950/30 transition"
                    aria-label="Hapus paragraf">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, intro: { ...prev.intro, paragraphs: [...prev.intro.paragraphs, ""] } }))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 transition">
                <Plus size={14} /> Tambah Paragraf
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Panduan</h3>
              <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, guide: { ...prev.guide, cards: [...prev.guide.cards, emptyGuideCard()] } }))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 transition">
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">Label kecil</label>
                <input className="input" value={destination.guide.eyebrow} onChange={(e) => updateDestination((prev) => ({ ...prev, guide: { ...prev.guide, eyebrow: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Judul</label>
                <input className="input" value={destination.guide.title} onChange={(e) => updateDestination((prev) => ({ ...prev, guide: { ...prev.guide, title: e.target.value } }))} />
              </div>
            </div>
            <div className="space-y-3">
              {destination.guide.cards.map((card, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
                  <input className="input" value={card.title} onChange={(e) => updateGuideCard(index, "title", e.target.value)} placeholder="Judul poin" />
                  <textarea className="input min-h-[76px]" value={card.content} onChange={(e) => updateGuideCard(index, "content", e.target.value)} placeholder="Isi poin" />
                  <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, guide: { ...prev.guide, cards: prev.guide.cards.filter((_, i) => i !== index) } }))}
                    className="inline-flex items-center justify-center px-3 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-950/30 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Aktivitas</h3>
              <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, activities: { ...prev.activities, items: [...prev.activities.items, emptyActivity()] } }))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 transition">
                <Plus size={14} /> Tambah Aktivitas
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">Label kecil</label>
                <input className="input" value={destination.activities.eyebrow} onChange={(e) => updateDestination((prev) => ({ ...prev, activities: { ...prev.activities, eyebrow: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Judul</label>
                <input className="input" value={destination.activities.title} onChange={(e) => updateDestination((prev) => ({ ...prev, activities: { ...prev.activities, title: e.target.value } }))} />
              </div>
            </div>
            <div className="space-y-4">
              {destination.activities.items.map((activity, index) => (
                <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Aktivitas {index + 1}</p>
                    <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, activities: { ...prev.activities, items: prev.activities.items.filter((_, i) => i !== index) } }))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition">
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="input" value={activity.title} onChange={(e) => updateActivity(index, "title", e.target.value)} placeholder="Judul aktivitas" />
                    <input className="input font-mono text-xs" value={activity.img} onChange={(e) => updateActivity(index, "img", e.target.value)} placeholder="URL gambar/poster" />
                    <input className="input font-mono text-xs" value={activity.video ?? ""} onChange={(e) => updateActivity(index, "video", e.target.value)} placeholder="URL video, opsional" />
                    <input className="input" value={activity.credit ?? ""} onChange={(e) => updateActivity(index, "credit", e.target.value)} placeholder="Credit foto, opsional" />
                    <textarea className="input min-h-[90px] md:col-span-2" value={activity.desc} onChange={(e) => updateActivity(index, "desc", e.target.value)} placeholder="Deskripsi aktivitas" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Perjalanan dari Indonesia</h3>
              <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, travel: { ...prev.travel, steps: [...prev.travel.steps, emptyTravelStep(prev.travel.steps.length)] } }))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 transition">
                <Plus size={14} /> Tambah Langkah
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">Label kecil</label>
                <input className="input" value={destination.travel.eyebrow} onChange={(e) => updateDestination((prev) => ({ ...prev, travel: { ...prev.travel, eyebrow: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Judul</label>
                <input className="input" value={destination.travel.title} onChange={(e) => updateDestination((prev) => ({ ...prev, travel: { ...prev.travel, title: e.target.value } }))} />
              </div>
            </div>
            <div className="space-y-3">
              {destination.travel.steps.map((step, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[90px_1fr_2fr_auto] gap-3">
                  <input className="input" value={step.step} onChange={(e) => updateTravelStep(index, "step", e.target.value)} placeholder="01" />
                  <input className="input" value={step.title} onChange={(e) => updateTravelStep(index, "title", e.target.value)} placeholder="Judul langkah" />
                  <textarea className="input min-h-[76px]" value={step.desc} onChange={(e) => updateTravelStep(index, "desc", e.target.value)} placeholder="Deskripsi langkah" />
                  <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, travel: { ...prev.travel, steps: prev.travel.steps.filter((_, i) => i !== index) } }))}
                    className="inline-flex items-center justify-center px-3 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-950/30 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Budget</h3>
              <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, budget: { ...prev.budget, items: [...prev.budget.items, emptyBudgetItem()] } }))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 transition">
                <Plus size={14} /> Tambah Item
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">Label kecil</label>
                <input className="input" value={destination.budget.eyebrow} onChange={(e) => updateDestination((prev) => ({ ...prev, budget: { ...prev.budget, eyebrow: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Judul</label>
                <input className="input" value={destination.budget.title} onChange={(e) => updateDestination((prev) => ({ ...prev, budget: { ...prev.budget, title: e.target.value } }))} />
              </div>
            </div>
            <div className="space-y-3">
              {destination.budget.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                  <input className="input" value={item.item} onChange={(e) => updateBudgetItem(index, "item", e.target.value)} placeholder="Item budget" />
                  <input className="input" value={item.range} onChange={(e) => updateBudgetItem(index, "range", e.target.value)} placeholder="Range harga" />
                  <button type="button" onClick={() => updateDestination((prev) => ({ ...prev, budget: { ...prev.budget, items: prev.budget.items.filter((_, i) => i !== index) } }))}
                    className="inline-flex items-center justify-center px-3 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-red-950/30 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1">Label total</label>
                <input className="input" value={destination.budget.totalLabel} onChange={(e) => updateDestination((prev) => ({ ...prev, budget: { ...prev.budget, totalLabel: e.target.value } }))} />
              </div>
              <div>
                <label className="label mb-1">Nilai total</label>
                <input className="input" value={destination.budget.totalValue} onChange={(e) => updateDestination((prev) => ({ ...prev, budget: { ...prev.budget, totalValue: e.target.value } }))} />
              </div>
              <div className="md:col-span-2">
                <label className="label mb-1">Catatan budget</label>
                <textarea className="input min-h-[80px]" value={destination.budget.note} onChange={(e) => updateDestination((prev) => ({ ...prev, budget: { ...prev.budget, note: e.target.value } }))} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Fallback Jika Paket Belum Ada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input" value={destination.emptyTours.icon} onChange={(e) => updateDestination((prev) => ({ ...prev, emptyTours: { ...prev.emptyTours, icon: e.target.value } }))} placeholder="Icon/teks kecil" />
              <input className="input" value={destination.emptyTours.title} onChange={(e) => updateDestination((prev) => ({ ...prev, emptyTours: { ...prev.emptyTours, title: e.target.value } }))} placeholder="Judul" />
              <input className="input" value={destination.emptyTours.ctaLabel} onChange={(e) => updateDestination((prev) => ({ ...prev, emptyTours: { ...prev.emptyTours, ctaLabel: e.target.value } }))} placeholder="Label tombol" />
              <input className="input font-mono text-sm" value={destination.emptyTours.ctaHref} onChange={(e) => updateDestination((prev) => ({ ...prev, emptyTours: { ...prev.emptyTours, ctaHref: e.target.value } }))} placeholder="/tours" />
              <textarea className="input min-h-[90px] md:col-span-2" value={destination.emptyTours.description} onChange={(e) => updateDestination((prev) => ({ ...prev, emptyTours: { ...prev.emptyTours, description: e.target.value } }))} placeholder="Deskripsi fallback" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">CTA Akhir</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input" value={destination.finalCta.title} onChange={(e) => updateDestination((prev) => ({ ...prev, finalCta: { ...prev.finalCta, title: e.target.value } }))} placeholder="Judul CTA" />
              <input className="input" value={destination.finalCta.buttonLabel} onChange={(e) => updateDestination((prev) => ({ ...prev, finalCta: { ...prev.finalCta, buttonLabel: e.target.value } }))} placeholder="Label tombol" />
              <textarea className="input min-h-[90px] md:col-span-2" value={destination.finalCta.description} onChange={(e) => updateDestination((prev) => ({ ...prev, finalCta: { ...prev.finalCta, description: e.target.value } }))} placeholder="Deskripsi CTA akhir" />
            </div>
          </div>
        </div>
      )}

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

    </form>
  );
}
