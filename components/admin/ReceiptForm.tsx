"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import StickyFormActions from "./StickyFormActions";

interface Tour { id: string; title: string; price: number; promoPrice: number | null; tripDate: string | null }
type ReceiptPricingItemDraft = { name: string; quantity: string; unitPrice: string; discount: string };
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
  pricingBreakdown?: unknown;
  notes?: string;
  status?: string;
}

function splitNotes(notes?: string) {
  return (notes ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberInputValue(value: unknown, fallback = "") {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function emptyPricingItem(): ReceiptPricingItemDraft {
  return { name: "", quantity: "1", unitPrice: "", discount: "0" };
}

function normalizePricingItems(value: unknown, receipt?: ReceiptData): ReceiptPricingItemDraft[] {
  const items = isRecord(value) && Array.isArray(value.items)
    ? value.items.flatMap((item) => {
        if (!isRecord(item)) return [];
        return [{
          name: typeof item.name === "string" ? item.name : "",
          quantity: numberInputValue(item.quantity, "1"),
          unitPrice: numberInputValue(item.unitPrice),
          discount: numberInputValue(item.discount, "0"),
        }];
      })
    : [];

  if (items.length > 0) return items;
  if (!receipt?.id) return [emptyPricingItem()];

  const pax = Math.max(1, Number(receipt.pax) || 1);
  const amount = Number(receipt.amount) || 0;
  return [{
    name: receipt.tourTitle ?? "Paket tour",
    quantity: String(pax),
    unitPrice: amount > 0 ? String(Math.round(amount / pax)) : "",
    discount: "0",
  }];
}

function normalizeGlobalDiscount(value: unknown) {
  if (!isRecord(value)) return "0";
  return numberInputValue(value.globalDiscount, "0");
}

function readMoney(value: string) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function itemSubtotal(item: ReceiptPricingItemDraft) {
  const quantity = readMoney(item.quantity);
  const unitPrice = readMoney(item.unitPrice);
  const discount = readMoney(item.discount);
  return Math.max(0, quantity * unitPrice - discount);
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export default function ReceiptForm({ receipt, tours }: { receipt?: ReceiptData; tours: Tour[] }) {
  const router = useRouter();
  const isEdit = !!receipt?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [noteItems, setNoteItems] = useState<string[]>(() => splitNotes(receipt?.notes));
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [pricingItems, setPricingItems] = useState<ReceiptPricingItemDraft[]>(() => normalizePricingItems(receipt?.pricingBreakdown, receipt));
  const [globalDiscount, setGlobalDiscount] = useState(() => normalizeGlobalDiscount(receipt?.pricingBreakdown));
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

  const pricingSubtotal = pricingItems.reduce((sum, item) => sum + itemSubtotal(item), 0);
  const pricingTotal = Math.max(0, pricingSubtotal - readMoney(globalDiscount));

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

  function updatePricingItem(index: number, partial: Partial<ReceiptPricingItemDraft>) {
    setPricingItems((items) => items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...partial } : item
    )));
  }

  function addPricingItem() {
    setPricingItems((items) => [...items, emptyPricingItem()]);
  }

  function removePricingItem(index: number) {
    setPricingItems((items) => {
      const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
      return nextItems.length > 0 ? nextItems : [emptyPricingItem()];
    });
  }

  function syncFirstItemQuantity(value: string) {
    setPricingItems((items) => {
      if (items.length !== 1) return items;
      return [{ ...items[0], quantity: value || "1" }];
    });
  }

  function pricingBreakdownPayload() {
    const items = pricingItems
      .map((item) => {
        const name = item.name.trim();
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount) || 0;

        return {
          name,
          quantity: Number(item.quantity),
          unitPrice,
          discount,
          hasMeaningfulValue: Boolean(name || unitPrice || discount),
        };
      })
      .filter((item) => item.hasMeaningfulValue)
      .map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      }));

    if (items.length === 0) return null;

    return {
      items,
      globalDiscount: Number(globalDiscount) || 0,
    };
  }

  function handleTourSelect(tourId: string) {
    const tour = tours.find((t) => t.id === tourId);
    if (tour) {
      const pax = Math.max(1, Number(form.pax) || 1);
      const unitPrice = tour.promoPrice ?? tour.price;
      set("tourId", tour.id);
      set("tourTitle", tour.title);
      set("amount", unitPrice * pax);
      setPricingItems([{
        name: tour.title,
        quantity: String(pax),
        unitPrice: String(unitPrice),
        discount: "0",
      }]);
      setGlobalDiscount("0");
      if (tour.tripDate) set("tripDate", new Date(tour.tripDate).toISOString().slice(0, 10));
    } else {
      set("tourId", null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pricingPayload = pricingBreakdownPayload();
    if (!pricingPayload || pricingTotal <= 0) {
      setError("Minimal satu baris rincian nominal wajib diisi dengan total lebih dari Rp 0.");
      return;
    }

    setLoading(true);
    setError("");
    const res = await fetch(isEdit ? `/api/receipts/${receipt!.id}` : "/api/receipts", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: pricingTotal,
        pax: Number(form.pax),
        paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : null,
        pricingBreakdown: pricingPayload,
        notes: noteItems.join("\n"),
      }),
    });
    setLoading(false);
    if (res.ok) router.push("/admin/receipts");
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Receipt belum berhasil disimpan. Periksa rincian nominal.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
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
            <input type="number" min={1} className="input" value={form.pax} onChange={(e) => { set("pax", e.target.value); syncFirstItemQuantity(e.target.value); }} /></div>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Rincian Nominal</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Qty, harga satuan, dan diskon dihitung otomatis ke total pembayaran.
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-2 text-right dark:bg-blue-900/20">
            <p className="text-[11px] font-semibold uppercase text-blue-500 dark:text-blue-300">Total otomatis</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-200">{formatRupiah(pricingTotal)}</p>
          </div>
        </div>

        <div className="hidden rounded-lg bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase text-gray-500 dark:bg-gray-700/60 dark:text-gray-300 md:grid md:grid-cols-[minmax(0,1.7fr)_5rem_9rem_9rem_9rem_2.5rem] md:gap-2">
          <span>Item</span>
          <span>Qty</span>
          <span>Harga Satuan</span>
          <span>Diskon</span>
          <span>Subtotal</span>
          <span />
        </div>

        <div className="space-y-2">
          {pricingItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/50 md:grid-cols-[minmax(0,1.7fr)_5rem_9rem_9rem_9rem_2.5rem]"
            >
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 md:hidden">Item</label>
                <input
                  className="input"
                  value={item.name}
                  onChange={(e) => updatePricingItem(index, { name: e.target.value })}
                  placeholder="Paket, add-on, biaya visa, dll."
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 md:hidden">Qty</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className="input"
                  value={item.quantity}
                  onChange={(e) => updatePricingItem(index, { quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 md:hidden">Harga Satuan</label>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={item.unitPrice}
                  onChange={(e) => updatePricingItem(index, { unitPrice: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 md:hidden">Diskon</label>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={item.discount}
                  onChange={(e) => updatePricingItem(index, { discount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400 md:hidden">Subtotal</label>
                <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  {formatRupiah(itemSubtotal(item))}
                </div>
              </div>
              <button
                type="button"
                title="Hapus baris"
                onClick={() => removePricingItem(index)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_18rem] md:items-end">
          <button
            type="button"
            onClick={addPricingItem}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Tambah baris biaya
          </button>
          <div>
            <label className="label mb-1">Diskon Tambahan</label>
            <input
              type="number"
              min={0}
              className="input"
              value={globalDiscount}
              onChange={(e) => setGlobalDiscount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/40">
          <div className="flex items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatRupiah(pricingSubtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>Diskon tambahan</span>
            <span className="font-semibold text-red-600 dark:text-red-300">- {formatRupiah(readMoney(globalDiscount))}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-200 pt-3 text-base font-bold text-gray-900 dark:border-gray-700 dark:text-white">
            <span>Total Pembayaran</span>
            <span>{formatRupiah(pricingTotal)}</span>
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
