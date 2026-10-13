"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import StickyFormActions from "@/components/admin/StickyFormActions";
import { sendJson } from "@/lib/admin-fetch";

/* ── Defaults (fallback kalau DB kosong) ── */
const DEFAULT_STORY = [
  "Sundaf Trip adalah biro perjalanan Indonesia yang dioperasikan oleh CV Sundaf Holiday Group, dengan fokus pada Rusia, Asia Tengah, aurora borealis, dan layanan visa.",
  "Rute perjalanan mencakup Moskow, St. Petersburg, Murmansk, Teriberka, serta kota dan bentang alam di Kazakhstan, Uzbekistan, Kyrgyzstan, dan Tajikistan.",
  "Pilih open trip dengan jadwal tetap atau rancang perjalanan privat. Tim membantu persiapan rute, dokumen, dan koordinasi sebelum keberangkatan.",
];

const DEFAULT_VALUES = [
  { title: "Rute dan jadwal jelas", desc: "Aktivitas, perpindahan kota, dan akomodasi dijelaskan sebelum memesan." },
  { title: "Visa dibantu dari awal", desc: "Kami bantu cek dokumen, alur pengajuan, dan risiko yang perlu kamu tahu sebelum berangkat." },
  { title: "Waktu perjalanan dan istirahat", desc: "Jadwal mencakup kegiatan, perjalanan antarkota, dan waktu istirahat." },
  { title: "Update kondisi lapangan", desc: "Sebelum berangkat, kami cek lagi cuaca, visa, rute, dan situasi destinasi." },
];

const DEFAULT_DESTINATIONS = [
  { label: "Rusia", sub: "Moskow · St. Petersburg · Murmansk · Teriberka" },
  { label: "Aurora Borealis", sub: "Perjalanan aurora di kawasan Rusia Arktik" },
  { label: "Kazakhstan", sub: "Almaty · Astana · Danau Kaindy · Charyn Canyon" },
  { label: "Uzbekistan", sub: "Tashkent · Samarkand · Bukhara" },
  { label: "Kyrgyzstan", sub: "Bishkek · Issyk-Kul · Song Kol" },
  { label: "Tajikistan", sub: "Dushanbe · Pamir Highway" },
];

interface ValueItem { title: string; desc: string; }
interface DestItem   { label: string; sub: string; }

function parseJsonSetting<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T : fallback;
  } catch {
    return fallback;
  }
}

/* ══════════════════════════════════════ */
export default function AboutForm() {
  const [loaded, setLoaded] = useState(false);
  const [story, setStory] = useState<string[]>(DEFAULT_STORY);
  const [values, setValues] = useState<ValueItem[]>(DEFAULT_VALUES);
  const [dests, setDests] = useState<DestItem[]>(DEFAULT_DESTINATIONS);
  const [tagline, setTagline] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  /* ── Load dari DB ── */
  useEffect(() => {
    fetch("/api/settings").then(r => {
      if (!r.ok) throw new Error("load failed");
      return r.json();
    }).then((d: Record<string, string>) => {
      if (d.about_tagline) setTagline(d.about_tagline);
      setStory(parseJsonSetting(d.about_story, DEFAULT_STORY));
      setValues(parseJsonSetting(d.about_values, DEFAULT_VALUES));
      setDests(parseJsonSetting(d.about_destinations, DEFAULT_DESTINATIONS));
      setLoaded(true);
    }).catch(() => {
      setLoadFailed(true);
      setMessage({ tone: "error", text: "Konten gagal dimuat. Muat ulang halaman sebelum menyimpan." });
      setLoaded(true);
    });
  }, []);

  async function saveAll() {
    setSaving(true);
    setMessage(null);
    const error = await sendJson("/api/settings", "PUT", {
      about_tagline: tagline,
      about_story: JSON.stringify(story.map((paragraph) => paragraph.trim()).filter(Boolean)),
      about_values: JSON.stringify(values.filter((item) => item.title.trim() || item.desc.trim())),
      about_destinations: JSON.stringify(dests.filter((item) => item.label.trim())),
    });
    setSaving(false);
    setMessage(error ? { tone: "error", text: error } : { tone: "ok", text: "Tersimpan. Halaman Tentang Kami sudah diperbarui." });
  }

  if (!loaded) return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat…</div>;

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Halaman Tentang Kami</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Kelola konten yang tampil di{" "}
            <a href="/about" target="_blank" className="text-blue-500 underline inline-flex items-center gap-1">
              /about <ExternalLink size={11} />
            </a>
          </p>
        </div>
      </div>
      <StickyFormActions
        loading={saving}
        disabled={loadFailed || !tagline.trim()}
        primaryLabel="Simpan"
        onSave={saveAll}
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

      {/* ── 1. Tagline Hero ── */}
      <Section title="Tagline / Sub-judul Hero" hint="Kalimat pendek di bawah judul 'Tentang Kami'">
        <textarea
          rows={2}
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          placeholder="Contoh: Visa, bahasa, cuaca, rute, sampai pertanyaan aman gak sih sering bikin maju-mundur duluan. Sundaf bantu beresin bagian ribetnya."
          className={fieldCls}
        />
      </Section>

      {/* ── 2. Cerita Kami ── */}
      <Section title="Cerita Kami" hint="Tiga paragraf kisah Sundaftrip (ditampilkan berurutan)">
        {story.map((p, i) => (
          <div key={i}>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Paragraf {i + 1}</label>
            <textarea
              rows={4}
              value={p}
              onChange={e => {
                const s = [...story];
                s[i] = e.target.value;
                setStory(s);
              }}
              className={fieldCls}
            />
          </div>
        ))}
      </Section>

      {/* ── 3. Nilai-nilai Kami ── */}
      <Section title="Cara Kami Bekerja" hint="Empat poin keunggulan Sundaftrip (ikon tetap, judul & deskripsi bisa diedit)">
        {values.map((v, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Judul #{i + 1}</label>
              <input
                type="text"
                value={v.title}
                onChange={e => {
                  const arr = [...values];
                  arr[i] = { ...arr[i], title: e.target.value };
                  setValues(arr);
                }}
                className={fieldCls}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Deskripsi #{i + 1}</label>
              <textarea
                rows={2}
                value={v.desc}
                onChange={e => {
                  const arr = [...values];
                  arr[i] = { ...arr[i], desc: e.target.value };
                  setValues(arr);
                }}
                className={fieldCls}
              />
            </div>
          </div>
        ))}
      </Section>

      {/* ── 4. Destinasi ── */}
      <Section title="Destinasi yang Kami Spesialisasi" hint="Daftar destinasi + sub-lokasi (bisa tambah/hapus)">
        <div className="space-y-2">
          {dests.map((d, i) => (
            <div key={i} className="flex items-start gap-2">
              <GripVertical size={14} className="text-gray-300 dark:text-gray-600 shrink-0 mt-3" />
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={d.label}
                  placeholder="Nama destinasi"
                  onChange={e => {
                    const arr = [...dests];
                    arr[i] = { ...arr[i], label: e.target.value };
                    setDests(arr);
                  }}
                  className={`${fieldCls} sm:w-48`}
                />
                <input
                  type="text"
                  value={d.sub}
                  placeholder="Sub-lokasi (pisah ·)"
                  onChange={e => {
                    const arr = [...dests];
                    arr[i] = { ...arr[i], sub: e.target.value };
                    setDests(arr);
                  }}
                  className={`${fieldCls} flex-1`}
                />
              </div>
              <button
                onClick={() => setDests(dests.filter((_, j) => j !== i))}
                title="Hapus destinasi"
                className="p-1.5 mt-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setDests([...dests, { label: "", sub: "" }])}
          className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 mt-2 font-medium">
          <Plus size={13} /> Tambah destinasi
        </button>
      </Section>

    </div>
  );
}

/* ── Helpers ── */
const fieldCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-y";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
        {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
