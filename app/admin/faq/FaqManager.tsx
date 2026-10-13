"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { sendJson } from "@/lib/admin-fetch";

interface FaqItem {
  id: string;
  group: string;
  section: string;
  question: string;
  answer: string;
  service: string | null;
  order: number;
  active: boolean;
}

// Hanya grup "visa" yang dibaca website (/visa/faq dan /visa). FAQ umum di /faq
// berasal dari konten tetap di kode (lib/faq-content.ts).
const GROUP = "visa";
const SECTIONS = ["Teknis Schengen", "Profil Non-Standar", "Paspor & Riwayat", "Dokumen Sensitif", "Kasus Reject", "Pengurusan Visa via Sundaf", "Umum"];

const EMPTY: Omit<FaqItem, "id"> = {
  group: GROUP,
  section: SECTIONS[0],
  question: "",
  answer: "",
  service: null,
  order: 0,
  active: true,
};

export default function FaqManager() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<FaqItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/faq?all=true&group=${GROUP}`);
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("FAQ gagal dimuat. Muat ulang halaman.");
    }
    setLoading(false);
  }

  useEffect(() => {
    const id = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Scroll form into view whenever it opens
  useEffect(() => {
    if ((adding || editing) && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // Focus first input after scroll
      const first = formRef.current.querySelector<HTMLElement>("input, select, textarea");
      setTimeout(() => first?.focus(), 300);
    }
  }, [adding, editing]);

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ ...EMPTY });
  }

  function startEdit(item: FaqItem) {
    setEditing(item);
    setAdding(false);
    setForm({ group: item.group, section: item.section, question: item.question, answer: item.answer, service: item.service, order: item.order, active: item.active });
  }

  function cancelForm() {
    setAdding(false);
    setEditing(null);
    setForm(EMPTY);
  }

  async function handleSave() {
    if (!form.section || !form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    setError("");
    const failure = adding
      ? await sendJson("/api/faq", "POST", { ...form, group: GROUP })
      : editing
        ? await sendJson(`/api/faq/${editing.id}`, "PUT", form)
        : null;
    setSaving(false);
    if (failure) { setError(failure); return; }
    cancelForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus FAQ ini?")) return;
    setDeleting(id);
    const failure = await sendJson(`/api/faq/${id}`, "DELETE", undefined, "Gagal menghapus FAQ.");
    setDeleting(null);
    if (failure) setError(failure);
    load();
  }

  async function toggleActive(item: FaqItem) {
    const failure = await sendJson(`/api/faq/${item.id}`, "PUT", { active: !item.active });
    if (failure) setError(failure);
    load();
  }

  async function moveOrder(item: FaqItem, dir: "up" | "down") {
    const sectionItems = items.filter(i => i.section === item.section);
    const idx = sectionItems.findIndex(i => i.id === item.id);
    const target = dir === "up" ? sectionItems[idx - 1] : sectionItems[idx + 1];
    if (!target) return;
    const failures = await Promise.all([
      sendJson(`/api/faq/${item.id}`, "PUT", { order: target.order }),
      sendJson(`/api/faq/${target.id}`, "PUT", { order: item.order }),
    ]);
    const failure = failures.find(Boolean);
    if (failure) setError(failure);
    load();
  }

  const grouped = SECTIONS.map(sec => ({
    section: sec,
    faqs: items.filter(i => i.section === sec).sort((a, b) => a.order - b.order),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ Visa</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pertanyaan di <a href="/visa/faq" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">/visa/faq</a> dan ringkasan di halaman /visa.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus size={16} /> Tambah FAQ
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Tutup pesan" className="shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* Add / Edit Form */}
      {(adding || editing) && (
        <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 scroll-mt-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {adding ? "Tambah FAQ Baru" : "Edit FAQ"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Seksi</label>
              <select
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Urutan (angka kecil = lebih atas)</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pertanyaan</label>
            <input
              type="text"
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Tulis pertanyaan..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Jawaban <span className="font-normal text-gray-400">(boleh pakai HTML: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;&lt;li&gt;, &lt;a href&gt;)</span>
            </label>
            <textarea
              rows={8}
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Tulis jawaban lengkap..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-y font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tombol CTA / Layanan <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={form.service ?? ""}
              onChange={e => setForm(f => ({ ...f, service: e.target.value === "" ? null : e.target.value }))}
              placeholder='Kosongkan = CTA default. Ketik "__NONE__" = tanpa tombol. Atau teks tombol kustom.'
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-400">
              Kosong → tombol konsultasi default. <code className="text-gray-500">__NONE__</code> → sembunyikan tombol. Teks lain → jadi label tombol kustom.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di website</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.question.trim() || !form.answer.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              <Check size={14} /> {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={cancelForm}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition"
            >
              <X size={14} /> Batal
            </button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Memuat...</div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ section, faqs }) => (
            <div key={section} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{section}</span>
                <span className="text-xs text-gray-400">{faqs.length} item</span>
              </div>

              {faqs.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400 italic">Belum ada FAQ di seksi ini.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {faqs.map((item, idx) => (
                    <li key={item.id}
                      className={`px-5 py-4 transition-colors ${!item.active ? "bg-gray-50 dark:bg-gray-900/50" : ""}`}>
                      <div className="flex items-start gap-3">
                        {/* Order controls */}
                        <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                          <button onClick={() => moveOrder(item, "up")} disabled={idx === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20">
                            <ChevronUp size={14} />
                          </button>
                          <button onClick={() => moveOrder(item, "down")} disabled={idx === faqs.length - 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20">
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${item.active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                              {item.question}
                            </p>
                            {!item.active && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shrink-0">
                                <EyeOff size={9} /> Tersembunyi
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.answer}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleActive(item)}
                            title={item.active ? "Sembunyikan dari website" : "Tampilkan di website"}
                            className={`p-1.5 rounded transition ${
                              item.active
                                ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                : "text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40"
                            }`}>
                            {item.active ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={() => startEdit(item)}
                            className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                            className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-40">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
