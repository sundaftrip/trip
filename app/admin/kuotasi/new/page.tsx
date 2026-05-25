"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import { COUNTRY_CURRENCY, COUNTRY_LIST } from "@/lib/kuotasi/calc";

export default function NewKuotasiPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => {
    const country = "Rusia";
    const preset = COUNTRY_CURRENCY[country];
    return {
      title: "",
      country,
      durationDays: 7,
      currency: preset.currency,
      kursForeign: preset.defaultRate,
      marginPct: 10,
      validUntil: "",
    };
  });

  function setCountry(country: string) {
    const preset = COUNTRY_CURRENCY[country];
    setForm((f) => ({
      ...f,
      country,
      currency: preset?.currency ?? f.currency,
      kursForeign: preset?.defaultRate ?? f.kursForeign,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/kuotasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title || `Kuotasi ${form.country} ${form.durationDays} Hari`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Gagal membuat kuotasi");
        setSaving(false);
        return;
      }
      const q = await res.json();
      router.push(`/admin/kuotasi/${q.id}`);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat kuotasi");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/kuotasi" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
          <ArrowLeft size={14} /> Kembali ke daftar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calculator size={22} className="text-orange-600" /> Buat Kuotasi Baru
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pilih destinasi, kurs, dan margin. Setelah dibuat, lanjut isi hari demi hari + komponen biaya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <Field label="Judul Kuotasi" hint="Opsional — kalau kosong, otomatis: 'Kuotasi {Negara} {N} Hari'">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="mis. Aurora Hunting Rusia 9 Hari — November 2026"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Destinasi">
            <select
              value={form.country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
            >
              {COUNTRY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Durasi (hari)">
            <input
              type="number"
              min={1}
              max={60}
              value={form.durationDays}
              onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Currency Supplier" hint="Mata uang lokal supplier">
            <input
              type="text"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono"
            />
          </Field>
          <Field label="Kurs ke IDR" hint={`1 ${form.currency} = ? IDR`}>
            <input
              type="number"
              step="0.01"
              value={form.kursForeign}
              onChange={(e) => setForm({ ...form, kursForeign: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono"
            />
          </Field>
          <Field label="Margin (%)" hint="Target margin terhadap COGS">
            <input
              type="number"
              step="0.5"
              min={0}
              max={90}
              value={form.marginPct}
              onChange={(e) => setForm({ ...form, marginPct: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono"
            />
          </Field>
        </div>

        <Field label="Berlaku sampai (opsional)">
          <input
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link href="/admin/kuotasi" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Batal</Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            style={{ backgroundColor: "#0C2647" }}
          >
            {saving ? "Membuat…" : "Buat & Lanjut Edit"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}
