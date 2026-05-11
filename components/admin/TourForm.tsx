"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";

interface TourData {
  id?: string;
  category?: string;
  title?: string;
  country?: string;
  cityHighlight?: string;
  price?: number;
  promoPrice?: number | null;
  priceLandTour?: number | null;
  seatsLeft?: number;
  status?: string;
  tripDate?: string;
  duration?: string;
  inclusions?: string[];
  exclusions?: string[];
  gallery?: string[];
  heroImg?: string;
  badge?: string;
  notes?: string;
  visaInfo?: string;
  itinerary?: { day: number; title: string; description: string }[];
  addOns?: { name: string; price: number }[];
}

export default function TourForm({ tour }: { tour?: TourData }) {
  const router = useRouter();
  const isEdit = !!tour?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TourData>({
    category: tour?.category ?? "",
    title: tour?.title ?? "",
    country: tour?.country ?? "",
    cityHighlight: tour?.cityHighlight ?? "",
    price: tour?.price ?? 0,
    promoPrice: tour?.promoPrice ?? null,
    priceLandTour: tour?.priceLandTour ?? null,
    seatsLeft: tour?.seatsLeft ?? 0,
    status: tour?.status ?? "DRAFT",
    tripDate: tour?.tripDate ? new Date(tour.tripDate).toISOString().slice(0, 10) : "",
    duration: tour?.duration ?? "",
    inclusions: tour?.inclusions ?? [],
    exclusions: tour?.exclusions ?? [],
    gallery: tour?.gallery ?? [],
    heroImg: tour?.heroImg ?? "",
    badge: tour?.badge ?? "",
    notes: tour?.notes ?? "",
    visaInfo: tour?.visaInfo ?? "",
    itinerary: tour?.itinerary ?? [],
    addOns: tour?.addOns ?? [],
  });

  const [inclusionInput, setInclusionInput] = useState("");
  const [exclusionInput, setExclusionInput] = useState("");
  const [itineraryItem, setItineraryItem] = useState({ day: 1, title: "", description: "" });
  const [addOnItem, setAddOnItem] = useState<{ name: string; price: string | number }>({ name: "", price: "" });

  function set(key: keyof TourData, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
      priceLandTour: form.priceLandTour ? Number(form.priceLandTour) : null,
      seatsLeft: Number(form.seatsLeft),
      tripDate: form.tripDate ? new Date(form.tripDate).toISOString() : null,
    };
    const res = await fetch(isEdit ? `/api/tours/${tour!.id}` : "/api/tours", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/tours");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal menyimpan. Coba lagi.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium">
          ⛔ {error}
        </div>
      )}
      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Informasi Dasar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Judul Tour *">
            <input required className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Kategori *">
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)} required>
              <option value="">Pilih kategori</option>
              {["Umroh", "Haji", "Wisata Religi", "Wisata Halal", "City Tour", "Adventure"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Negara *">
            <input required className="input" value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Kota Highlight">
            <input className="input" value={form.cityHighlight} onChange={(e) => set("cityHighlight", e.target.value)} />
          </Field>
          <Field label="Durasi">
            <input className="input" placeholder="cth: 9 Hari 7 Malam" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
          </Field>
          <Field label="Tanggal Keberangkatan">
            <input type="date" className="input" value={form.tripDate} onChange={(e) => set("tripDate", e.target.value)} />
          </Field>
          <Field label="Sisa Seat">
            <input type="number" min={0} className="input" value={form.seatsLeft} onChange={(e) => set("seatsLeft", e.target.value)} />
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="FULL">Full</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </Field>
          <Field label="Badge (opsional)">
            <input className="input" placeholder="cth: Best Seller, New" value={form.badge} onChange={(e) => set("badge", e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Harga</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Harga Normal *">
            <input required type="number" min={0} className="input" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Harga Promo">
            <input type="number" min={0} className="input" value={form.promoPrice ?? ""} onChange={(e) => set("promoPrice", e.target.value || null)} />
          </Field>
          <Field label="Harga Land Tour">
            <input type="number" min={0} className="input" value={form.priceLandTour ?? ""} onChange={(e) => set("priceLandTour", e.target.value || null)} />
          </Field>
        </div>
      </div>

      {/* Hero Image */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Gambar Hero</h2>
        <ImageUpload value={form.heroImg ?? ""} onChange={(url) => set("heroImg", url)} folder="tours/hero" />
      </div>

      {/* Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Galeri</h2>
        <ImageUpload
          value=""
          onChange={(url) => setForm((p) => ({ ...p, gallery: [...(p.gallery ?? []), url] }))}
          folder="tours/gallery"
          multiple
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {(form.gallery ?? []).map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
              <button type="button" onClick={() => set("gallery", form.gallery!.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Inclusions & Exclusions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Termasuk & Tidak Termasuk</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label mb-2">Termasuk</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" value={inclusionInput} onChange={(e) => setInclusionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (inclusionInput) { set("inclusions", [...(form.inclusions ?? []), inclusionInput]); setInclusionInput(""); }}}} placeholder="Tekan Enter untuk tambah" />
              <button type="button" onClick={() => { if (inclusionInput) { set("inclusions", [...(form.inclusions ?? []), inclusionInput]); setInclusionInput(""); }}}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">+</button>
            </div>
            <ul className="space-y-1">
              {(form.inclusions ?? []).map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1.5 rounded">
                  <span>✓ {item}</span>
                  <button type="button" onClick={() => set("inclusions", form.inclusions!.filter((_, j) => j !== i))} className="text-red-500 ml-2">×</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="label mb-2">Tidak Termasuk</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" value={exclusionInput} onChange={(e) => setExclusionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (exclusionInput) { set("exclusions", [...(form.exclusions ?? []), exclusionInput]); setExclusionInput(""); }}}} placeholder="Tekan Enter untuk tambah" />
              <button type="button" onClick={() => { if (exclusionInput) { set("exclusions", [...(form.exclusions ?? []), exclusionInput]); setExclusionInput(""); }}}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm">+</button>
            </div>
            <ul className="space-y-1">
              {(form.exclusions ?? []).map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-3 py-1.5 rounded">
                  <span>✗ {item}</span>
                  <button type="button" onClick={() => set("exclusions", form.exclusions!.filter((_, j) => j !== i))} className="text-red-500 ml-2">×</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Itinerary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input type="number" min={1} placeholder="Hari" className="input" value={itineraryItem.day} onChange={(e) => setItineraryItem((p) => ({ ...p, day: Number(e.target.value) }))} />
          <input placeholder="Judul" className="input" value={itineraryItem.title}
            onChange={(e) => setItineraryItem((p) => ({ ...p, title: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLInputElement | null)?.focus(); }}} />
          <div className="flex gap-2">
            <input placeholder="Deskripsi (Enter untuk tambah)" className="input flex-1" value={itineraryItem.description}
              onChange={(e) => setItineraryItem((p) => ({ ...p, description: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (itineraryItem.title) {
                    const updated = [...(form.itinerary ?? []), itineraryItem].sort((a, b) => a.day - b.day);
                    set("itinerary", updated);
                    setItineraryItem({ day: (form.itinerary?.length ?? 0) + 2, title: "", description: "" });
                  }
                }
              }} />
            <button type="button" onClick={() => { if (itineraryItem.title) { set("itinerary", [...(form.itinerary ?? []), itineraryItem].sort((a, b) => a.day - b.day)); setItineraryItem({ day: (form.itinerary?.length ?? 0) + 2, title: "", description: "" }); }}}
              className="px-3 bg-blue-600 text-white rounded-lg">+</button>
          </div>
        </div>
        <div className="space-y-2">
          {(form.itinerary ?? []).map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg">
              <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded shrink-0">Hari {item.day}</span>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <button type="button" onClick={() => set("itinerary", form.itinerary!.filter((_, j) => j !== i))} className="text-red-500 text-sm">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Ons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Add Ons</h2>
        <div className="grid grid-cols-[1fr_9rem_auto] gap-3 mb-1">
          <label className="label text-xs">Nama Add-On</label>
          <label className="label text-xs">Harga (Rp)</label>
          <span />
        </div>
        <div className="grid grid-cols-[1fr_9rem_auto] gap-3 mb-3">
          <input placeholder="cth: Airport Transfer" className="input" value={addOnItem.name}
            onChange={(e) => setAddOnItem((p) => ({ ...p, name: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLInputElement | null)?.focus(); }}} />
          <input type="number" min={0} placeholder="0" className="input" value={addOnItem.price}
            onChange={(e) => setAddOnItem((p) => ({ ...p, price: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (addOnItem.name) {
                  set("addOns", [...(form.addOns ?? []), { name: addOnItem.name, price: Number(addOnItem.price) || 0 }]);
                  setAddOnItem({ name: "", price: "" });
                }
              }
            }} />
          <button type="button"
            onClick={() => { if (addOnItem.name) { set("addOns", [...(form.addOns ?? []), { name: addOnItem.name, price: Number(addOnItem.price) || 0 }]); setAddOnItem({ name: "", price: "" }); }}}
            className="px-4 bg-blue-600 text-white rounded-lg text-sm">Tambah</button>
        </div>
        <div className="space-y-2">
          {(form.addOns ?? []).map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm">
              <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-400">Rp {Number(item.price).toLocaleString("id-ID")}</span>
                <button type="button" onClick={() => set("addOns", form.addOns!.filter((_, j) => j !== i))} className="text-red-500">×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes & Visa */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Catatan & Visa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Catatan">
            <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
          <Field label="Informasi Visa">
            <textarea className="input min-h-[100px]" value={form.visaInfo} onChange={(e) => set("visaInfo", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition">
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Tour"}
        </button>
        <button type="button" onClick={() => router.push("/admin/tours")}
          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          Batal
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label mb-1">{label}</label>
      {children}
    </div>
  );
}
