"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, GripVertical, Save, ExternalLink } from "lucide-react";

/* ── Defaults (fallback kalau DB kosong) ── */
const DEFAULT_STORY = [
  "Kami mulai dengan satu paket ke Moskow dan St. Petersburg — di saat kebanyakan agen wisata Indonesia masih fokus di Eropa Barat dan Asia Tenggara. Hasilnya? Peserta kami pulang dengan cerita yang tidak bisa mereka temukan di majalah travel mana pun.",
  "Dari sana kami meluas. Kazakhstan dengan danau-danau terpencilnya. Uzbekistan dengan Samarkand yang biru. Kyrgyzstan yang masih sangat jarang disentuh traveler Indonesia. Tajikistan dengan jalan Pamir yang legendaris. Dan aurora borealis di Tromsø yang membuat kamera gemetar.",
  "Lebih dari 700 traveler Indonesia telah mempercayakan perjalanan mereka kepada kami. Sebagian besar kembali lagi — dengan mengajak keluarga atau teman yang penasaran dengan cerita mereka.",
];

const DEFAULT_VALUES = [
  { title: "Grup Kecil, Pengalaman Besar", desc: "Maksimal 10–12 orang per keberangkatan. Bukan rombongan bus — perjalanan yang terasa personal." },
  { title: "Pendampingan Penuh", desc: "Dari proses visa, tiket, akomodasi, hingga kepulangan — semuanya kami handle dengan transparan." },
  { title: "Itinerary Manusiawi", desc: "Tidak terburu-buru, tidak terlalu padat. Kami beri ruang untuk menikmati, bukan sekadar centang daftar." },
  { title: "Informasi Terkini", desc: "Kami update kondisi visa, situasi lapangan, dan tips lokal sebelum setiap keberangkatan." },
];

const DEFAULT_DESTINATIONS = [
  { label: "Rusia", sub: "Moskow · St. Petersburg · Trans-Siberian" },
  { label: "Kazakhstan", sub: "Almaty · Astana · Danau Kaindy" },
  { label: "Kyrgyzstan", sub: "Bishkek · Issyk-Kul · Song Kol" },
  { label: "Uzbekistan", sub: "Tashkent · Samarkand · Bukhara" },
  { label: "Tajikistan", sub: "Dushanbe · Pamir Highway" },
  { label: "Aurora Borealis", sub: "Tromsø · Murmansk · Lapland" },
];

interface ValueItem { title: string; desc: string; }
interface DestItem   { label: string; sub: string; }

function saved(key: string) {
  return `about_${key}`;
}

async function saveKeys(data: Record<string, string>) {
  return fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/* ── Reusable save-badge ── */
function SaveBadge({ saving, ok }: { saving: boolean; ok: boolean }) {
  if (saving) return <span className="text-xs text-gray-400 animate-pulse">Menyimpan…</span>;
  if (ok)     return <span className="flex items-center gap-1 text-xs text-green-600"><Check size={12} /> Tersimpan</span>;
  return null;
}

/* ══════════════════════════════════════ */
export default function AdminAboutPage() {
  const [loaded, setLoaded]       = useState(false);

  /* Story */
  const [story, setStory]         = useState<string[]>(DEFAULT_STORY);
  const [savingStory, setSavingS] = useState(false);
  const [savedStory, setSavedS]   = useState(false);

  /* Values */
  const [values, setValues]         = useState<ValueItem[]>(DEFAULT_VALUES);
  const [savingValues, setSavingV]  = useState(false);
  const [savedValues, setSavedV]    = useState(false);

  /* Destinations */
  const [dests, setDests]           = useState<DestItem[]>(DEFAULT_DESTINATIONS);
  const [savingDests, setSavingD]   = useState(false);
  const [savedDests, setSavedD]     = useState(false);

  /* Hero tagline */
  const [tagline, setTagline]       = useState("");
  const [savingTag, setSavingTag]   = useState(false);
  const [savedTag, setSavedTag]     = useState(false);

  /* ── Load dari DB ── */
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then((d: Record<string, string>) => {
      if (d.about_tagline)      setTagline(d.about_tagline);
      if (d.about_story)        setStory(JSON.parse(d.about_story));
      if (d.about_values)       setValues(JSON.parse(d.about_values));
      if (d.about_destinations) setDests(JSON.parse(d.about_destinations));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  /* ── Save helpers ── */
  async function saveTagline() {
    setSavingTag(true);
    await saveKeys({ [saved("tagline")]: tagline });
    setSavingTag(false); setSavedTag(true);
    setTimeout(() => setSavedTag(false), 2500);
  }

  async function saveStory() {
    setSavingS(true);
    await saveKeys({ [saved("story")]: JSON.stringify(story) });
    setSavingS(false); setSavedS(true);
    setTimeout(() => setSavedS(false), 2500);
  }

  async function saveValues() {
    setSavingV(true);
    await saveKeys({ [saved("values")]: JSON.stringify(values) });
    setSavingV(false); setSavedV(true);
    setTimeout(() => setSavedV(false), 2500);
  }

  async function saveDests() {
    setSavingD(true);
    await saveKeys({ [saved("destinations")]: JSON.stringify(dests) });
    setSavingD(false); setSavedD(true);
    setTimeout(() => setSavedD(false), 2500);
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

      {/* ── 1. Tagline Hero ── */}
      <Section title="Tagline / Sub-judul Hero" hint="Kalimat pendek di bawah judul 'Tentang Kami'">
        <textarea
          rows={2}
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          placeholder="Contoh: Spesialis perjalanan ke Rusia, Asia Tengah & Aurora untuk traveler Indonesia."
          className={fieldCls}
        />
        <SectionFooter saving={savingTag} saved={savedTag} onSave={saveTagline} disabled={!tagline.trim()} />
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
        <SectionFooter saving={savingStory} saved={savedStory} onSave={saveStory} />
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
        <SectionFooter saving={savingValues} saved={savedValues} onSave={saveValues} />
      </Section>

      {/* ── 4. Destinasi ── */}
      <Section title="Destinasi yang Kami Spesialisasi" hint="Daftar destinasi + sub-lokasi (bisa tambah/hapus)">
        <div className="space-y-2">
          {dests.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
              <input
                type="text"
                value={d.label}
                placeholder="Nama destinasi"
                onChange={e => {
                  const arr = [...dests];
                  arr[i] = { ...arr[i], label: e.target.value };
                  setDests(arr);
                }}
                className={`${fieldCls} w-36`}
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
              <button
                onClick={() => setDests(dests.filter((_, j) => j !== i))}
                className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0">
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
        <SectionFooter saving={savingDests} saved={savedDests} onSave={saveDests} />
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

function SectionFooter({
  saving, saved, onSave, disabled = false,
}: { saving: boolean; saved: boolean; onSave: () => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button
        onClick={onSave}
        disabled={saving || disabled}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
        <Save size={13} /> {saving ? "Menyimpan…" : "Simpan"}
      </button>
      <SaveBadge saving={false} ok={saved} />
    </div>
  );
}
