"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import StickyFormActions from "./StickyFormActions";

interface VisaVariantEntry {
  id?: string;
  name: string;
  priceIDR: number | null;
  processingTime: string;
  notes: string;
}

interface VisaDocEntry {
  name: string;
  hint: string;
}

interface VisaFaqEntry {
  question: string;
  answer: string;
}

interface CountryVisaEntry {
  id?: string;
  sortOrder: number;
  flag: string;
  name: string;
  en: string;
  region: string;
  visa: string;
  stay: string;
  cost: string;
  officialFee: string;
  servicePrice: string;
  notes: string;
  conditions?: string[];
  sourceUrl: string;
  lastVerifiedAt: string;
  variants?: VisaVariantEntry[];
  eligibility?: string[];
  documents?: VisaDocEntry[];
  faqs?: VisaFaqEntry[];
}

const REGIONS = [
  "Asia Tenggara",
  "Asia Timur",
  "Asia Selatan",
  "Asia Tengah",
  "Timur Tengah",
  "Eropa Schengen",
  "Eropa Non-Schengen",
  "Amerika",
  "Afrika",
  "Oseania",
];

const VISA_OPTIONS = [
  { value: "bebas", label: "Bebas Visa" },
  { value: "voa", label: "Visa on Arrival" },
  { value: "evisa", label: "E-Visa" },
  { value: "wajib", label: "Visa Wajib" },
  { value: "conditional", label: "Bersyarat" },
];

const empty: CountryVisaEntry = {
  sortOrder: 99,
  flag: "",
  name: "",
  en: "",
  region: "Asia Tenggara",
  visa: "wajib",
  stay: "",
  cost: "",
  officialFee: "",
  servicePrice: "",
  notes: "",
  conditions: [],
  sourceUrl: "",
  lastVerifiedAt: "",
  variants: [],
  eligibility: [],
  documents: [],
  faqs: [],
};

function emptyVariant(): VisaVariantEntry {
  return { name: "", priceIDR: null, processingTime: "", notes: "" };
}

export default function CountryVisaForm({ entry }: { entry?: CountryVisaEntry }) {
  const router = useRouter();
  const isEdit = Boolean(entry?.id);
  const [form, setForm] = useState<CountryVisaEntry>(() => ({
    ...(entry ?? empty),
    officialFee: entry?.officialFee ?? "",
    servicePrice: entry?.servicePrice ?? "",
    conditions: entry?.conditions ?? [],
    sourceUrl: entry?.sourceUrl ?? "",
    lastVerifiedAt: entry?.lastVerifiedAt ?? "",
    variants: entry?.variants ?? [],
    eligibility: entry?.eligibility ?? [],
    documents: entry?.documents ?? [],
    faqs: entry?.faqs ?? [],
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CountryVisaEntry>(key: K, value: CountryVisaEntry[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setVariant(index: number, patch: Partial<VisaVariantEntry>) {
    setForm((f) => {
      const next = [...(f.variants ?? [])];
      next[index] = { ...next[index], ...patch };
      return { ...f, variants: next };
    });
  }

  function addVariant() {
    setForm((f) => ({ ...f, variants: [...(f.variants ?? []), emptyVariant()] }));
  }

  function removeVariant(index: number) {
    setForm((f) => ({
      ...f,
      variants: (f.variants ?? []).filter((_, i) => i !== index),
    }));
  }

  function moveVariant(index: number, dir: -1 | 1) {
    setForm((f) => {
      const list = [...(f.variants ?? [])];
      const j = index + dir;
      if (j < 0 || j >= list.length) return f;
      [list[index], list[j]] = [list[j], list[index]];
      return { ...f, variants: list };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      sortOrder: Number(form.sortOrder) || 0,
      flag: form.flag.trim(),
      name: form.name.trim(),
      en: form.en.trim(),
      region: form.region,
      visa: form.visa,
      stay: form.stay.trim(),
      cost: form.cost.trim(),
      officialFee: form.officialFee.trim(),
      servicePrice: form.servicePrice.trim(),
      notes: form.notes.trim(),
      conditions: (form.conditions ?? []).map((c) => c.trim()).filter(Boolean),
      sourceUrl: form.sourceUrl.trim(),
      lastVerifiedAt: form.lastVerifiedAt,
      variants: (form.variants ?? []).map((v, i) => ({
        sortOrder: i,
        name: v.name.trim(),
        priceIDR:
          typeof v.priceIDR === "number" && Number.isFinite(v.priceIDR) && v.priceIDR >= 0
            ? v.priceIDR
            : null,
        processingTime: v.processingTime.trim(),
        notes: v.notes.trim(),
      })),
      eligibility: (form.eligibility ?? []).map((e) => e.trim()).filter(Boolean),
      documents: (form.documents ?? [])
        .map((d) => ({ name: d.name.trim(), hint: d.hint.trim() }))
        .filter((d) => d.name.length > 0),
      faqs: (form.faqs ?? [])
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question.length > 0 && f.answer.length > 0),
    };

    const res = await fetch(isEdit ? `/api/visa-database/${entry!.id}` : "/api/visa-database", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin/database-visa");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal menyimpan. Coba lagi.");
    }
  }

  const variants = form.variants ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium">
          {error}
        </div>
      )}
      <StickyFormActions
        loading={loading}
        primaryLabel={isEdit ? "Simpan Perubahan" : "Tambah Negara"}
        cancelHref="/admin/database-visa"
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Identitas Negara</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Bendera (emoji)">
            <input
              className="input"
              value={form.flag}
              onChange={(e) => set("flag", e.target.value)}
              placeholder="🇸🇬"
              maxLength={4}
            />
          </Field>
          <Field label="Nama (Indonesia) *">
            <input
              className="input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Singapura"
              required
            />
          </Field>
          <Field label="Nama (Inggris)">
            <input
              className="input"
              value={form.en}
              onChange={(e) => set("en", e.target.value)}
              placeholder="Singapore"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Wilayah">
            <select
              className="input"
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Urutan tampil (kecil dulu)">
            <input
              className="input"
              type="number"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
          </Field>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Persyaratan Visa</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Jenis Visa *">
            <select
              className="input"
              value={form.visa}
              onChange={(e) => set("visa", e.target.value)}
              required
            >
              {VISA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Maks. Tinggal">
            <input
              className="input"
              value={form.stay}
              onChange={(e) => set("stay", e.target.value)}
              placeholder="30 hari"
            />
          </Field>
        </div>

        <Field
          label="Biaya headline (di tabel /visa)"
          hint='Legacy. Pakai Official Fee + Harga Layanan untuk data baru. Kosongkan = fallback otomatis.'
        >
          <input
            className="input"
            value={form.cost}
            onChange={(e) => set("cost", e.target.value)}
            placeholder="Mulai Rp 300.000"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Official fee" hint="Biaya pemerintah/kedutaan. Contoh: Gratis, USD 50, CAD 7.">
            <input
              className="input"
              value={form.officialFee}
              onChange={(e) => set("officialFee", e.target.value)}
              placeholder="Gratis"
            />
          </Field>
          <Field label="Harga layanan Sundaf" hint="Harga jasa Sundaf. Contoh: Mulai Rp 300.000.">
            <input
              className="input"
              value={form.servicePrice}
              onChange={(e) => set("servicePrice", e.target.value)}
              placeholder="Mulai Rp 300.000"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="URL sumber resmi">
            <input
              className="input"
              type="url"
              value={form.sourceUrl}
              onChange={(e) => set("sourceUrl", e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Tanggal verifikasi">
            <input
              className="input"
              type="date"
              value={form.lastVerifiedAt}
              onChange={(e) => set("lastVerifiedAt", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Catatan singkat (untuk tabel /visa)">
          <textarea
            className="input min-h-[80px]"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Info singkat — syarat khusus, link resmi, dll."
          />
        </Field>
      </div>

      <ArraySection
        title="Kondisi / Syarat Khusus"
        hint="Dipakai untuk kasus bersyarat: e-paspor terdaftar, pernah punya visa, masuk via udara, izin khusus, dll."
        items={form.conditions ?? []}
        onAdd={() => set("conditions", [...(form.conditions ?? []), ""])}
        onRemove={(i) =>
          set(
            "conditions",
            (form.conditions ?? []).filter((_, j) => j !== i),
          )
        }
        onChange={(i, val) =>
          set(
            "conditions",
            (form.conditions ?? []).map((x, j) => (j === i ? val : x)),
          )
        }
        placeholder="mis. Hanya untuk e-paspor Indonesia yang sudah registrasi waiver"
      />

      {/* ─── VARIANTS ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Layanan &amp; Harga (Variants)</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tiap varian tampil sebagai kartu di halaman publik <code>/visa/{form.en ? form.en.toLowerCase().replace(/\s+/g, "-") : "[slug]"}</code>.
              Kosongkan harga = &quot;Tanya harga&quot;.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            <Plus size={14} /> Tambah Varian
          </button>
        </div>

        {variants.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada varian. Klik <b>Tambah Varian</b> untuk mulai.
            </p>
          </div>
        )}

        {variants.map((v, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/40 dark:bg-gray-900/30 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <GripVertical size={14} aria-hidden /> Varian #{i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveVariant(i, -1)}
                  disabled={i === 0}
                  className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-white dark:hover:bg-gray-800"
                  aria-label="Pindah ke atas"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveVariant(i, 1)}
                  disabled={i === variants.length - 1}
                  className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-white dark:hover:bg-gray-800"
                  aria-label="Pindah ke bawah"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="px-2 py-1 text-xs rounded border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-1"
                  aria-label="Hapus varian"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Nama varian *</label>
                <input
                  className="input"
                  value={v.name}
                  onChange={(e) => setVariant(i, { name: e.target.value })}
                  placeholder="Single Entry Jakarta"
                  required
                />
              </div>
              <div>
                <label className="label">Harga (Rp)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={v.priceIDR ?? ""}
                  onChange={(e) =>
                    setVariant(i, {
                      priceIDR: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  placeholder="950000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Estimasi proses</label>
                <input
                  className="input"
                  value={v.processingTime}
                  onChange={(e) => setVariant(i, { processingTime: e.target.value })}
                  placeholder="5-8 hari kerja"
                />
              </div>
              <div>
                <label className="label">Catatan (opsional)</label>
                <input
                  className="input"
                  value={v.notes}
                  onChange={(e) => setVariant(i, { notes: e.target.value })}
                  placeholder="Syarat khusus, dll."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── ELIGIBILITY ─── */}
      <ArraySection
        title="Syarat Kelayakan (Eligibility)"
        hint="Daftar singkat siapa yang berhak ajukan. Kosongkan = pakai template default per kategori visa."
        items={form.eligibility ?? []}
        onAdd={() => set("eligibility", [...(form.eligibility ?? []), ""])}
        onRemove={(i) =>
          set(
            "eligibility",
            (form.eligibility ?? []).filter((_, j) => j !== i),
          )
        }
        onChange={(i, val) =>
          set(
            "eligibility",
            (form.eligibility ?? []).map((x, j) => (j === i ? val : x)),
          )
        }
        placeholder="mis. Paspor berlaku min. 6 bulan"
      />

      {/* ─── DOCUMENTS ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Dokumen Wajib</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Nama dokumen + hint singkat (opsional). Kosongkan = pakai template default.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              set("documents", [...(form.documents ?? []), { name: "", hint: "" }])
            }
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            <Plus size={14} /> Tambah Dokumen
          </button>
        </div>
        {(form.documents ?? []).length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400">
            Belum ada dokumen. Default kategori akan dipakai di halaman publik.
          </div>
        )}
        {(form.documents ?? []).map((d, i) => (
          <div
            key={i}
            className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-end rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/40 dark:bg-gray-900/30"
          >
            <div>
              <label className="label text-xs">Nama dokumen *</label>
              <input
                className="input"
                value={d.name}
                onChange={(e) =>
                  set(
                    "documents",
                    (form.documents ?? []).map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
                placeholder="Paspor"
              />
            </div>
            <div>
              <label className="label text-xs">Hint singkat (opsional)</label>
              <input
                className="input"
                value={d.hint}
                onChange={(e) =>
                  set(
                    "documents",
                    (form.documents ?? []).map((x, j) =>
                      j === i ? { ...x, hint: e.target.value } : x,
                    ),
                  )
                }
                placeholder="Berlaku min. 6 bulan, halaman kosong 2 lembar"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                set(
                  "documents",
                  (form.documents ?? []).filter((_, j) => j !== i),
                )
              }
              className="self-end h-10 px-3 rounded border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-1 text-xs"
            >
              <Trash2 size={12} /> Hapus
            </button>
          </div>
        ))}
      </div>

      {/* ─── FAQS ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">FAQ Khusus Negara</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tanya-jawab spesifik negara ini. Kosongkan = pakai template default kategori.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              set("faqs", [...(form.faqs ?? []), { question: "", answer: "" }])
            }
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            <Plus size={14} /> Tambah FAQ
          </button>
        </div>
        {(form.faqs ?? []).length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400">
            Belum ada FAQ. Default kategori akan dipakai di halaman publik.
          </div>
        )}
        {(form.faqs ?? []).map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/40 dark:bg-gray-900/30 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <label className="label text-xs">Pertanyaan *</label>
                <input
                  className="input"
                  value={f.question}
                  onChange={(e) =>
                    set(
                      "faqs",
                      (form.faqs ?? []).map((x, j) =>
                        j === i ? { ...x, question: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Berapa lama proses visa Jepang?"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  set("faqs", (form.faqs ?? []).filter((_, j) => j !== i))
                }
                className="self-end h-10 px-3 rounded border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-1 text-xs"
              >
                <Trash2 size={12} /> Hapus
              </button>
            </div>
            <div>
              <label className="label text-xs">Jawaban *</label>
              <textarea
                className="input min-h-[80px]"
                value={f.answer}
                onChange={(e) =>
                  set(
                    "faqs",
                    (form.faqs ?? []).map((x, j) =>
                      j === i ? { ...x, answer: e.target.value } : x,
                    ),
                  )
                }
                placeholder="Biasanya 5-8 hari kerja untuk single entry Jakarta, 5-10 hari kerja non-Jakarta."
              />
            </div>
          </div>
        ))}
      </div>

    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* Editor list-of-strings sederhana (1 input per baris + add/remove). Dipakai
   untuk eligibility checklist. */
function ArraySection({
  title,
  hint,
  items,
  onAdd,
  onRemove,
  onChange,
  placeholder,
}: {
  title: string;
  hint?: string;
  items: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
          {hint && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>
      {items.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400">
          Belum ada item. Default kategori akan dipakai di halaman publik.
        </div>
      )}
      {items.map((value, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            className="input flex-1"
            value={value}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="h-10 px-3 rounded border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-1 text-xs"
            aria-label="Hapus"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
