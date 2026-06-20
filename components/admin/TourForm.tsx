"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import StickyFormActions from "./StickyFormActions";

type ItineraryItem = { day: number; title: string; description: string };
type AddOnTag = "" | "wajib" | "recommended";
type AddOnDraft = { name: string; price: string | number; desc: string };
type PaymentPlanMode = "auto" | "manual" | "hidden";
type PaymentPlanStepDraft = { label: string; dueDate: string; amount: string | number };
export type PaymentPlanFormConfig = {
  mode: PaymentPlanMode;
  title?: string;
  intro?: string;
  paymentMethodsLabel?: string;
  urgencyLabel?: string;
  finePrint?: string;
  steps: PaymentPlanStepDraft[];
};

export interface TourData {
  id?: string;
  title?: string;
  country?: string;
  cityHighlight?: string;
  price?: number;
  promoPrice?: number | null;
  priceLandTour?: number | null;
  seatsLeft?: number;
  status?: string;
  pinned?: boolean;
  tripDate?: string;
  duration?: string;
  inclusions?: string[];
  exclusions?: string[];
  gallery?: string[];
  heroImg?: string;
  badge?: string;
  notes?: string;
  description?: string;
  visaInfo?: string;
  itinerary?: ItineraryItem[];
  addOns?: { name: string; price: number; tag?: AddOnTag; desc?: string }[];
  paymentPlan?: PaymentPlanFormConfig;
}

interface TourFormDraft {
  version: 1;
  updatedAt: string;
  form: TourData;
  inclusionInput: string;
  exclusionInput: string;
  editingInclusionIdx: number | null;
  editingExclusionIdx: number | null;
  itineraryItem: ItineraryItem;
  editingItineraryIdx: number | null;
  addOnItem: AddOnDraft;
}

function buildInitialForm(tour?: TourData): TourData {
  return {
    title: tour?.title ?? "",
    country: tour?.country ?? "",
    cityHighlight: tour?.cityHighlight ?? "",
    price: tour?.price ?? 0,
    promoPrice: tour?.promoPrice ?? null,
    priceLandTour: tour?.priceLandTour ?? null,
    seatsLeft: tour?.seatsLeft ?? 0,
    status: tour?.status ?? "DRAFT",
    pinned: tour?.pinned ?? false,
    tripDate: tour?.tripDate ? new Date(tour.tripDate).toISOString().slice(0, 10) : "",
    duration: tour?.duration ?? "",
    inclusions: tour?.inclusions ?? [],
    exclusions: tour?.exclusions ?? [],
    gallery: tour?.gallery ?? [],
    heroImg: tour?.heroImg ?? "",
    badge: tour?.badge ?? "",
    notes: tour?.notes ?? "",
    description: tour?.description ?? "",
    visaInfo: tour?.visaInfo ?? "",
    itinerary: tour?.itinerary ?? [],
    addOns: tour?.addOns ?? [],
    paymentPlan: normalizePaymentPlanConfig(tour?.paymentPlan),
  };
}

function getNextItineraryDay(items?: ItineraryItem[]) {
  return (items ?? []).reduce((max, item) => Math.max(max, Number(item.day) || 0), 0) + 1;
}

function emptyItineraryItem(items?: ItineraryItem[]): ItineraryItem {
  return { day: getNextItineraryDay(items), title: "", description: "" };
}

function emptyAddOnItem(): AddOnDraft {
  return { name: "", price: "", desc: "" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dateInputValue(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizePaymentPlanConfig(value: unknown): PaymentPlanFormConfig {
  if (!isRecord(value)) return { mode: "auto", steps: [] };

  const mode: PaymentPlanMode =
    value.mode === "manual" ? "manual" :
    value.mode === "hidden" ? "hidden" :
    "auto";

  return {
    mode,
    title: optionalString(value.title),
    intro: optionalString(value.intro),
    paymentMethodsLabel: optionalString(value.paymentMethodsLabel),
    urgencyLabel: optionalString(value.urgencyLabel),
    finePrint: optionalString(value.finePrint),
    steps: Array.isArray(value.steps)
      ? value.steps.flatMap((step) => {
          if (!isRecord(step)) return [];
          return [{
            label: optionalString(step.label),
            dueDate: dateInputValue(step.dueDate),
            amount: typeof step.amount === "number" || typeof step.amount === "string" ? step.amount : "",
          }];
        })
      : [],
  };
}

function dateInputFromDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDaysToInputDate(value: string, days: number) {
  const date = value ? new Date(`${value}T12:00:00+07:00`) : new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return dateInputFromDate(date);
}

function roundToThousand(amount: number) {
  return Math.round(amount / 1000) * 1000;
}

function paymentPlanTotal(form: TourData) {
  const basePrice = Number(form.promoPrice ?? form.price ?? 0) || 0;
  const mandatoryTotal = (form.addOns ?? [])
    .filter((item) => item.tag === "wajib")
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return basePrice + mandatoryTotal;
}

function paymentPlanTemplate(form: TourData): PaymentPlanStepDraft[] {
  const total = roundToThousand(paymentPlanTotal(form));
  const dpAmount = total < 3_000_000
    ? roundToThousand(total * 0.35)
    : Math.min(1_500_000, roundToThousand(total * 0.45));
  const remaining = Math.max(0, total - dpAmount);
  const secondAmount = roundToThousand(remaining / 2);
  const bookingDate = dateInputFromDate(new Date());
  const finalDate = form.tripDate ? addDaysToInputDate(form.tripDate, -21) : "";

  return [
    { label: "DP1", dueDate: bookingDate, amount: dpAmount },
    { label: "Cicilan 2", dueDate: addDaysToInputDate(bookingDate, 7), amount: secondAmount },
    { label: "Cicilan Terakhir", dueDate: finalDate, amount: remaining - secondAmount },
  ];
}

function normalizePaymentPlanForSubmit(value: unknown): { ok: true; value: Record<string, unknown> | null } | { ok: false; error: string } {
  const paymentPlan = normalizePaymentPlanConfig(value);
  if (paymentPlan.mode === "auto") return { ok: true, value: null };
  if (paymentPlan.mode === "hidden") return { ok: true, value: { mode: "hidden" } };

  const steps = paymentPlan.steps.flatMap((step) => {
    const label = step.label.trim();
    const dueDate = step.dueDate.trim();
    const amount = Number(step.amount);
    if (!label || !dueDate || !Number.isFinite(amount) || amount < 0) return [];
    return [{ label, dueDate, amount }];
  });

  if (steps.length === 0) {
    return { ok: false, error: "Minimal satu tahap pembayaran manual wajib diisi lengkap." };
  }

  return {
    ok: true,
    value: {
      mode: "manual",
      title: paymentPlan.title?.trim() || undefined,
      intro: paymentPlan.intro?.trim() || undefined,
      paymentMethodsLabel: paymentPlan.paymentMethodsLabel?.trim() || undefined,
      urgencyLabel: paymentPlan.urgencyLabel?.trim() || undefined,
      finePrint: paymentPlan.finePrint?.trim() || undefined,
      steps,
    },
  };
}

function sortItinerary(items: ItineraryItem[]) {
  return [...items].sort((a, b) => a.day - b.day);
}

function formatDraftTime(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function hasDraftWork(draft: TourFormDraft, initialForm: TourData) {
  return (
    JSON.stringify(draft.form) !== JSON.stringify(initialForm) ||
    draft.inclusionInput.trim() !== "" ||
    draft.exclusionInput.trim() !== "" ||
    draft.itineraryItem.title.trim() !== "" ||
    draft.itineraryItem.description.trim() !== "" ||
    draft.addOnItem.name.trim() !== "" ||
    draft.addOnItem.desc.trim() !== "" ||
    String(draft.addOnItem.price).trim() !== ""
  );
}

function readNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function persistDraft(draftKey: string, draft: TourFormDraft, initialForm: TourData) {
  try {
    if (hasDraftWork(draft, initialForm)) {
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
      return "saved";
    }

    window.localStorage.removeItem(draftKey);
    return "cleared";
  } catch {
    return "error";
  }
}

export default function TourForm({ tour, returnHref = "/admin/tours" }: { tour?: TourData; returnHref?: string }) {
  const router = useRouter();
  const isEdit = !!tour?.id;
  const initialForm = useMemo(() => buildInitialForm(tour), [tour]);
  const draftKey = `sundaf:tour-form-draft:${tour?.id ?? "new"}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<TourData>(initialForm);

  const [inclusionInput, setInclusionInput] = useState("");
  const [exclusionInput, setExclusionInput] = useState("");
  const [editingInclusionIdx, setEditingInclusionIdx] = useState<number | null>(null);
  const [editingExclusionIdx, setEditingExclusionIdx] = useState<number | null>(null);
  const [itineraryItem, setItineraryItem] = useState<ItineraryItem>(() => emptyItineraryItem(initialForm.itinerary));
  const [editingItineraryIdx, setEditingItineraryIdx] = useState<number | null>(null);
  const [addOnItem, setAddOnItem] = useState<AddOnDraft>(() => emptyAddOnItem());
  const [loadedDraftKey, setLoadedDraftKey] = useState<string | null>(null);
  const [draftRestoredAt, setDraftRestoredAt] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [draftError, setDraftError] = useState("");
  const latestDraftRef = useRef<{ draftKey: string; draft: TourFormDraft; initialForm: TourData } | null>(null);
  const suppressDraftPersistRef = useRef(false);

  latestDraftRef.current = !suppressDraftPersistRef.current && loadedDraftKey === draftKey
    ? {
        draftKey,
        initialForm,
        draft: {
          version: 1,
          updatedAt: new Date().toISOString(),
          form,
          inclusionInput,
          exclusionInput,
          editingInclusionIdx,
          editingExclusionIdx,
          itineraryItem,
          editingItineraryIdx,
          addOnItem,
        },
      }
    : null;

  useEffect(() => {
    suppressDraftPersistRef.current = false;
    const timer = window.setTimeout(() => {
      setLoadedDraftKey(null);
      setDraftError("");
      setDraftRestoredAt(null);
      setDraftSavedAt(null);

      try {
        const rawDraft = window.localStorage.getItem(draftKey);
        if (!rawDraft) {
          setForm(initialForm);
          setItineraryItem(emptyItineraryItem(initialForm.itinerary));
          setLoadedDraftKey(draftKey);
          return;
        }

        const draft = JSON.parse(rawDraft) as Partial<TourFormDraft>;
        const restoredForm: TourData = {
          ...initialForm,
          ...(draft.form ?? {}),
        };

        restoredForm.inclusions = Array.isArray(restoredForm.inclusions) ? restoredForm.inclusions : [];
        restoredForm.exclusions = Array.isArray(restoredForm.exclusions) ? restoredForm.exclusions : [];
        restoredForm.gallery = Array.isArray(restoredForm.gallery) ? restoredForm.gallery : [];
        restoredForm.itinerary = Array.isArray(restoredForm.itinerary) ? sortItinerary(restoredForm.itinerary) : [];
        restoredForm.addOns = Array.isArray(restoredForm.addOns) ? restoredForm.addOns : [];
        restoredForm.paymentPlan = normalizePaymentPlanConfig(restoredForm.paymentPlan);

        setForm(restoredForm);
        setInclusionInput(typeof draft.inclusionInput === "string" ? draft.inclusionInput : "");
        setExclusionInput(typeof draft.exclusionInput === "string" ? draft.exclusionInput : "");
        setEditingInclusionIdx(readNumberOrNull(draft.editingInclusionIdx));
        setEditingExclusionIdx(readNumberOrNull(draft.editingExclusionIdx));
        setItineraryItem(draft.itineraryItem?.title || draft.itineraryItem?.description
          ? {
              day: Number(draft.itineraryItem.day) || getNextItineraryDay(restoredForm.itinerary),
              title: draft.itineraryItem.title ?? "",
              description: draft.itineraryItem.description ?? "",
            }
          : emptyItineraryItem(restoredForm.itinerary)
        );
        setEditingItineraryIdx(readNumberOrNull(draft.editingItineraryIdx));
        setAddOnItem({
          name: draft.addOnItem?.name ?? "",
          price: draft.addOnItem?.price ?? "",
          desc: draft.addOnItem?.desc ?? "",
        });

        const restoredAt = typeof draft.updatedAt === "string" ? draft.updatedAt : new Date().toISOString();
        setDraftRestoredAt(restoredAt);
        setDraftSavedAt(restoredAt);
        setLoadedDraftKey(draftKey);
      } catch {
        window.localStorage.removeItem(draftKey);
        setForm(initialForm);
        setItineraryItem(emptyItineraryItem(initialForm.itinerary));
        setDraftError("Draft lokal rusak dan sudah dibersihkan.");
        setLoadedDraftKey(draftKey);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [draftKey, initialForm]);

  useEffect(() => {
    if (loadedDraftKey !== draftKey) return;

    const draft: TourFormDraft = {
      version: 1,
      updatedAt: new Date().toISOString(),
      form,
      inclusionInput,
      exclusionInput,
      editingInclusionIdx,
      editingExclusionIdx,
      itineraryItem,
      editingItineraryIdx,
      addOnItem,
    };

    const timer = window.setTimeout(() => {
      const result = persistDraft(draftKey, draft, initialForm);
      if (result === "saved") {
        setDraftSavedAt(draft.updatedAt);
        setDraftError("");
      } else if (result === "cleared") {
        setDraftSavedAt(null);
      } else {
        setDraftError("Draft lokal belum bisa disimpan di browser ini.");
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    loadedDraftKey,
    draftKey,
    initialForm,
    form,
    inclusionInput,
    exclusionInput,
    editingInclusionIdx,
    editingExclusionIdx,
    itineraryItem,
    editingItineraryIdx,
    addOnItem,
  ]);

  useEffect(() => {
    const persistLatestDraft = () => {
      if (suppressDraftPersistRef.current) return;

      const snapshot = latestDraftRef.current;
      if (!snapshot) return;

      persistDraft(snapshot.draftKey, {
        ...snapshot.draft,
        updatedAt: new Date().toISOString(),
      }, snapshot.initialForm);
    };
    const persistOnHidden = () => {
      if (document.visibilityState === "hidden") persistLatestDraft();
    };

    window.addEventListener("pagehide", persistLatestDraft);
    window.addEventListener("beforeunload", persistLatestDraft);
    document.addEventListener("visibilitychange", persistOnHidden);

    return () => {
      persistLatestDraft();
      window.removeEventListener("pagehide", persistLatestDraft);
      window.removeEventListener("beforeunload", persistLatestDraft);
      document.removeEventListener("visibilitychange", persistOnHidden);
    };
  }, []);

  function discardLocalDraft() {
    window.localStorage.removeItem(draftKey);
    setForm(initialForm);
    setInclusionInput("");
    setExclusionInput("");
    setEditingInclusionIdx(null);
    setEditingExclusionIdx(null);
    setItineraryItem(emptyItineraryItem(initialForm.itinerary));
    setEditingItineraryIdx(null);
    setAddOnItem(emptyAddOnItem());
    setDraftRestoredAt(null);
    setDraftSavedAt(null);
    setDraftError("");
  }

  // commit helpers untuk inclusions/exclusions (tambah baru ATAU simpan editan)
  function commitInclusion() {
    if (!inclusionInput.trim()) return;
    if (editingInclusionIdx !== null) {
      const updated = [...(form.inclusions ?? [])];
      updated[editingInclusionIdx] = inclusionInput.trim();
      set("inclusions", updated);
      setEditingInclusionIdx(null);
    } else {
      set("inclusions", [...(form.inclusions ?? []), inclusionInput.trim()]);
    }
    setInclusionInput("");
  }
  function commitExclusion() {
    if (!exclusionInput.trim()) return;
    if (editingExclusionIdx !== null) {
      const updated = [...(form.exclusions ?? [])];
      updated[editingExclusionIdx] = exclusionInput.trim();
      set("exclusions", updated);
      setEditingExclusionIdx(null);
    } else {
      set("exclusions", [...(form.exclusions ?? []), exclusionInput.trim()]);
    }
    setExclusionInput("");
  }
  function cycleAddOnTag(i: number) {
    const next: Record<AddOnTag, AddOnTag> = { "": "wajib", wajib: "recommended", recommended: "" };
    set("addOns", (form.addOns ?? []).map((a, j) => (j === i ? { ...a, tag: next[a.tag ?? ""] } : a)));
  }
  function setAddOnDesc(i: number, desc: string) {
    set("addOns", (form.addOns ?? []).map((a, j) => (j === i ? { ...a, desc } : a)));
  }

  function set(key: keyof TourData, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const paymentPlan = normalizePaymentPlanConfig(form.paymentPlan);

  function setPaymentPlan(partial: Partial<PaymentPlanFormConfig>) {
    set("paymentPlan", { ...paymentPlan, ...partial });
  }

  function setPaymentPlanStep(i: number, partial: Partial<PaymentPlanStepDraft>) {
    const steps = paymentPlan.steps.map((step, j) => (i === j ? { ...step, ...partial } : step));
    setPaymentPlan({ steps });
  }

  function addPaymentPlanStep() {
    setPaymentPlan({
      mode: "manual",
      steps: [
        ...paymentPlan.steps,
        { label: "", dueDate: "", amount: "" },
      ],
    });
  }

  function removePaymentPlanStep(i: number) {
    setPaymentPlan({ steps: paymentPlan.steps.filter((_, j) => i !== j) });
  }

  function commitItineraryItem() {
    const item: ItineraryItem = {
      day: Number(itineraryItem.day) || getNextItineraryDay(form.itinerary),
      title: itineraryItem.title.trim(),
      description: itineraryItem.description.trim(),
    };
    if (!item.title) return;

    const updated = editingItineraryIdx !== null
      ? (form.itinerary ?? []).map((current, i) => (i === editingItineraryIdx ? item : current))
      : [...(form.itinerary ?? []), item];
    const sorted = sortItinerary(updated);

    set("itinerary", sorted);
    setEditingItineraryIdx(null);
    setItineraryItem(emptyItineraryItem(sorted));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const paymentPlanForSubmit = normalizePaymentPlanForSubmit(form.paymentPlan);
    if (!paymentPlanForSubmit.ok) {
      setLoading(false);
      setError(paymentPlanForSubmit.error);
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
      promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
      priceLandTour: form.priceLandTour ? Number(form.priceLandTour) : null,
      seatsLeft: Number(form.seatsLeft),
      tripDate: form.tripDate ? new Date(form.tripDate).toISOString() : null,
      paymentPlan: paymentPlanForSubmit.value,
    };
    const res = await fetch(isEdit ? `/api/tours/${tour!.id}` : "/api/tours", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      suppressDraftPersistRef.current = true;
      latestDraftRef.current = null;
      window.localStorage.removeItem(draftKey);
      router.push(returnHref);
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
      <StickyFormActions
        loading={loading}
        primaryLabel={isEdit ? "Simpan Perubahan" : "Buat Tour"}
        cancelHref={returnHref}
      />
      {(draftError || draftRestoredAt || draftSavedAt) && (
        <div className={`p-4 border rounded-xl text-sm font-medium flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
          draftError
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
            : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
        }`}>
          <span>
            {draftError || (draftRestoredAt
              ? `Draft lokal dipulihkan (${formatDraftTime(draftRestoredAt)}). Autosave terakhir ${formatDraftTime(draftSavedAt)}.`
              : `Draft lokal tersimpan otomatis ${formatDraftTime(draftSavedAt)}.`)}
          </span>
          {!draftError && (
            <button type="button" onClick={discardLocalDraft}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/70 dark:bg-gray-800/70 text-xs font-semibold text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 hover:bg-white dark:hover:bg-gray-800">
              Buang draft lokal
            </button>
          )}
        </div>
      )}
      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Informasi Dasar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Judul Tour *">
            <input required className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
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
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Kosongkan untuk By Request / Tanggal fleksibel.</p>
          </Field>
          <Field label="Sisa Seat / Kapasitas">
            <input type="number" min={0} className="input" value={form.seatsLeft} onChange={(e) => set("seatsLeft", e.target.value)} />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Untuk private by request, 0 akan tampil sebagai Private / By Request.</p>
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
          <Field label="Tour Pilihan">
            <label className="flex min-h-10 items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={!!form.pinned}
                onChange={(e) => set("pinned", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Pin ke Tour Pilihan</span>
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maksimal 5 tour dipin. Urutan tetap tanggal terdekat.</p>
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

      {/* Payment Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Skema Pembayaran</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Default otomatis mengikuti harga, add-on wajib, tanggal booking, dan tanggal keberangkatan.
            </p>
          </div>
          <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            Total acuan: Rp {paymentPlanTotal(form).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Mode">
            <select
              className="input"
              value={paymentPlan.mode}
              onChange={(e) => setPaymentPlan({ mode: e.target.value as PaymentPlanMode })}
            >
              <option value="auto">Otomatis</option>
              <option value="manual">Manual dari CMS</option>
              <option value="hidden">Sembunyikan</option>
            </select>
          </Field>
        </div>

        {paymentPlan.mode === "auto" && (
          <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            Otomatis: DP default Rp 1.500.000, cicilan kedua H+7 dari booking, dan cicilan terakhir mengikuti jarak keberangkatan.
            Jika tanggal keberangkatan kosong, skema tidak tampil di halaman publik.
          </p>
        )}

        {paymentPlan.mode === "hidden" && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            Skema pembayaran tidak akan tampil di halaman tour dan PDF, walaupun tour punya tanggal keberangkatan.
          </p>
        )}

        {paymentPlan.mode === "manual" && (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Judul Section">
                <input
                  className="input"
                  placeholder="Booking Seat DP 1 Juta-an"
                  value={paymentPlan.title ?? ""}
                  onChange={(e) => setPaymentPlan({ title: e.target.value })}
                />
              </Field>
              <Field label="Teks Urgensi">
                <input
                  className="input"
                  placeholder="Sisa 5 traveler lagi - gas sebelum habis 🙂"
                  value={paymentPlan.urgencyLabel ?? ""}
                  onChange={(e) => setPaymentPlan({ urgencyLabel: e.target.value })}
                />
              </Field>
              <Field label="Kalimat Pembuka">
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Pembayaran aman dan fleksibel..."
                  value={paymentPlan.intro ?? ""}
                  onChange={(e) => setPaymentPlan({ intro: e.target.value })}
                />
              </Field>
              <Field label="Metode Pembayaran">
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Tersedia bank transfer, QRIS, e-wallet..."
                  value={paymentPlan.paymentMethodsLabel ?? ""}
                  onChange={(e) => setPaymentPlan({ paymentMethodsLabel: e.target.value })}
                />
              </Field>
            </div>

            <div>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="label">Tahapan Pembayaran</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentPlan({ mode: "manual", steps: paymentPlanTemplate(form) })}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Pakai template 3 tahap
                  </button>
                  <button
                    type="button"
                    onClick={addPaymentPlanStep}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Tambah tahap
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {paymentPlan.steps.map((step, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700 md:grid-cols-[1fr_10rem_11rem_auto]">
                    <input
                      className="input"
                      placeholder="DP1"
                      value={step.label}
                      onChange={(e) => setPaymentPlanStep(i, { label: e.target.value })}
                    />
                    <input
                      type="date"
                      className="input"
                      value={step.dueDate}
                      onChange={(e) => setPaymentPlanStep(i, { dueDate: e.target.value })}
                    />
                    <input
                      type="number"
                      min={0}
                      className="input"
                      placeholder="Nominal"
                      value={step.amount}
                      onChange={(e) => setPaymentPlanStep(i, { amount: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removePaymentPlanStep(i)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                {paymentPlan.steps.length === 0 && (
                  <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    Belum ada tahap manual. Klik &quot;Pakai template 3 tahap&quot; atau &quot;Tambah tahap&quot;.
                  </p>
                )}
              </div>
            </div>

            <Field label="Catatan Kecil">
              <input
                className="input"
                placeholder="Jadwal pembayaran disesuaikan oleh tim Sundaf di CMS."
                value={paymentPlan.finePrint ?? ""}
                onChange={(e) => setPaymentPlan({ finePrint: e.target.value })}
              />
            </Field>
          </div>
        )}
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
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitInclusion(); }}}
                placeholder={editingInclusionIdx !== null ? "Edit lalu Enter / Simpan" : "Tekan Enter untuk tambah"} />
              <button type="button" onClick={commitInclusion}
                className={`px-3 py-2 text-white rounded-lg text-sm whitespace-nowrap ${editingInclusionIdx !== null ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
                {editingInclusionIdx !== null ? "Simpan" : "+"}</button>
              {editingInclusionIdx !== null && (
                <button type="button" onClick={() => { setEditingInclusionIdx(null); setInclusionInput(""); }}
                  className="px-3 py-2 bg-gray-400 text-white rounded-lg text-sm">Batal</button>
              )}
            </div>
            <ul className="space-y-1">
              {(form.inclusions ?? []).map((item, i) => (
                <li key={i} className={`flex items-center justify-between text-sm px-3 py-1.5 rounded ${editingInclusionIdx === i ? "ring-2 ring-blue-400 bg-green-50 dark:bg-green-900/20" : "bg-green-50 dark:bg-green-900/20"} text-green-800 dark:text-green-300`}>
                  <span className="min-w-0 break-words">✓ {item}</span>
                  <span className="flex items-center gap-1 shrink-0 ml-2">
                    <button type="button" title="Edit"
                      onClick={() => { setInclusionInput(item); setEditingInclusionIdx(i); setEditingExclusionIdx(null); }}
                      className="text-blue-500 hover:text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button type="button" title="Hapus" onClick={() => { if (editingInclusionIdx === i) { setEditingInclusionIdx(null); setInclusionInput(""); } set("inclusions", form.inclusions!.filter((_, j) => j !== i)); }} className="text-red-500">×</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="label mb-2">Tidak Termasuk</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" value={exclusionInput} onChange={(e) => setExclusionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitExclusion(); }}}
                placeholder={editingExclusionIdx !== null ? "Edit lalu Enter / Simpan" : "Tekan Enter untuk tambah"} />
              <button type="button" onClick={commitExclusion}
                className={`px-3 py-2 text-white rounded-lg text-sm whitespace-nowrap ${editingExclusionIdx !== null ? "bg-blue-600 hover:bg-blue-700" : "bg-red-500 hover:bg-red-600"}`}>
                {editingExclusionIdx !== null ? "Simpan" : "+"}</button>
              {editingExclusionIdx !== null && (
                <button type="button" onClick={() => { setEditingExclusionIdx(null); setExclusionInput(""); }}
                  className="px-3 py-2 bg-gray-400 text-white rounded-lg text-sm">Batal</button>
              )}
            </div>
            <ul className="space-y-1">
              {(form.exclusions ?? []).map((item, i) => (
                <li key={i} className={`flex items-center justify-between text-sm px-3 py-1.5 rounded ${editingExclusionIdx === i ? "ring-2 ring-blue-400 bg-red-50 dark:bg-red-900/20" : "bg-red-50 dark:bg-red-900/20"} text-red-800 dark:text-red-300`}>
                  <span className="min-w-0 break-words">✗ {item}</span>
                  <span className="flex items-center gap-1 shrink-0 ml-2">
                    <button type="button" title="Edit"
                      onClick={() => { setExclusionInput(item); setEditingExclusionIdx(i); setEditingInclusionIdx(null); }}
                      className="text-blue-500 hover:text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button type="button" title="Hapus" onClick={() => { if (editingExclusionIdx === i) { setEditingExclusionIdx(null); setExclusionInput(""); } set("exclusions", form.exclusions!.filter((_, j) => j !== i)); }} className="text-red-500">×</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Itinerary</h2>

        {editingItineraryIdx === null && (
          <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
            <ItineraryItemFields
              item={itineraryItem}
              onChange={setItineraryItem}
              onSubmit={commitItineraryItem}
              submitLabel="Tambah"
              submitTone="add"
            />
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {(form.itinerary ?? []).map((item, i) => (
            editingItineraryIdx === i ? (
              <div
                key={i}
                className="rounded-lg border border-blue-400 bg-blue-50 p-3 transition-colors dark:bg-blue-900/20"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="shrink-0 rounded bg-blue-100 px-2 py-1 text-center text-xs font-bold text-blue-600 dark:bg-blue-900/30">
                    {item.day}
                  </span>
                  <p className="min-w-0 truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {item.title || `Hari ${item.day}`}
                  </p>
                </div>
                <ItineraryItemFields
                  item={itineraryItem}
                  onChange={setItineraryItem}
                  onSubmit={commitItineraryItem}
                  onCancel={() => {
                    setEditingItineraryIdx(null);
                    setItineraryItem(emptyItineraryItem(form.itinerary));
                  }}
                  submitLabel="Simpan"
                  submitTone="save"
                />
              </div>
            ) : (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-transparent bg-gray-50 px-4 py-3 transition-colors hover:border-gray-300 dark:bg-gray-700 dark:hover:border-gray-600">
                <span className="shrink-0 rounded bg-blue-100 px-2 py-1 text-center text-xs font-bold text-blue-600 dark:bg-blue-900/30">
                  {item.day}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                  {item.description && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => {
                      setItineraryItem({ day: item.day, title: item.title, description: item.description });
                      setEditingItineraryIdx(i);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30">
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    title="Hapus"
                    onClick={() => {
                      const updated = form.itinerary!.filter((_, j) => j !== i);
                      if (editingItineraryIdx === i) {
                        setEditingItineraryIdx(null);
                        setItineraryItem(emptyItineraryItem(updated));
                      } else if (editingItineraryIdx !== null && editingItineraryIdx > i) {
                        setEditingItineraryIdx(editingItineraryIdx - 1);
                      }
                      set("itinerary", updated);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-red-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          ))}
          {(form.itinerary ?? []).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Belum ada itinerary. Tambahkan hari pertama di atas.</p>
          )}
        </div>
      </div>

      {/* Add Ons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Add Ons <span className="font-normal text-gray-400 text-sm">(tidak wajib / opsional)</span></h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Layanan tambahan di luar paket. Klik badge tiap item untuk menandai:
          <span className="mx-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">WAJIB</span>(harus dibeli, mis. bagasi domestik) atau
          <span className="mx-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500 text-white">REKOMENDASI</span>(sangat disarankan). Klik lagi untuk netral.
        </p>
        <div className="grid grid-cols-[1fr_9rem_auto] gap-3 mb-1">
          <label className="label text-xs">Nama Add-On</label>
          <label className="label text-xs">Harga (Rp)</label>
          <span />
        </div>
        <div className="grid grid-cols-[1fr_9rem_auto] gap-3 mb-2">
          <input placeholder="cth: Airport Transfer" className="input" value={addOnItem.name}
            onChange={(e) => setAddOnItem((p) => ({ ...p, name: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLInputElement | null)?.focus(); }}} />
          <input type="number" min={0} placeholder="0" className="input" value={addOnItem.price}
            onChange={(e) => setAddOnItem((p) => ({ ...p, price: e.target.value }))} />
          <button type="button"
            onClick={() => { if (addOnItem.name) { set("addOns", [...(form.addOns ?? []), { name: addOnItem.name, price: Number(addOnItem.price) || 0, desc: addOnItem.desc.trim() || undefined }]); setAddOnItem({ name: "", price: "", desc: "" }); }}}
            className="px-4 bg-blue-600 text-white rounded-lg text-sm">Tambah</button>
        </div>
        <input placeholder="Keterangan (opsional) — apa saja yang didapat? cth: Menginap 1 malam di Sammi Village + makan malam tradisional" className="input mb-4 text-sm"
          value={addOnItem.desc} onChange={(e) => setAddOnItem((p) => ({ ...p, desc: e.target.value }))} />
        <div className="space-y-2">
          {(form.addOns ?? []).map((item, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700 px-4 py-2.5 rounded-lg text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-900 dark:text-white min-w-0 break-words">{item.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <button type="button" onClick={() => cycleAddOnTag(i)}
                    title="Klik untuk ganti: netral → WAJIB → REKOMENDASI"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide transition-colors ${
                      item.tag === "wajib"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : item.tag === "recommended"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                    }`}>
                    {item.tag === "wajib" ? "WAJIB" : item.tag === "recommended" ? "REKOMENDASI" : "+ Badge"}
                  </button>
                  <span className="text-gray-600 dark:text-gray-400">Rp {Number(item.price).toLocaleString("id-ID")}</span>
                  <button type="button" onClick={() => set("addOns", form.addOns!.filter((_, j) => j !== i))} className="text-red-500">×</button>
                </div>
              </div>
              <textarea
                value={item.desc ?? ""}
                onChange={(e) => setAddOnDesc(i, e.target.value)}
                placeholder="Keterangan (opsional): apa saja yang didapat peserta?"
                className="input mt-2 w-full text-xs min-h-[2.25rem] resize-y bg-white/60 dark:bg-gray-800/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Deskripsi Tour (evocative copy untuk kartu + halaman detail) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Deskripsi Tour</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Tampil di kartu tour beranda (excerpt 140 char) dan halaman detail (lengkap). Tulis konkret: rute utama, tempo perjalanan, musim, tipe peserta, dan hal yang benar-benar termasuk. Hindari klaim generik seperti &quot;menakjubkan&quot;, &quot;perjalanan impian&quot;, atau &quot;tak terlupakan&quot; tanpa detail pendukung. Tambahkan bonus &amp; opsional di baris bawah dengan prefix <code className="px-1 rounded bg-gray-100 dark:bg-gray-700">+</code> atau <code className="px-1 rounded bg-gray-100 dark:bg-gray-700">&amp;</code>.
        </p>
        <Field label="Cerita Trip">
          <textarea
            className="input min-h-[220px]"
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder={`Contoh:\n\nRute ini fokus ke Banff dan Jasper dengan ritme santai untuk peserta yang ingin banyak waktu di alam, bukan pindah kota setiap hari. Cocok untuk keluarga atau small group yang ingin pegunungan, danau, dan scenic drive tanpa itinerary terlalu padat. Catatan penting: beberapa spot bergantung cuaca dan musim, jadi urutan kunjungan bisa disesuaikan di lapangan.\n\n+ San Francisco & Seattle\n& Tokyo (free time saat kepulangan)\nOPTIONAL: ALASKA`}
          />
        </Field>
      </div>

      {/* Catatan Penting & Visa */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Catatan Penting & Visa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Catatan Penting">
            <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Mis: Pastikan paspor minimal 6 bulan masa berlaku, vaksin tertentu wajib, dll." />
          </Field>
          <Field label="Informasi Visa">
            <textarea className="input min-h-[100px]" value={form.visaInfo} onChange={(e) => set("visaInfo", e.target.value)} />
          </Field>
        </div>
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

function ItineraryItemFields({
  item,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  submitTone,
}: {
  item: ItineraryItem;
  onChange: (item: ItineraryItem) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  submitTone: "add" | "save";
}) {
  const SubmitIcon = submitTone === "add" ? Plus : Check;

  return (
    <div data-itinerary-fields className="grid grid-cols-1 gap-3 md:grid-cols-[5rem_1fr_minmax(0,2fr)]">
      <input
        type="number"
        min={1}
        placeholder="Hari"
        className="input text-center"
        value={item.day}
        onChange={(e) => onChange({ ...item, day: Number(e.target.value) })}
      />
      <input
        placeholder="Judul"
        className="input"
        value={item.title}
        onChange={(e) => onChange({ ...item, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const descriptionInput = e.currentTarget
              .closest("[data-itinerary-fields]")
              ?.querySelector<HTMLInputElement>("[data-itinerary-description]");
            descriptionInput?.focus();
          }
        }}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          data-itinerary-description
          placeholder="Deskripsi"
          className="input min-w-0 flex-1"
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <div className="flex gap-2 sm:shrink-0">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 sm:flex-none">
              <X size={15} />
              {submitTone === "save" ? "Batal" : "Reset"}
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit}
            className={`inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white transition-colors sm:flex-none ${
              submitTone === "add" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            <SubmitIcon size={15} />
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
