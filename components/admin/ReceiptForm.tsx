"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StickyFormActions from "./StickyFormActions";

interface Tour { id: string; title: string; price: number; promoPrice: number | null; tripDate: string | null }
interface ReceiptData {
  id?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  tourId?: string | null;
  tourTitle?: string;
  tripDate?: string;
  pax?: number;
  amount?: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  status?: string;
}

export default function ReceiptForm({ receipt, tours }: { receipt?: ReceiptData; tours: Tour[] }) {
  const router = useRouter();
  const isEdit = !!receipt?.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ReceiptData>({
    customerName: receipt?.customerName ?? "",
    customerPhone: receipt?.customerPhone ?? "",
    customerEmail: receipt?.customerEmail ?? "",
    tourId: receipt?.tourId ?? null,
    tourTitle: receipt?.tourTitle ?? "",
    tripDate: receipt?.tripDate ?? "",
    pax: receipt?.pax ?? 1,
    amount: receipt?.amount ?? 0,
    paymentMethod: receipt?.paymentMethod ?? "",
    paymentDate: receipt?.paymentDate ?? new Date().toISOString().slice(0, 10),
    notes: receipt?.notes ?? "",
    status: receipt?.status ?? "UNPAID",
  });

  function set(key: keyof ReceiptData, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleTourSelect(tourId: string) {
    const tour = tours.find((t) => t.id === tourId);
    if (tour) {
      set("tourId", tour.id);
      set("tourTitle", tour.title);
      set("amount", (tour.promoPrice ?? tour.price) * (form.pax ?? 1));
      if (tour.tripDate) set("tripDate", new Date(tour.tripDate).toISOString().slice(0, 10));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(isEdit ? `/api/receipts/${receipt!.id}` : "/api/receipts", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        pax: Number(form.pax),
        paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : null,
      }),
    });
    setLoading(false);
    if (res.ok) router.push("/admin/receipts");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <StickyFormActions
        loading={loading}
        primaryLabel={isEdit ? "Simpan Perubahan" : "Buat Receipt"}
        cancelHref="/admin/receipts"
      />
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Data Pelanggan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label mb-1">Nama Pelanggan *</label>
            <input required className="input" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} /></div>
          <div><label className="label mb-1">No. HP</label>
            <input className="input" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="+62..." /></div>
          <div className="md:col-span-2"><label className="label mb-1">Email</label>
            <input type="email" className="input" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Detail Tour</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label mb-1">Pilih Tour (opsional)</label>
            <select className="input" value={form.tourId ?? ""} onChange={(e) => handleTourSelect(e.target.value)}>
              <option value="">-- Input manual --</option>
              {tours.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><label className="label mb-1">Nama Tour *</label>
            <input required className="input" value={form.tourTitle} onChange={(e) => set("tourTitle", e.target.value)} /></div>
          <div><label className="label mb-1">Tanggal Berangkat</label>
            <input type="date" className="input" value={form.tripDate} onChange={(e) => set("tripDate", e.target.value)} /></div>
          <div><label className="label mb-1">Jumlah Pax</label>
            <input type="number" min={1} className="input" value={form.pax} onChange={(e) => { set("pax", e.target.value); }} /></div>
          <div><label className="label mb-1">Total Pembayaran *</label>
            <input required type="number" min={0} className="input" value={form.amount} onChange={(e) => set("amount", e.target.value)} /></div>
          <div><label className="label mb-1">Metode Pembayaran</label>
            <select className="input" value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
              <option value="">Pilih metode</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="Cash">Cash</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>
          <div><label className="label mb-1">Tanggal Pembayaran</label>
            <input type="date" className="input" value={form.paymentDate} onChange={(e) => set("paymentDate", e.target.value)} /></div>
          <div><label className="label mb-1">Status</label>
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="UNPAID">Unpaid</option>
              <option value="DP">DP</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div className="md:col-span-2"><label className="label mb-1">Catatan</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        </div>
      </div>

    </form>
  );
}
