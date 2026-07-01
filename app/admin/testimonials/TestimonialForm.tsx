"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import StickyFormActions from "@/components/admin/StickyFormActions";

interface FormData {
  name: string; role: string; content: string;
  rating: number; avatar: string; category: string; tourId: string; published: boolean; order: number;
}

interface TourOption { id: string; title: string; country: string }

interface Props {
  id?: string;
  initial?: Partial<FormData>;
  tours?: TourOption[];
}

const EMPTY: FormData = { name: "", role: "", content: "", rating: 5, avatar: "", category: "trip", tourId: "", published: true, order: 0 };

export default function TestimonialForm({ id, initial, tours = [] }: Props) {
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) {
      setError("Nama dan isi testimoni wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(id ? `/api/testimonials/${id}` : "/api/testimonials", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/admin/testimonials");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Gagal menyimpan.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      <StickyFormActions
        loading={saving}
        primaryLabel={id ? "Simpan Perubahan" : "Tambah Testimoni"}
        cancelHref="/admin/testimonials"
      />

      {/* Avatar */}
      <div>
        <label className="label">Foto (opsional)</label>
        <div className="flex items-center gap-4">
          {form.avatar
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={form.avatar} alt="" className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
            : <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xl font-bold border border-gray-200 dark:border-gray-700">
                {form.name ? form.name.charAt(0).toUpperCase() : "?"}
              </div>
          }
          <ImageUpload value={form.avatar} onChange={(url) => set("avatar", url)} folder="testimonials" />
        </div>
      </div>

      <div>
        <label className="label">Nama <span className="text-red-500">*</span></label>
        <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Budi Santoso" />
      </div>

      <div>
        <label className="label">Keterangan</label>
        <input className="input" value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Jamaah Umroh 2024 · Jakarta" />
      </div>

      {/* Kategori — menentukan di mana testimoni tampil */}
      <div>
        <label className="label">Kategori</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "trip", title: "Trip", desc: "Tampil di halaman utama" },
            { value: "visa", title: "Visa", desc: "Tampil di halaman layanan visa" },
          ].map((opt) => {
            const active = form.category === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => set("category", opt.value)}
                className={`text-left px-4 py-3 rounded-lg border transition ${
                  active
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}>
                <p className={`text-sm font-semibold ${active ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>{opt.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tour terkait — dasar rating bintang per-tour di Google. Opsional. */}
      <div>
        <label className="label">Tour terkait (opsional)</label>
        <select className="input" value={form.tourId} onChange={(e) => set("tourId", e.target.value)}>
          <option value="">— Tidak terkait tour tertentu —</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>{t.title}{t.country ? ` · ${t.country}` : ""}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Kaitkan ke tour spesifik agar rating bintang (★) bisa muncul di hasil pencarian Google untuk halaman tour itu.
        </p>
      </div>

      <div>
        <label className="label">Isi Testimoni <span className="text-red-500">*</span></label>
        <textarea className="input min-h-[100px] resize-y" value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="Tulis testimoni asli pelanggan..." />
      </div>

      {/* Star Rating */}
      <div>
        <label className="label">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => set("rating", n)}>
              <Star size={28} className={n <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"} />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500 self-center">{form.rating}/5</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Urutan Tampil</label>
          <input type="number" className="input" value={form.order} min={0}
            onChange={(e) => set("order", Number(e.target.value))} />
          <p className="text-xs text-gray-400 mt-1">Angka kecil = tampil lebih awal</p>
        </div>
        <div className="flex flex-col justify-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative w-10 h-6 rounded-full transition-colors ${form.published ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
              onClick={() => set("published", !form.published)}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di website</span>
          </label>
        </div>
      </div>

    </form>
  );
}
