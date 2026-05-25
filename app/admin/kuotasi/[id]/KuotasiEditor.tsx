"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, Sparkles, RefreshCw } from "lucide-react";
import { COUNTRY_CURRENCY, COUNTRY_LIST, DEFAULT_PAX_TIERS, computeAllTiers, type CostInput } from "@/lib/kuotasi/calc";
import { CATEGORY_LABEL, STATUS_LABEL, foreign as fmtForeign, rupiah, rupiahShort } from "@/lib/kuotasi/format";
import type { CostCategory, QuotationStatus } from "@prisma/client";

type Day = {
  id?: string;
  dayIndex: number;
  date?: string | null;
  city?: string | null;
  title?: string | null;
  narrativeHtml: string;
  highlights: string[];
  imageUrl?: string | null;
};

type CostItem = {
  id?: string;
  dayId?: string | null;
  dayIndex?: number | null; // index referensi (lebih stabil di UI lokal sebelum save)
  category: CostCategory;
  label: string;
  perPax: boolean;
  valueForeign: number | null;
  valueIdr: number | null;
  qty: number;
};

type Addon = { id?: string; label: string; priceIdr: number; notes?: string | null };

type Template = {
  id: string;
  category: CostCategory;
  country: string;
  city: string | null;
  label: string;
  currency: string;
  valueForeign: number | null;
  valueIdr: number | null;
  perPax: boolean;
};

type Initial = {
  id: string;
  title: string;
  country: string;
  durationDays: number;
  status: QuotationStatus;
  currency: string;
  kursForeign: number;
  marginPct: number;
  roundIdrTo: number;
  validUntil: Date | null;
  notes: string | null;
  days: Array<{
    id: string; dayIndex: number; date: Date | null; city: string | null; title: string | null;
    narrativeHtml: string; highlights: string[]; imageUrl: string | null;
  }>;
  costs: Array<{
    id: string; dayId: string | null; category: CostCategory; label: string;
    perPax: boolean; valueForeign: number | null; valueIdr: number | null; qty: number;
  }>;
  addons: Array<{ id: string; label: string; priceIdr: number; notes: string | null }>;
};

const CATEGORIES: CostCategory[] = [
  "HOTEL", "AKTIVITAS", "TRANSPORT", "MAKAN", "ASURANSI", "TL_FEE", "TAX", "TIKET_MASUK", "LAIN",
];

const STATUSES: QuotationStatus[] = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "ARCHIVED"];

export default function KuotasiEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [tab, setTab] = useState<"setup" | "days" | "costs" | "pricing" | "addons">("setup");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Header (Pengaturan)
  const [header, setHeader] = useState({
    title: initial.title,
    country: initial.country,
    status: initial.status,
    currency: initial.currency,
    kursForeign: initial.kursForeign,
    marginPct: initial.marginPct,
    roundIdrTo: initial.roundIdrTo,
    validUntil: initial.validUntil ? initial.validUntil.toISOString().slice(0, 10) : "",
    notes: initial.notes ?? "",
  });

  // Days
  const [days, setDays] = useState<Day[]>(
    initial.days.map((d) => ({
      id: d.id,
      dayIndex: d.dayIndex,
      date: d.date ? d.date.toISOString().slice(0, 10) : null,
      city: d.city,
      title: d.title,
      narrativeHtml: d.narrativeHtml,
      highlights: d.highlights,
      imageUrl: d.imageUrl,
    }))
  );

  // Costs (pakai dayIndex ref, bukan dayId, supaya stabil saat days direplace)
  const dayIdToIndex = useMemo(() => {
    const m = new Map<string, number>();
    initial.days.forEach((d) => m.set(d.id, d.dayIndex));
    return m;
  }, [initial.days]);

  const [costs, setCosts] = useState<CostItem[]>(
    initial.costs.map((c) => ({
      id: c.id,
      dayIndex: c.dayId ? dayIdToIndex.get(c.dayId) ?? null : null,
      category: c.category,
      label: c.label,
      perPax: c.perPax,
      valueForeign: c.valueForeign,
      valueIdr: c.valueIdr,
      qty: c.qty,
    }))
  );

  const [addons, setAddons] = useState<Addon[]>(
    initial.addons.map((a) => ({ id: a.id, label: a.label, priceIdr: a.priceIdr, notes: a.notes }))
  );

  const [paxList, setPaxList] = useState<number[]>(() => [...DEFAULT_PAX_TIERS]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tplFilter, setTplFilter] = useState<{ category: string; city: string }>({ category: "", city: "" });

  // Load templates whenever country changes
  useEffect(() => {
    fetch(`/api/kuotasi/templates?country=${encodeURIComponent(header.country)}`)
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, [header.country]);

  // Auto-update currency saat ganti country
  useEffect(() => {
    const preset = COUNTRY_CURRENCY[header.country];
    if (preset && header.currency === initial.currency && header.country !== initial.country) {
      setHeader((h) => ({ ...h, currency: preset.currency, kursForeign: preset.defaultRate }));
    }
  }, [header.country, header.currency, initial.country, initial.currency]);

  function markDirty() { setDirty(true); }

  // ── Computed pricing (live preview pakai data lokal) ──────────────
  const pricingRows = useMemo(() => {
    const items: CostInput[] = costs.map((c) => ({
      perPax: c.perPax,
      valueForeign: c.valueForeign,
      valueIdr: c.valueIdr,
      qty: c.qty,
    }));
    return computeAllTiers(items, paxList, header.kursForeign, header.marginPct, header.roundIdrTo);
  }, [costs, paxList, header.kursForeign, header.marginPct, header.roundIdrTo]);

  // ── Save semua perubahan ──────────────────────────────────────────
  async function saveAll() {
    setSaving(true);
    try {
      // 1. Header
      await fetch(`/api/kuotasi/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...header,
          durationDays: days.length,
          validUntil: header.validUntil || null,
        }),
      });
      // 2. Days (bulk replace)
      await fetch(`/api/kuotasi/${initial.id}/days`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(days),
      });
      // 3. Refetch day IDs (untuk relink cost items)
      const fresh = await fetch(`/api/kuotasi/${initial.id}`).then((r) => r.json());
      const newDayIdByIndex = new Map<number, string>();
      fresh.days.forEach((d: { id: string; dayIndex: number }) => newDayIdByIndex.set(d.dayIndex, d.id));
      // 4. Costs
      await fetch(`/api/kuotasi/${initial.id}/costs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          costs.map((c, i) => ({
            dayId: c.dayIndex ? newDayIdByIndex.get(c.dayIndex) ?? null : null,
            category: c.category,
            label: c.label,
            perPax: c.perPax,
            valueForeign: c.valueForeign,
            valueIdr: c.valueIdr,
            qty: c.qty,
            order: i,
          }))
        ),
      });
      // 5. Addons
      await fetch(`/api/kuotasi/${initial.id}/addons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addons),
      });
      // 6. Recalc pricing dengan paxList aktif
      await fetch(`/api/kuotasi/${initial.id}/recalc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paxList }),
      });

      setDirty(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function addDay() {
    setDays((d) => [...d, { dayIndex: d.length + 1, narrativeHtml: "", highlights: [] }]);
    markDirty();
  }
  function removeDay(idx: number) {
    setDays((d) => d.filter((_, i) => i !== idx).map((x, i) => ({ ...x, dayIndex: i + 1 })));
    markDirty();
  }
  function updateDay(idx: number, patch: Partial<Day>) {
    setDays((d) => d.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
    markDirty();
  }

  function addCost(seed?: Partial<CostItem>) {
    setCosts((c) => [...c, {
      category: "LAIN",
      label: "",
      perPax: true,
      valueForeign: null,
      valueIdr: null,
      qty: 1,
      dayIndex: null,
      ...seed,
    }]);
    markDirty();
  }
  function addCostFromTemplate(t: Template) {
    addCost({
      category: t.category,
      label: t.city ? `${t.label} (${t.city})` : t.label,
      perPax: t.perPax,
      valueForeign: t.currency === header.currency ? t.valueForeign : null,
      valueIdr: t.currency === "IDR" ? t.valueIdr : t.valueIdr,
    });
  }
  function removeCost(idx: number) { setCosts((c) => c.filter((_, i) => i !== idx)); markDirty(); }
  function updateCost(idx: number, patch: Partial<CostItem>) {
    setCosts((c) => c.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
    markDirty();
  }

  function addAddon() { setAddons((a) => [...a, { label: "", priceIdr: 0 }]); markDirty(); }
  function removeAddon(idx: number) { setAddons((a) => a.filter((_, i) => i !== idx)); markDirty(); }
  function updateAddon(idx: number, patch: Partial<Addon>) {
    setAddons((a) => a.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
    markDirty();
  }

  const tabs = [
    { key: "setup", label: "Pengaturan" },
    { key: "days", label: `Hari & Itinerary (${days.length})` },
    { key: "costs", label: `Komponen Biaya (${costs.length})` },
    { key: "pricing", label: "Pricing" },
    { key: "addons", label: `Add-ons (${addons.length})` },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Tab bar + save button (sticky) */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
                tab === t.key
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-1.5 text-white text-sm font-medium rounded-md disabled:opacity-50"
          style={{ backgroundColor: dirty ? "#FE8032" : "#0C2647" }}
        >
          <Save size={15} /> {saving ? "Menyimpan…" : dirty ? "Simpan Perubahan" : "Tersimpan"}
        </button>
      </div>

      {/* === SETUP === */}
      {tab === "setup" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5 max-w-3xl">
          <Field label="Judul">
            <input className={inputCls} value={header.title} onChange={(e) => { setHeader({ ...header, title: e.target.value }); markDirty(); }} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Destinasi">
              <select className={inputCls} value={header.country} onChange={(e) => { setHeader({ ...header, country: e.target.value }); markDirty(); }}>
                {COUNTRY_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={header.status} onChange={(e) => { setHeader({ ...header, status: e.target.value as QuotationStatus }); markDirty(); }}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Currency">
              <input className={`${inputCls} font-mono`} value={header.currency} onChange={(e) => { setHeader({ ...header, currency: e.target.value.toUpperCase() }); markDirty(); }} />
            </Field>
            <Field label={`Kurs (1 ${header.currency} = ? IDR)`}>
              <input type="number" step="0.01" className={`${inputCls} font-mono`} value={header.kursForeign} onChange={(e) => { setHeader({ ...header, kursForeign: Number(e.target.value) }); markDirty(); }} />
            </Field>
            <Field label="Margin (%)">
              <input type="number" step="0.5" className={`${inputCls} font-mono`} value={header.marginPct} onChange={(e) => { setHeader({ ...header, marginPct: Number(e.target.value) }); markDirty(); }} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Round selling ke kelipatan IDR">
              <input type="number" step="10000" className={`${inputCls} font-mono`} value={header.roundIdrTo} onChange={(e) => { setHeader({ ...header, roundIdrTo: Number(e.target.value) }); markDirty(); }} />
            </Field>
            <Field label="Berlaku sampai">
              <input type="date" className={inputCls} value={header.validUntil} onChange={(e) => { setHeader({ ...header, validUntil: e.target.value }); markDirty(); }} />
            </Field>
          </div>
          <Field label="Catatan (internal)">
            <textarea rows={3} className={inputCls} value={header.notes} onChange={(e) => { setHeader({ ...header, notes: e.target.value }); markDirty(); }} />
          </Field>
        </div>
      )}

      {/* === DAYS === */}
      {tab === "days" && (
        <div className="space-y-3">
          {days.map((d, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0C2647" }}>
                    {d.dayIndex}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hari {d.dayIndex}</span>
                </div>
                <button onClick={() => removeDay(i)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input type="date" className={inputCls} value={d.date ?? ""} onChange={(e) => updateDay(i, { date: e.target.value || null })} />
                <input className={inputCls} placeholder="Kota (mis. Moscow)" value={d.city ?? ""} onChange={(e) => updateDay(i, { city: e.target.value })} />
                <input className={inputCls} placeholder="Judul hari (mis. Tiba di Moscow)" value={d.title ?? ""} onChange={(e) => updateDay(i, { title: e.target.value })} />
              </div>
              <input
                className={`${inputCls} mb-2`}
                placeholder="Highlights, pisah dengan koma (Red Square, Kremlin, St Basil)"
                value={d.highlights.join(", ")}
                onChange={(e) => updateDay(i, { highlights: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
              <textarea
                rows={4}
                className={inputCls}
                placeholder="Narasi hari ini (deskripsi yang akan muncul di itinerary PDF)…"
                value={d.narrativeHtml}
                onChange={(e) => updateDay(i, { narrativeHtml: e.target.value })}
              />
            </div>
          ))}
          <button onClick={addDay} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:text-orange-600 hover:border-orange-400 flex items-center justify-center gap-2">
            <Plus size={16} /> Tambah Hari
          </button>
        </div>
      )}

      {/* === COSTS === */}
      {tab === "costs" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium">Komponen Biaya ({costs.length})</span>
              <button onClick={() => addCost()} className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700">
                <Plus size={13} /> Tambah Manual
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500">
                  <tr>
                    <th className="text-left px-2 py-2">Hari</th>
                    <th className="text-left px-2 py-2">Kategori</th>
                    <th className="text-left px-2 py-2">Label</th>
                    <th className="text-right px-2 py-2">{header.currency}</th>
                    <th className="text-right px-2 py-2">IDR</th>
                    <th className="text-right px-2 py-2">Qty</th>
                    <th className="text-center px-2 py-2">/pax</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((c, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-1 py-1">
                        <select className="w-16 px-1 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                          value={c.dayIndex ?? ""}
                          onChange={(e) => updateCost(i, { dayIndex: e.target.value ? Number(e.target.value) : null })}>
                          <option value="">all</option>
                          {days.map((d) => <option key={d.dayIndex} value={d.dayIndex}>{d.dayIndex}</option>)}
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <select className="px-1 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                          value={c.category}
                          onChange={(e) => updateCost(i, { category: e.target.value as CostCategory })}>
                          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{CATEGORY_LABEL[cat]}</option>)}
                        </select>
                      </td>
                      <td className="px-1 py-1">
                        <input className="w-full px-1 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                          value={c.label} onChange={(e) => updateCost(i, { label: e.target.value })} placeholder="mis. Hotel Moscow" />
                      </td>
                      <td className="px-1 py-1">
                        <input type="number" step="0.01" className="w-20 px-1 py-1 text-right text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 font-mono"
                          value={c.valueForeign ?? ""} onChange={(e) => updateCost(i, { valueForeign: e.target.value === "" ? null : Number(e.target.value) })} />
                      </td>
                      <td className="px-1 py-1">
                        <input type="number" step="1000" className="w-24 px-1 py-1 text-right text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 font-mono"
                          value={c.valueIdr ?? ""} onChange={(e) => updateCost(i, { valueIdr: e.target.value === "" ? null : Number(e.target.value) })} />
                      </td>
                      <td className="px-1 py-1">
                        <input type="number" step="0.5" className="w-14 px-1 py-1 text-right text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 font-mono"
                          value={c.qty} onChange={(e) => updateCost(i, { qty: Number(e.target.value) || 1 })} />
                      </td>
                      <td className="px-1 py-1 text-center">
                        <input type="checkbox" checked={c.perPax} onChange={(e) => updateCost(i, { perPax: e.target.checked })} />
                      </td>
                      <td className="px-1 py-1">
                        <button onClick={() => removeCost(i)} className="text-gray-400 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {costs.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-xs">Belum ada komponen. Tambah manual atau pilih dari template di samping →</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Templates picker */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Sparkles size={14} className="text-orange-600" />
              <span className="text-sm font-medium">Library Komponen — {header.country}</span>
            </div>
            <div className="p-3 max-h-[600px] overflow-y-auto space-y-2">
              {templates.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">
                  Belum ada template untuk {header.country}.<br />
                  Tambah komponen manual; nanti bisa dijadikan template.
                </p>
              )}
              {templates.map((t) => (
                <button key={t.id} onClick={() => addCostFromTemplate(t)}
                  className="w-full text-left px-3 py-2 rounded border border-gray-100 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t.label}</span>
                    <span className="text-[10px] text-gray-400">{CATEGORY_LABEL[t.category]}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center justify-between mt-0.5">
                    <span>{t.city ?? "—"}</span>
                    <span className="font-mono">
                      {t.valueForeign != null
                        ? fmtForeign(t.valueForeign, t.currency)
                        : rupiahShort(t.valueIdr ?? 0)}
                      {t.perPax ? " /pax" : " flat"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === PRICING === */}
      {tab === "pricing" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium">PAX Tiers</h3>
                <p className="text-xs text-gray-500">Pisah dengan koma. Default: {DEFAULT_PAX_TIERS.join(", ")}</p>
              </div>
              <button
                onClick={() => setPaxList([...DEFAULT_PAX_TIERS])}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-orange-600"
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>
            <input
              className={`${inputCls} font-mono`}
              value={paxList.join(", ")}
              onChange={(e) => {
                const parts = e.target.value.split(",").map((s) => Number(s.trim())).filter((n) => n > 0);
                setPaxList(parts);
                markDirty();
              }}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-2">PAX</th>
                  <th className="text-right px-4 py-2">COGS {header.currency}/pax</th>
                  <th className="text-right px-4 py-2">COGS IDR/pax</th>
                  <th className="text-right px-4 py-2">Selling IDR/pax</th>
                  <th className="text-right px-4 py-2">Margin/pax</th>
                  <th className="text-right px-4 py-2">Margin Total</th>
                </tr>
              </thead>
              <tbody>
                {pricingRows.map((r) => (
                  <tr key={r.paxCount} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 font-semibold">{r.paxCount}</td>
                    <td className="px-4 py-2 text-right font-mono">{Math.round(r.cogsForeignPerPax).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600">{rupiah(r.cogsIdrPerPax)}</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold text-emerald-700">{rupiah(r.sellingIdr)}</td>
                    <td className="px-4 py-2 text-right font-mono">{rupiah(r.marginIdr)}</td>
                    <td className="px-4 py-2 text-right font-mono text-gray-600">{rupiahShort(r.marginIdr * r.paxCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              Live preview. Klik <strong>Simpan Perubahan</strong> di atas untuk persist + recalc di DB.
            </p>
          </div>
        </div>
      )}

      {/* === ADDONS === */}
      {tab === "addons" && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-2">Label</th>
                  <th className="text-right px-4 py-2">Harga IDR /pax</th>
                  <th className="text-left px-4 py-2">Catatan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {addons.map((a, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-2 py-1"><input className={inputCls} value={a.label} onChange={(e) => updateAddon(i, { label: e.target.value })} placeholder="mis. Visa Russia" /></td>
                    <td className="px-2 py-1"><input type="number" step="10000" className={`${inputCls} text-right font-mono`} value={a.priceIdr} onChange={(e) => updateAddon(i, { priceIdr: Number(e.target.value) || 0 })} /></td>
                    <td className="px-2 py-1"><input className={inputCls} value={a.notes ?? ""} onChange={(e) => updateAddon(i, { notes: e.target.value })} /></td>
                    <td className="px-2 py-1"><button onClick={() => removeAddon(i)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
                {addons.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-xs text-gray-400">Belum ada add-on.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button onClick={addAddon} className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:text-orange-600 hover:border-orange-400 flex items-center justify-center gap-2">
            <Plus size={16} /> Tambah Add-on
          </button>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span>
      {children}
    </label>
  );
}
