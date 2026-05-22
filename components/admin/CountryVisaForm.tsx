"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  notes: string;
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
  notes: "",
};

export default function CountryVisaForm({ entry }: { entry?: CountryVisaEntry }) {
  const router = useRouter();
  const isEdit = Boolean(entry?.id);
  const [form, setForm] = useState<CountryVisaEntry>(entry ?? empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CountryVisaEntry>(key: K, value: CountryVisaEntry[K]) {
    setForm((f) => ({ ...f, [key]: value }));
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
      notes: form.notes.trim(),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

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
          label="Biaya (IDR atau lainnya)"
          hint="Kosongkan jika gratis — tampil &quot;Gratis&quot; (hijau) di website. Isi dengan harga IDR-mu, mis. &quot;Rp 950.000&quot;."
        >
          <input
            className="input"
            value={form.cost}
            onChange={(e) => set("cost", e.target.value)}
            placeholder="Kosongkan = Gratis, atau Rp 950.000"
          />
        </Field>

        <Field label="Catatan">
          <textarea
            className="input min-h-[100px]"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Info tambahan singkat — link aplikasi, syarat khusus, dll."
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition"
        >
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Negara"}
        </button>
        <Link
          href="/admin/database-visa"
          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Batal
        </Link>
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
