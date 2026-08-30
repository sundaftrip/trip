"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { cmsErrorMessage, requestCmsJson } from "@/lib/cms-request";
import { FAQ_SECTIONS } from "@/lib/faq-content";

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

type Group = "umum" | "visa";

const SECTIONS_BY_GROUP: Record<Group, string[]> = {
  umum: [...FAQ_SECTIONS.map((section) => section.title), "Umum", "Pembayaran & Deposit", "Di Lapangan"],
  visa: ["Teknis Schengen", "Profil Non-Standar", "Paspor & Riwayat", "Dokumen Sensitif", "Kasus Reject", "Pengurusan Visa via Sundaf", "Umum"],
};

const EMPTY: Omit<FaqItem, "id"> = {
  group: "umum",
  section: "Umum",
  question: "",
  answer: "",
  service: null,
  order: 0,
  active: true,
};

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadReady, setLoadReady] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<FaqItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [group, setGroup] = useState<Group>("umum");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [source, setSource] = useState<"default" | "cms">("default");
  const requestId = useRef(0);
  const formRef = useRef<HTMLDivElement>(null);
  const busy = saving || deleting !== null;

  async function load(g: Group = group) {
    const id = ++requestId.current;
    setLoading(true);
    setLoadReady(false);
    try {
      const [data, sourceData] = await Promise.all([
        requestCmsJson<FaqItem[]>(`/api/faq?all=true&group=${g}`),
        g === "umum" ? requestCmsJson<{ source: "default" | "cms" }>("/api/faq/source") : Promise.resolve(null),
      ]);
      if (!Array.isArray(data)) throw new Error("Data FAQ tidak valid.");
      if (id !== requestId.current) return;
      setItems(data);
      if (sourceData) setSource(sourceData.source);
      setLoadReady(true);
    } catch (error) {
      if (id !== requestId.current) return;
      setItems([]);
      setError(cmsErrorMessage(error));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      load(group);
      cancelForm();
    }, 0);
    return () => { window.clearTimeout(id); requestId.current += 1; };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [group]);

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
    if (busy || loading || !loadReady) return;
    if ((adding || editing) && !confirm("Tinggalkan perubahan FAQ yang belum disimpan?")) return;
    setAdding(true);
    setEditing(null);
    setForm({ ...EMPTY, group, section: SECTIONS_BY_GROUP[group][0], order: items.reduce((max, item) => Math.max(max, item.order), -1) + 1 });
  }

  function startEdit(item: FaqItem) {
    if (busy) return;
    if ((adding || editing) && !confirm("Tinggalkan perubahan FAQ yang belum disimpan?")) return;
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
    if (busy || !form.section || !form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await requestCmsJson(adding ? "/api/faq" : `/api/faq/${editing!.id}`, {
        method: adding ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      cancelForm();
      setNotice(group === "umum" && source !== "cms" ? "FAQ tersimpan sebagai data CMS. Aktifkan sumber CMS setelah memeriksa seluruh daftar." : "FAQ tersimpan.");
      await load();
    } catch (error) {
      setError(cmsErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (busy || !confirm("Hapus FAQ ini?")) return;
    setDeleting(id);
    setError("");
    setNotice("");
    try {
      await requestCmsJson(`/api/faq/${id}`, { method: "DELETE" });
      if (editing?.id === id) cancelForm();
      setNotice("FAQ dihapus.");
      await load();
    } catch (error) {
      setError(cmsErrorMessage(error));
    } finally {
      setDeleting(null);
    }
  }

  async function toggleActive(item: FaqItem) {
    if (busy || adding || editing) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await requestCmsJson(`/api/faq/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !item.active }) });
      setNotice("Status FAQ tersimpan.");
      await load();
    } catch (error) {
      setError(cmsErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function moveOrder(item: FaqItem, dir: "up" | "down") {
    if (busy || adding || editing) return;
    const sectionItems = items.filter(i => i.section === item.section).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    const idx = sectionItems.findIndex(i => i.id === item.id);
    const target = dir === "up" ? sectionItems[idx - 1] : sectionItems[idx + 1];
    if (!target) return;
    const targetIndex = sectionItems.indexOf(target);
    [sectionItems[idx], sectionItems[targetIndex]] = [sectionItems[targetIndex], sectionItems[idx]];
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await requestCmsJson("/api/faq/reorder", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: sectionItems.map((entry) => entry.id) }) });
      setNotice("Urutan FAQ tersimpan.");
      await load();
    } catch (error) {
      setError(cmsErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function changeSource() {
    if (busy || loading || !loadReady || adding || editing) return;
    const next = source === "cms" ? "default" : "cms";
    if (!confirm(next === "cms" ? "Gunakan daftar FAQ CMS di halaman /faq? Konten bawaan akan diganti, termasuk jika semua FAQ CMS disembunyikan atau kosong." : "Kembalikan halaman /faq ke konten bawaan? Data CMS tetap disimpan.")) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await requestCmsJson("/api/faq/source", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: next }) });
      setSource(next);
      setNotice(next === "cms" ? "Halaman /faq sekarang memakai data CMS." : "Halaman /faq kembali memakai konten bawaan.");
    } catch (error) {
      setError(cmsErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const sectionNames = [...new Set([...SECTIONS_BY_GROUP[group], ...items.map((item) => item.section)])];
  const grouped = sectionNames.map(sec => ({
    section: sec,
    faqs: items.filter(i => i.section === sec).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola pertanyaan di <a href="/faq" target="_blank" className="text-blue-500 underline">/faq</a> (Umum) &amp; <a href="/visa/faq" target="_blank" className="text-blue-500 underline">/visa/faq</a> (Visa)
          </p>
        </div>
        <button
          disabled={busy || loading || !loadReady}
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus size={16} /> Tambah FAQ
        </button>
      </div>
      {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error} <button type="button" disabled={busy} className="underline" onClick={() => { setError(""); void load(); }}>Muat ulang daftar</button></div>}
      {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
      {group === "umum" && <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-700">
        <p className="font-semibold">Sumber halaman /faq: {source === "cms" ? "Data CMS" : "Konten bawaan"}</p>
        <p className="mt-1 text-gray-500">{source === "cms" ? "Hanya FAQ aktif pada daftar ini yang tampil. Daftar kosong akan tetap kosong." : "Perubahan daftar di bawah belum mengganti FAQ publik. Periksa isinya, lalu aktifkan sumber CMS jika sudah siap."} FAQ beranda dikelola terpisah di Teks Website. FAQ Visa tetap memakai daftar Visa.</p>
        <button type="button" disabled={busy || loading || !loadReady || adding || !!editing} onClick={changeSource} className="mt-3 rounded-lg border border-gray-300 px-3 py-2 font-medium disabled:opacity-50">{source === "cms" ? "Gunakan konten bawaan" : "Gunakan FAQ CMS"}</button>
      </div>}

      {/* Tab grup */}
      <div className="flex gap-2">
        {([["umum", "FAQ Umum (/faq)"], ["visa", "FAQ Visa (/visa/faq)"]] as [Group, string][]).map(([g, label]) => (
          <button
            key={g}
            disabled={busy}
            onClick={() => { if ((adding || editing) && !confirm("Tinggalkan perubahan FAQ yang belum disimpan?")) return; setError(""); setNotice(""); setGroup(g); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              group === g
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      {(adding || editing) && (
        <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 scroll-mt-6">
          <fieldset disabled={busy} className="space-y-4 min-w-0">
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
                {sectionNames.map(s => <option key={s} value={s}>{s}</option>)}
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
              rows={group === "visa" ? 8 : 4}
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="Tulis jawaban lengkap..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-y font-mono"
            />
          </div>

          {group === "visa" && (
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
          )}

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
          </fieldset>
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
                          <button onClick={() => moveOrder(item, "up")} disabled={busy || adding || !!editing || idx === 0} aria-label={`Naikkan urutan ${item.question}`}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20">
                            <ChevronUp size={14} />
                          </button>
                          <button onClick={() => moveOrder(item, "down")} disabled={busy || adding || !!editing || idx === faqs.length - 1} aria-label={`Turunkan urutan ${item.question}`}
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
                            disabled={busy || adding || !!editing}
                            onClick={() => toggleActive(item)}
                            title={item.active ? "Sembunyikan dari website" : "Tampilkan di website"}
                            className={`p-1.5 rounded transition ${
                              item.active
                                ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                : "text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40"
                            }`}>
                            {item.active ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={() => startEdit(item)} disabled={busy} aria-label={`Edit ${item.question}`}
                            className="p-1.5 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} disabled={busy} aria-label={`Hapus ${item.question}`}
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
