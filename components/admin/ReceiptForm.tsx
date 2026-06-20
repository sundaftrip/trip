"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
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

function splitNotes(notes?: string) {
  return (notes ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ReceiptForm({ receipt, tours }: { receipt?: ReceiptData; tours: Tour[] }) {
  const router = useRouter();
  const isEdit = !!receipt?.id;
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [noteItems, setNoteItems] = useState<string[]>(() => splitNotes(receipt?.notes));
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
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

  function setNotes(items: string[]) {
    setNoteItems(items);
    set("notes", items.join("\n"));
  }

  function commitNote() {
    const value = noteInput.trim();
    if (!value) return;

    if (editingNoteIdx !== null) {
      const updated = [...noteItems];
      updated[editingNoteIdx] = value;
      setNotes(updated);
      setEditingNoteIdx(null);
    } else {
      setNotes([...noteItems, value]);
    }
    setNoteInput("");
  }

  function cancelNoteEdit() {
    setEditingNoteIdx(null);
    setNoteInput("");
  }

  function editNote(item: string, index: number) {
    setNoteInput(item);
    setEditingNoteIdx(index);
  }

  function removeNote(index: number) {
    const updated = noteItems.filter((_, itemIndex) => itemIndex !== index);
    setNotes(updated);
    if (editingNoteIdx === index) cancelNoteEdit();
    if (editingNoteIdx !== null && editingNoteIdx > index) setEditingNoteIdx(editingNoteIdx - 1);
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
        notes: noteItems.join("\n"),
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
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Catatan Receipt</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Buat per poin supaya catatan di PDF tidak menumpuk jadi paragraf panjang.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input flex-1"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitNote();
              }
            }}
            placeholder={editingNoteIdx !== null ? "Edit catatan lalu Enter / Simpan" : "Tekan Enter untuk tambah catatan"}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={commitNote}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition ${
                editingNoteIdx !== null ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {editingNoteIdx !== null ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{editingNoteIdx !== null ? "Simpan" : "Tambah"}</span>
            </button>
            {editingNoteIdx !== null && (
              <button
                type="button"
                onClick={cancelNoteEdit}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-600 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                title="Batal edit"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {noteItems.length > 0 ? (
          <ul className="space-y-2">
            {noteItems.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                  editingNoteIdx === index
                    ? "bg-blue-50 text-blue-900 ring-2 ring-blue-300 dark:bg-blue-900/20 dark:text-blue-200 dark:ring-blue-500"
                    : "bg-gray-50 text-gray-800 dark:bg-gray-700/60 dark:text-gray-200"
                }`}
              >
                <span className="min-w-0 break-words">
                  <span className="mr-2 font-mono text-xs font-semibold text-gray-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    title="Edit catatan"
                    onClick={() => editNote(item, index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-blue-500 transition hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Hapus catatan"
                    onClick={() => removeNote(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-red-500 transition hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-700/60 dark:text-gray-400">
            Belum ada catatan. Tambahkan hanya poin yang perlu muncul di bukti pembayaran.
          </p>
        )}
      </div>

    </form>
  );
}
