"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import StickyFormActions from "@/components/admin/StickyFormActions";

/* ── Defaults (fallback kalau DB kosong) ── */
const DEFAULT_STORY = [
  "Sundaftrip berawal dari rasa penasaran sama tempat-tempat yang jarang masuk daftar liburan orang Indonesia. Bukan cuma Paris, Tokyo, atau Korea, tapi Rusia saat musim dingin, kota tua di Asia Tengah, dan negeri-negeri bekas Uni Soviet yang ceritanya panjang banget.",
  "Dari perjalanan kecil, kami belajar satu hal: destinasi terbaik sering bukan yang paling ramai di timeline, tapi yang bikin kamu pulang bawa cerita berbeda.",
  "Lama-lama rutenya makin serius. Moskow dan St. Petersburg. Murmansk buat berburu aurora. Kazakhstan dengan danau birunya. Uzbekistan dengan Samarkand yang megah. Kyrgyzstan yang alamnya masih liar. Tajikistan dengan jalan Pamir yang legend banget.",
  "Sekarang 1500+ traveler Indonesia sudah kami bantu berangkat. Ada yang pertama kali ke Rusia, ada yang deg-degan urus visa, ada juga yang pulang-pulang malah ngajak keluarga dan teman buat ikut batch berikutnya.",
];

const DEFAULT_VALUES = [
  { title: "Grup kecil, cerita besar", desc: "Bukan rombongan bus yang buru-buru turun foto lalu naik lagi. Ritmenya kami jaga supaya tetap enak dinikmati." },
  { title: "Visa dibantu dari awal", desc: "Kami bantu cek dokumen, alur pengajuan, dan risiko yang perlu kamu tahu sebelum berangkat." },
  { title: "Itinerary tetap manusiawi", desc: "Ada waktu explore, ada waktu istirahat, ada ruang buat benar-benar merasa sedang jalan-jalan." },
  { title: "Update kondisi lapangan", desc: "Sebelum berangkat, kami cek lagi cuaca, visa, rute, dan situasi destinasi." },
];

const DEFAULT_DESTINATIONS = [
  { label: "Rusia", sub: "Moskow · St. Petersburg · Murmansk · Teriberka" },
  { label: "Aurora Borealis", sub: "Berburu cahaya utara tanpa harus nebak semua sendiri" },
  { label: "Kazakhstan", sub: "Almaty · Astana · Danau Kaindy · Charyn Canyon" },
  { label: "Uzbekistan", sub: "Tashkent · Samarkand · Bukhara" },
  { label: "Kyrgyzstan", sub: "Bishkek · Issyk-Kul · Song Kol" },
  { label: "Tajikistan", sub: "Dushanbe · Pamir Highway" },
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
  async function saveAll() {
    setSavingTag(true);
    setSavingS(true);
    setSavingV(true);
    setSavingD(true);
    await saveKeys({
      [saved("tagline")]: tagline,
      [saved("story")]: JSON.stringify(story),
      [saved("values")]: JSON.stringify(values),
      [saved("destinations")]: JSON.stringify(dests),
    });
    setSavingTag(false);
    setSavingS(false);
    setSavingV(false);
    setSavingD(false);
    setSavedTag(true);
    setSavedS(true);
    setSavedV(true);
    setSavedD(true);
    setTimeout(() => {
      setSavedTag(false);
      setSavedS(false);
      setSavedV(false);
      setSavedD(false);
    }, 2500);
  }

  if (!loaded) return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat…</div>;

  const savingAll = savingTag || savingStory || savingValues || savingDests;
  const savedAll = savedTag && savedStory && savedValues && savedDests;

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
        loading={savingAll}
        disabled={!tagline.trim()}
        primaryLabel={savedAll ? "Tersimpan!" : "Simpan Semua"}
        onSave={saveAll}
      />

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
