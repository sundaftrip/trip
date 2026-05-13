"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

interface FaqItem {
  id: string;
  section: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

const SECTIONS = ["Umum", "Visa & Dokumen", "Pembayaran & Deposit", "Di Lapangan"];

const EMPTY: Omit<FaqItem, "id"> = {
  section: "Umum",
  question: "",
  answer: "",
  order: 0,
  active: true,
};

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<FaqItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/faq");
    // fetch all (admin sees all including inactive)
    const r = await fetch("/api/faq");
    const data = await r.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm(EMPTY);
  }

  function startEdit(item: FaqItem) {
    setEditing(item);
    setAdding(false);
    setForm({ section: item.section, question: item.question, answer: item.answer, order: item.order, active: item.active });
  }

  function cancelForm() {
    setAdding(false);
    setEditing(null);
    setForm(EMPTY);
  }

  async function handleSave() {
    if (!form.section || !form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    if (adding) {
      await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (editing) {
      await fetch(`/api/faq/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    cancelForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus FAQ ini?")) return;
    setDeleting(id);
    await fetch(`/api/faq/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  async function toggleActive(item: FaqItem) {
    await fetch(`/api/faq/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    load();
  }

  async function moveOrder(item: FaqItem, dir: "up" | "down") {
    const sectionItems = items.filter(i => i.section === item.section);
    const idx = sectionItems.findIndex(i => i.id === item.id);
    const target = dir === "up" ? sectionItems[idx - 1] : sectionItems[idx + 1];
    if (!target) return;
    await Promise.all([
      fetch(`/api/faq/${item.id}`,   { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: target.order }) }),
      fetch(`/api/faq/${target.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: item.order }) }),
    ]);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola pertanyaan yang tampil di <a href="/faq" target="_blank" className="text-blue-500 underline">/faq</a></p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus size={16} /> Tambah FAQ
        </button>
      </div>

      {/* Add / Edit Form */}
      {(adding || editing) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
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
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Jawaban</label>
            <textarea
              rows={4}
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Tulis jawaban lengkap..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-y"
            />
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
                    <li key={item.id} className={`px-5 py-4 ${!item.active ? "opacity-50" : ""}`}>
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
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.question}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.answer}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => toggleActive(item)} title={item.active ? "Sembunyikan" : "Tampilkan"}
                            className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
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
