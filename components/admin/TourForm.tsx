"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import StickyFormActions from "./StickyFormActions";
import { adminTourIssues, TOUR_STATUS_HELP, TOUR_STATUS_LABELS } from "@/lib/admin-tour-checks";
import { readApiError } from "@/lib/admin-fetch";

type ItineraryItem = { day: number; title: string; description: string; image?: string };
type AddOnTag = "" | "wajib" | "recommended";
type AddOnItem = { name: string; price: number; tag?: AddOnTag; desc?: string };
type AddOnDraft = { name: string; price: string; desc: string; tag: AddOnTag };
type PaymentPlanMode = "auto" | "manual" | "hidden";
type PaymentPlanStepDraft = { label: string; dueDate: string; amount: string | number };
type RoomPriceCode = "quad" | "triple" | "twin";
type HotelRow = { label: string; value: string };

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
  slug?: string;
  title?: string;
  country?: string;
  cityHighlight?: string;
  price?: number | string;
  promoPrice?: number | string | null;
  priceLandTour?: number | string | null;
  seatsLeft?: number | string;
  status?: string;
  pinned?: boolean;
  tripDate?: string;
  duration?: string;
  inclusions?: string[];
  exclusions?: string[];
  gallery?: string[];
  hotel?: Record<string, unknown> | null;
  heroImg?: string;
  badge?: string;
  notes?: string;
  description?: string;
  visaInfo?: string;
  itinerary?: ItineraryItem[];
  addOns?: AddOnItem[];
  paymentPlan?: PaymentPlanFormConfig;
  /** Diisi form dari `hotel`: daftar hotel per kota. */
  hotelInfo?: HotelRow[];
  /** Diisi form dari `hotel`: harga per tipe kamar (angka sebagai teks). */
  roomPrices?: Record<RoomPriceCode, string>;
}

interface TourFormDraft {
  version: 2;
  updatedAt: string;
  form: TourData;
  inclusionInput: string;
  exclusionInput: string;
  itineraryItem: ItineraryItem;
  editingItineraryIdx: number | null;
  addOnItem: AddOnDraft;
}

interface TourFormProps {
  tour?: TourData;
  returnHref?: string;
  /** Boleh mengubah status (izin tour_status). */
  canChangeStatus: boolean;
  /** Boleh mengatur pin (izin tour_edit). */
  canPin: boolean;
  /** URL publik bila tour sedang tampil. */
  publicHref?: string | null;
  /** Pesan di atas form, mis. saat menduplikat tour. */
  notice?: string;
  /** Kunci draft lokal untuk form baru (template/duplikat punya draft sendiri). */
  draftScope?: string;
}

const ROOM_PRICE_FIELDS: { code: RoomPriceCode; key: string; label: string }[] = [
  { code: "quad", key: "__room_price_quad", label: "4 orang/kamar" },
  { code: "triple", key: "__room_price_triple", label: "3 orang/kamar" },
  { code: "twin", key: "__room_price_twin", label: "2 orang/kamar" },
];
const ROOM_PRICE_KEYS = new Set(ROOM_PRICE_FIELDS.map((field) => field.key));
const STATUS_ORDER = ["DRAFT", "ACTIVE", "FULL", "CANCELLED"] as const;
const ADD_ON_TAG_LABELS: Record<AddOnTag, string> = {
  "": "Opsional",
  wajib: "Wajib (masuk subtotal)",
  recommended: "Disarankan",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function digitsOnly(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? String(Math.round(value)) : "";
  if (typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "");
}

function hotelInfoFrom(hotel: unknown): HotelRow[] {
  if (!isRecord(hotel)) return [];
  return Object.entries(hotel).flatMap(([label, value]) => {
    if (ROOM_PRICE_KEYS.has(label)) return [];
    if (typeof value !== "string" && typeof value !== "number") return [];
    return [{ label, value: String(value) }];
  });
}

function roomPricesFrom(hotel: unknown): Record<RoomPriceCode, string> {
  const record = isRecord(hotel) ? hotel : {};
  return {
    quad: digitsOnly(record.__room_price_quad),
    triple: digitsOnly(record.__room_price_triple),
    twin: digitsOnly(record.__room_price_twin),
  };
}

/** Nilai hotel yang tidak bisa diedit di form (bukan teks/angka) tetap disimpan apa adanya. */
function hotelExtrasFrom(hotel: unknown): Record<string, unknown> {
  if (!isRecord(hotel)) return {};
  return Object.fromEntries(Object.entries(hotel).filter(([key, value]) => (
    !ROOM_PRICE_KEYS.has(key) && typeof value !== "string" && typeof value !== "number"
  )));
}

function buildHotelJson(rows: HotelRow[], roomPrices: Record<RoomPriceCode, string>, extras: Record<string, unknown>) {
  const hotel: Record<string, unknown> = { ...extras };
  for (const row of rows) {
    const label = row.label.trim();
    const value = row.value.trim();
    if (label && value) hotel[label] = value;
  }
  for (const field of ROOM_PRICE_FIELDS) {
    const amount = Number(roomPrices[field.code]);
    if (Number.isFinite(amount) && amount > 0) hotel[field.key] = Math.round(amount);
  }
  return Object.keys(hotel).length > 0 ? hotel : null;
}

function buildInitialForm(tour?: TourData): TourData {
  return {
    title: tour?.title ?? "",
    country: tour?.country ?? "",
    cityHighlight: tour?.cityHighlight ?? "",
    price: tour?.price ?? "",
    promoPrice: tour?.promoPrice ?? "",
    priceLandTour: tour?.priceLandTour ?? "",
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
    itinerary: sortItinerary(Array.isArray(tour?.itinerary) ? tour.itinerary : []),
    addOns: Array.isArray(tour?.addOns) ? tour.addOns : [],
    paymentPlan: normalizePaymentPlanConfig(tour?.paymentPlan),
    hotelInfo: tour?.hotelInfo ?? hotelInfoFrom(tour?.hotel),
    roomPrices: tour?.roomPrices ?? roomPricesFrom(tour?.hotel),
  };
}

function getNextItineraryDay(items?: ItineraryItem[]) {
  return (items ?? []).reduce((max, item) => Math.max(max, Number(item.day) || 0), 0) + 1;
}

function emptyItineraryItem(items?: ItineraryItem[]): ItineraryItem {
  return { day: getNextItineraryDay(items), title: "", description: "", image: "" };
}

function emptyAddOnItem(): AddOnDraft {
  return { name: "", price: "", desc: "", tag: "" };
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

function mandatoryTotal(form: TourData) {
  return (form.addOns ?? [])
    .filter((item) => item.tag === "wajib")
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
}

/** Harga "mulai" yang tampil di website: harga kamar pertama, selain itu promo atau harga normal. */
function headlinePrice(form: TourData) {
  for (const field of ROOM_PRICE_FIELDS) {
    const amount = Number(form.roomPrices?.[field.code]);
    if (Number.isFinite(amount) && amount > 0) return { amount, source: field.label };
  }
  const promo = Number(form.promoPrice);
  if (Number.isFinite(promo) && promo > 0) return { amount: promo, source: "harga promo" };
  const price = Number(form.price);
  return { amount: Number.isFinite(price) && price > 0 ? price : 0, source: "harga normal" };
}

function paymentPlanTotal(form: TourData) {
  return headlinePrice(form).amount + mandatoryTotal(form);
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
    return { ok: false, error: "Skema pembayaran manual: isi minimal satu tahap lengkap (nama, tanggal, nominal)." };
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

function rupiah(amount: number) {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

function hasDraftWork(draft: TourFormDraft, initialForm: TourData) {
  return (
    JSON.stringify(draft.form) !== JSON.stringify(initialForm) ||
    draft.inclusionInput.trim() !== "" ||
    draft.exclusionInput.trim() !== "" ||
    draft.itineraryItem.title.trim() !== "" ||
    draft.itineraryItem.description.trim() !== "" ||
    (draft.itineraryItem.image?.trim() ?? "") !== "" ||
    draft.addOnItem.name.trim() !== "" ||
    draft.addOnItem.desc.trim() !== "" ||
    draft.addOnItem.price.trim() !== ""
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

type FieldErrors = Partial<Record<"title" | "country" | "price", string>>;

export default function TourForm({
  tour,
  returnHref = "/admin/tours",
  canChangeStatus,
  canPin,
  publicHref,
  notice,
  draftScope,
}: TourFormProps) {
  const router = useRouter();
  const isEdit = !!tour?.id;
  const initialForm = useMemo(() => buildInitialForm(tour), [tour]);
  const hotelExtras = useMemo(() => hotelExtrasFrom(tour?.hotel), [tour]);
  const templateSlug = !isEdit && tour?.slug ? tour.slug : undefined;
  const draftKey = `sundaf:tour-form-draft:${tour?.id ?? `new${draftScope ? `:${draftScope}` : ""}`}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
  const errorRef = useRef<HTMLDivElement>(null);

  // Snapshot terbaru untuk disimpan saat tab ditutup (dibaca handler pagehide).
  useEffect(() => {
    latestDraftRef.current = !suppressDraftPersistRef.current && loadedDraftKey === draftKey
      ? {
          draftKey,
          initialForm,
          draft: {
            version: 2,
            updatedAt: new Date().toISOString(),
            form,
            inclusionInput,
            exclusionInput,
            itineraryItem,
            editingItineraryIdx,
            addOnItem,
          },
        }
      : null;
  });

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

        const draft = JSON.parse(rawDraft) as Partial<TourFormDraft> & { version?: number };
        const draftForm = (draft.form ?? {}) as TourData;
        const restoredForm: TourData = { ...initialForm, ...draftForm };

        restoredForm.inclusions = Array.isArray(restoredForm.inclusions) ? restoredForm.inclusions : [];
        restoredForm.exclusions = Array.isArray(restoredForm.exclusions) ? restoredForm.exclusions : [];
        restoredForm.gallery = Array.isArray(restoredForm.gallery) ? restoredForm.gallery : [];
        restoredForm.itinerary = Array.isArray(restoredForm.itinerary) ? sortItinerary(restoredForm.itinerary) : [];
        restoredForm.addOns = Array.isArray(restoredForm.addOns) ? restoredForm.addOns : [];
        restoredForm.paymentPlan = normalizePaymentPlanConfig(restoredForm.paymentPlan);
        // Draft versi lama menyimpan hotel mentah; turunkan baris hotel & harga kamar darinya.
        if (!Array.isArray(draftForm.hotelInfo)) restoredForm.hotelInfo = hotelInfoFrom(draftForm.hotel ?? tour?.hotel);
        if (!isRecord(draftForm.roomPrices)) restoredForm.roomPrices = roomPricesFrom(draftForm.hotel ?? tour?.hotel);

        setForm(restoredForm);
        setInclusionInput(typeof draft.inclusionInput === "string" ? draft.inclusionInput : "");
        setExclusionInput(typeof draft.exclusionInput === "string" ? draft.exclusionInput : "");
        setItineraryItem(draft.itineraryItem?.title || draft.itineraryItem?.description || draft.itineraryItem?.image
          ? {
              day: Number(draft.itineraryItem.day) || getNextItineraryDay(restoredForm.itinerary),
              title: draft.itineraryItem.title ?? "",
              description: draft.itineraryItem.description ?? "",
              image: draft.itineraryItem.image ?? "",
            }
          : emptyItineraryItem(restoredForm.itinerary)
        );
        setEditingItineraryIdx(readNumberOrNull(draft.editingItineraryIdx));
        setAddOnItem({
          name: draft.addOnItem?.name ?? "",
          price: String(draft.addOnItem?.price ?? ""),
          desc: draft.addOnItem?.desc ?? "",
          tag: draft.addOnItem?.tag ?? "",
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
  }, [draftKey, initialForm, tour]);

  useEffect(() => {
    if (loadedDraftKey !== draftKey) return;

    const draft: TourFormDraft = {
      version: 2,
      updatedAt: new Date().toISOString(),
      form,
      inclusionInput,
      exclusionInput,
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

  function set<K extends keyof TourData>(key: K, value: TourData[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    if (key === "title" || key === "country" || key === "price") {
      setFieldErrors((errors) => ({ ...errors, [key]: undefined }));
    }
  }

  // ── Termasuk / tidak termasuk ──
  function commitInclusion() {
    const value = inclusionInput.trim();
    if (!value) return;
    const list = [...(form.inclusions ?? [])];
    if (editingInclusionIdx !== null) list[editingInclusionIdx] = value;
    else list.push(value);
    set("inclusions", list);
    setEditingInclusionIdx(null);
    setInclusionInput("");
  }
  function commitExclusion() {
    const value = exclusionInput.trim();
    if (!value) return;
    const list = [...(form.exclusions ?? [])];
    if (editingExclusionIdx !== null) list[editingExclusionIdx] = value;
    else list.push(value);
    set("exclusions", list);
    setEditingExclusionIdx(null);
    setExclusionInput("");
  }

  // ── Add-on ──
  function updateAddOn(i: number, partial: Partial<AddOnItem>) {
    set("addOns", (form.addOns ?? []).map((item, j) => (j === i ? { ...item, ...partial } : item)));
  }
  function commitAddOn() {
    const name = addOnItem.name.trim();
    if (!name) return;
    set("addOns", [
      ...(form.addOns ?? []),
      { name, price: Number(addOnItem.price) || 0, tag: addOnItem.tag, desc: addOnItem.desc.trim() || undefined },
    ]);
    setAddOnItem(emptyAddOnItem());
  }

  // ── Hotel & harga kamar ──
  const hotelRows = form.hotelInfo ?? [];
  const roomPrices = form.roomPrices ?? { quad: "", triple: "", twin: "" };
  function setHotelRow(i: number, partial: Partial<HotelRow>) {
    set("hotelInfo", hotelRows.map((row, j) => (j === i ? { ...row, ...partial } : row)));
  }
  function setRoomPrice(code: RoomPriceCode, value: string) {
    set("roomPrices", { ...roomPrices, [code]: value.replace(/[^\d]/g, "") });
  }

  // ── Galeri ──
  function moveGalleryImage(i: number, direction: -1 | 1) {
    const list = [...(form.gallery ?? [])];
    const target = i + direction;
    if (target < 0 || target >= list.length) return;
    [list[i], list[target]] = [list[target], list[i]];
    set("gallery", list);
  }
  function makeGalleryImageHero(i: number) {
    const list = [...(form.gallery ?? [])];
    const [image] = list.splice(i, 1);
    if (!image) return;
    if (form.heroImg) list.unshift(form.heroImg);
    setForm((p) => ({ ...p, heroImg: image, gallery: list }));
  }

  // ── Skema pembayaran ──
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
      steps: [...paymentPlan.steps, { label: "", dueDate: "", amount: "" }],
    });
  }

  function removePaymentPlanStep(i: number) {
    setPaymentPlan({ steps: paymentPlan.steps.filter((_, j) => i !== j) });
  }

  // ── Itinerary ──
  function commitItineraryItem() {
    const item: ItineraryItem = {
      day: Number(itineraryItem.day) || getNextItineraryDay(form.itinerary),
      title: itineraryItem.title.trim(),
      description: itineraryItem.description.trim(),
      image: itineraryItem.image?.trim() || undefined,
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

  const price = headlinePrice(form);
  const requiredCosts = mandatoryTotal(form);
  const effectiveStatus = !isEdit && !canChangeStatus ? "DRAFT" : form.status ?? "DRAFT";
  const checklist = adminTourIssues({
    status: effectiveStatus,
    price: price.amount,
    seatsLeft: Number(form.seatsLeft) || 0,
    tripDate: form.tripDate || null,
    heroImg: form.heroImg,
    description: form.description,
    itinerary: form.itinerary,
    hotel: buildHotelJson(hotelRows, roomPrices, hotelExtras),
  }).filter((issue) => !issue.includes("pengecualian lama"));

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!form.title?.trim()) errors.title = "Judul tour wajib diisi.";
    if (!form.country?.trim()) errors.country = "Negara wajib diisi.";
    const goingLive = effectiveStatus === "ACTIVE" || effectiveStatus === "FULL";
    if (goingLive && price.amount <= 0) errors.price = "Isi harga (atau harga per kamar) sebelum tour diaktifkan.";
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Periksa isian yang ditandai merah.");
      window.setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }

    const paymentPlanForSubmit = normalizePaymentPlanForSubmit(form.paymentPlan);
    if (!paymentPlanForSubmit.ok) {
      setError(paymentPlanForSubmit.error);
      return;
    }

    setLoading(true);
    setError("");
    // Field bantu form tidak dikirim; slug dikelola server.
    const { hotelInfo, roomPrices: formRoomPrices, ...rest } = form;
    const payload: Record<string, unknown> = {
      ...rest,
      title: form.title?.trim(),
      country: form.country?.trim(),
      price: Number(form.price) || 0,
      promoPrice: Number(form.promoPrice) > 0 ? Number(form.promoPrice) : null,
      priceLandTour: Number(form.priceLandTour) > 0 ? Number(form.priceLandTour) : null,
      seatsLeft: Math.max(0, Math.round(Number(form.seatsLeft) || 0)),
      tripDate: form.tripDate ? new Date(form.tripDate).toISOString() : null,
      hotel: buildHotelJson(hotelInfo ?? [], formRoomPrices ?? roomPrices, hotelExtras),
      paymentPlan: paymentPlanForSubmit.value,
      ...(templateSlug ? { slug: templateSlug } : {}),
    };
    if (!canChangeStatus) {
      if (isEdit) delete payload.status;
      else payload.status = "DRAFT";
    }
    if (!canPin) delete payload.pinned;

    try {
      const res = await fetch(isEdit ? `/api/tours/${tour!.id}` : "/api/tours", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        suppressDraftPersistRef.current = true;
        latestDraftRef.current = null;
        window.localStorage.removeItem(draftKey);
        router.push(returnHref);
        router.refresh();
        return;
      }
      setError(await readApiError(res));
    } catch {
      setError("Koneksi gagal. Perubahan masih tersimpan di draft lokal; coba simpan lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6" noValidate>
      <StickyFormActions
        loading={loading}
        primaryLabel={isEdit ? "Simpan Perubahan" : "Simpan Tour"}
        cancelHref={returnHref}
      />

      {notice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          {notice}
        </div>
      )}

      {error && (
        <div ref={errorRef} role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {(draftError || draftRestoredAt) && (
        <div className={`flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
          draftError
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
        }`}>
          <span>
            {draftError || `Isian yang belum tersimpan dipulihkan dari browser ini (${formatDraftTime(draftRestoredAt)}).`}
          </span>
          {!draftError && (
            <button type="button" onClick={discardLocalDraft}
              className="self-start rounded-lg border border-emerald-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-white dark:border-emerald-700 dark:bg-gray-800/70 dark:text-emerald-200 sm:self-auto">
              Buang & kembali ke data tersimpan
            </button>
          )}
        </div>
      )}

      {isEdit && publicHref && (
        <a href={publicHref} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          <ExternalLink size={15} /> Lihat halaman tour di website
        </a>
      )}

      {/* 1. Info utama */}
      <Section number={1} title="Info utama" description="Nama paket dan tujuan. Judul tampil di kartu katalog dan judul halaman tour.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Judul tour" required htmlFor="tour-title" error={fieldErrors.title}>
            <input id="tour-title" className="input" value={form.title ?? ""} onChange={(e) => set("title", e.target.value)}
              placeholder="cth: Open Trip Aurora Murmansk Desember 2026" />
          </Field>
          <Field label="Negara" required htmlFor="tour-country" error={fieldErrors.country}
            hint="Dipakai untuk filter destinasi di website.">
            <input id="tour-country" className="input" value={form.country ?? ""} onChange={(e) => set("country", e.target.value)}
              placeholder="cth: Rusia" />
          </Field>
          <Field label="Kota / rute" htmlFor="tour-city" hint="Kota utama yang dikunjungi.">
            <input id="tour-city" className="input" value={form.cityHighlight ?? ""} onChange={(e) => set("cityHighlight", e.target.value)}
              placeholder="cth: Moskow · Murmansk · Teriberka" />
          </Field>
          <Field label="Durasi" htmlFor="tour-duration">
            <input id="tour-duration" className="input" value={form.duration ?? ""} onChange={(e) => set("duration", e.target.value)}
              placeholder="cth: 9 Hari 7 Malam" />
          </Field>
          <Field label="Badge (opsional)" htmlFor="tour-badge" className="md:col-span-2"
            hint="Label kecil di kartu, mis. Best Seller. Kata khusus: 'penuh' atau 'sold out' = tampil penuh, 'waitlist' = daftar tunggu, 'pasti berangkat' = label pasti berangkat.">
            <input id="tour-badge" className="input" value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)}
              placeholder="cth: Best Seller" />
          </Field>
        </div>
      </Section>

      {/* 2. Jadwal & status */}
      <Section number={2} title="Jadwal & status" description="Atur tanggal, kursi, dan apakah tour tampil di website.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Tanggal berangkat" htmlFor="tour-date" hint="Kosongkan untuk private trip / tanggal fleksibel.">
            <input id="tour-date" type="date" className="input" value={form.tripDate ?? ""} onChange={(e) => set("tripDate", e.target.value)} />
          </Field>
          <Field label="Sisa kursi" htmlFor="tour-seats" hint="Kursi yang masih bisa dijual. 1–3 kursi tampil sebagai kursi terakhir.">
            <input id="tour-seats" type="number" min={0} inputMode="numeric" className="input" value={form.seatsLeft ?? 0}
              onChange={(e) => set("seatsLeft", e.target.value)} />
          </Field>
        </div>

        <fieldset className="mt-5" disabled={!canChangeStatus}>
          <legend className="label mb-2">Status</legend>
          {!canChangeStatus && (
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              {isEdit
                ? "Akun Anda tidak bisa mengubah status. Minta admin untuk mengaktifkan atau menonaktifkan tour."
                : "Tour baru tersimpan sebagai Draft. Minta admin untuk mengaktifkannya."}
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {STATUS_ORDER.map((status) => {
              const active = effectiveStatus === status;
              return (
                <label key={status}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition ${
                    active
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  } ${!canChangeStatus ? "cursor-not-allowed opacity-70" : ""}`}>
                  <input type="radio" name="tour-status" value={status} checked={active}
                    onChange={() => set("status", status)} className="mt-0.5" />
                  <span>
                    <span className="block font-semibold text-gray-900 dark:text-white">{TOUR_STATUS_LABELS[status]}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{TOUR_STATUS_HELP[status]}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className={`mt-4 rounded-lg p-3 text-sm ${
          checklist.length === 0
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
            : "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
        }`}>
          {checklist.length === 0
            ? "Data utama lengkap. Tour siap tampil."
            : <>Sebelum tampil, lengkapi: {checklist.join(" · ")}.</>}
        </div>

        {canPin && (
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <input type="checkbox" checked={!!form.pinned} onChange={(e) => set("pinned", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span>
              <span className="block font-medium text-gray-900 dark:text-white">Pin sebagai tour pilihan</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">Tampil paling depan di katalog dan beranda. Maksimal 5 tour.</span>
            </span>
          </label>
        )}
      </Section>

      {/* 3. Harga */}
      <Section number={3} title="Harga" description="Semua harga per orang, dalam Rupiah tanpa titik.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Harga normal" required htmlFor="tour-price" error={fieldErrors.price}>
            <input id="tour-price" type="number" min={0} inputMode="numeric" className="input" value={form.price ?? ""}
              onChange={(e) => set("price", e.target.value)} placeholder="cth: 32500000" />
          </Field>
          <Field label="Harga promo" htmlFor="tour-promo" hint="Isi bila ada potongan. Harga normal tampil dicoret.">
            <input id="tour-promo" type="number" min={0} inputMode="numeric" className="input" value={form.promoPrice ?? ""}
              onChange={(e) => set("promoPrice", e.target.value)} />
          </Field>
          <Field label="Harga land tour" htmlFor="tour-land" hint="Tanpa tiket pesawat. Opsional.">
            <input id="tour-land" type="number" min={0} inputMode="numeric" className="input" value={form.priceLandTour ?? ""}
              onChange={(e) => set("priceLandTour", e.target.value)} />
          </Field>
        </div>

        <div className="mt-5">
          <p className="label">Harga per kamar (opsional)</p>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Bila diisi, harga per kamar menggantikan harga normal di website. Harga pertama yang terisi (biasanya 4 orang/kamar) menjadi &ldquo;harga mulai&rdquo;.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROOM_PRICE_FIELDS.map((field) => (
              <Field key={field.code} label={field.label} htmlFor={`room-${field.code}`}>
                <input id={`room-${field.code}`} type="number" min={0} inputMode="numeric" className="input"
                  value={roomPrices[field.code]} onChange={(e) => setRoomPrice(field.code, e.target.value)} />
              </Field>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-700/40 dark:text-gray-200">
          {price.amount > 0 ? (
            <>
              Harga mulai di website: <strong>{rupiah(price.amount)}</strong> <span className="text-gray-500 dark:text-gray-400">(dari {price.source})</span>
              {requiredCosts > 0 && (
                <> · Subtotal dengan biaya wajib: <strong>{rupiah(price.amount + requiredCosts)}</strong></>
              )}
            </>
          ) : (
            "Harga belum diisi. Tour tanpa harga tampil sebagai 'hubungi kami'."
          )}
        </div>
      </Section>

      {/* 4. Foto */}
      <Section number={4} title="Foto" description="Foto utama tampil di kartu katalog dan bagian atas halaman tour. Pakai foto landscape yang tajam.">
        <p className="label mb-2">Foto utama</p>
        <ImageUpload value={form.heroImg ?? ""} onChange={(url) => set("heroImg", url)} folder="tours/hero"
          uploadLabel="Upload foto utama" publicImage />

        <p className="label mb-2 mt-6">Galeri</p>
        <ImageUpload
          value=""
          onChange={(url) => setForm((p) => ({ ...p, gallery: [...(p.gallery ?? []), url] }))}
          folder="tours/gallery"
          multiple
          uploadLabel="Tambah foto galeri"
          publicImage
        />
        {(form.gallery ?? []).length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(form.gallery ?? []).map((url, i) => (
              <li key={`${url}-${i}`} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto galeri ${i + 1}`} className="h-24 w-full object-cover" />
                <div className="flex items-center justify-between gap-1 p-1">
                  <button type="button" onClick={() => moveGalleryImage(i, -1)} disabled={i === 0}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Geser ke kiri">
                    <ArrowLeft size={14} />
                  </button>
                  <button type="button" onClick={() => makeGalleryImageHero(i)}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    title="Jadikan foto utama">
                    <Star size={12} /> Utama
                  </button>
                  <button type="button" onClick={() => moveGalleryImage(i, 1)} disabled={i === (form.gallery ?? []).length - 1}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700" aria-label="Geser ke kanan">
                    <ArrowRight size={14} />
                  </button>
                  <button type="button" onClick={() => set("gallery", (form.gallery ?? []).filter((_, j) => j !== i))}
                    className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Hapus foto">
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 5. Itinerary */}
      <Section number={5} title="Itinerary" description="Tambahkan per hari. Baris baru di kolom kegiatan menjadi paragraf terpisah di website.">
        <div className="space-y-2">
          {(form.itinerary ?? []).map((item, i) => (
            editingItineraryIdx === i ? (
              <div key={i} className="rounded-lg border border-blue-400 bg-blue-50 p-3 dark:bg-blue-900/20">
                <ItineraryItemFields
                  item={itineraryItem}
                  onChange={setItineraryItem}
                  onSubmit={commitItineraryItem}
                  onCancel={() => {
                    setEditingItineraryIdx(null);
                    setItineraryItem(emptyItineraryItem(form.itinerary));
                  }}
                  submitLabel="Simpan hari"
                  submitTone="save"
                />
              </div>
            ) : (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <span className="shrink-0 rounded bg-blue-100 px-2 py-1 text-center text-xs font-bold text-blue-600 dark:bg-blue-900/30">
                  Hari {item.day}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                  {item.description && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>}
                  {item.image && <p className="mt-1 text-[11px] font-medium text-blue-600 dark:text-blue-300">Foto hari ini terpasang</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" title="Edit" aria-label={`Edit hari ${item.day}`}
                    onClick={() => {
                      setItineraryItem({ day: item.day, title: item.title, description: item.description, image: item.image ?? "" });
                      setEditingItineraryIdx(i);
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                    <Pencil size={15} />
                  </button>
                  <button type="button" title="Hapus" aria-label={`Hapus hari ${item.day}`}
                    onClick={() => {
                      const updated = (form.itinerary ?? []).filter((_, j) => j !== i);
                      if (editingItineraryIdx !== null && editingItineraryIdx > i) setEditingItineraryIdx(editingItineraryIdx - 1);
                      set("itinerary", updated);
                      if (editingItineraryIdx === null) setItineraryItem(emptyItineraryItem(updated));
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          ))}
          {(form.itinerary ?? []).length === 0 && (
            <p className="py-2 text-xs text-gray-400">Belum ada itinerary. Mulai dari hari pertama di bawah.</p>
          )}
        </div>
        {editingItineraryIdx === null && (
          <div className="mt-3 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
            <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Tambah hari berikutnya</p>
            <ItineraryItemFields
              item={itineraryItem}
              onChange={setItineraryItem}
              onSubmit={commitItineraryItem}
              submitLabel="Tambah hari"
              submitTone="add"
            />
          </div>
        )}
      </Section>

      {/* 6. Termasuk & tidak termasuk */}
      <Section number={6} title="Termasuk & tidak termasuk" description="Tekan Enter untuk menambah baris.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ListEditor
            label="Termasuk"
            tone="include"
            items={form.inclusions ?? []}
            input={inclusionInput}
            onInput={setInclusionInput}
            editingIdx={editingInclusionIdx}
            onCommit={commitInclusion}
            onEdit={(i) => { setInclusionInput((form.inclusions ?? [])[i] ?? ""); setEditingInclusionIdx(i); }}
            onCancelEdit={() => { setEditingInclusionIdx(null); setInclusionInput(""); }}
            onRemove={(i) => {
              if (editingInclusionIdx === i) { setEditingInclusionIdx(null); setInclusionInput(""); }
              set("inclusions", (form.inclusions ?? []).filter((_, j) => j !== i));
            }}
          />
          <ListEditor
            label="Tidak termasuk"
            tone="exclude"
            items={form.exclusions ?? []}
            input={exclusionInput}
            onInput={setExclusionInput}
            editingIdx={editingExclusionIdx}
            onCommit={commitExclusion}
            onEdit={(i) => { setExclusionInput((form.exclusions ?? [])[i] ?? ""); setEditingExclusionIdx(i); }}
            onCancelEdit={() => { setEditingExclusionIdx(null); setExclusionInput(""); }}
            onRemove={(i) => {
              if (editingExclusionIdx === i) { setEditingExclusionIdx(null); setExclusionInput(""); }
              set("exclusions", (form.exclusions ?? []).filter((_, j) => j !== i));
            }}
          />
        </div>
      </Section>

      {/* 7. Hotel */}
      <Section number={7} title="Hotel" description="Tampil di halaman tour. Satu baris per kota atau area.">
        <div className="space-y-2">
          {hotelRows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[12rem_1fr_auto]">
              <input className="input" aria-label={`Kota hotel ${i + 1}`} placeholder="Kota" value={row.label}
                onChange={(e) => setHotelRow(i, { label: e.target.value })} />
              <input className="input col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto" aria-label={`Nama hotel ${i + 1}`}
                placeholder="Nama hotel / kelas" value={row.value} onChange={(e) => setHotelRow(i, { value: e.target.value })} />
              <button type="button" onClick={() => set("hotelInfo", hotelRows.filter((_, j) => j !== i))}
                className="row-start-1 rounded-lg px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 sm:row-start-auto" aria-label="Hapus baris hotel">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("hotelInfo", [...hotelRows, { label: "", value: "" }])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
          <Plus size={15} /> Tambah hotel
        </button>
      </Section>

      {/* 8. Biaya tambahan */}
      <Section number={8} title="Biaya tambahan & add-on"
        description="Wajib = ikut dihitung ke subtotal (mis. bagasi, tipping). Disarankan = diberi tanda rekomendasi. Opsional = pilihan bebas.">
        <div className="space-y-2">
          {(form.addOns ?? []).map((item, i) => (
            <div key={i} className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_9rem_12rem_auto]">
                <input className="input" aria-label={`Nama add-on ${i + 1}`} value={item.name}
                  onChange={(e) => updateAddOn(i, { name: e.target.value })} />
                <input type="number" min={0} inputMode="numeric" className="input" aria-label={`Harga add-on ${i + 1}`}
                  value={item.price} onChange={(e) => updateAddOn(i, { price: Number(e.target.value) || 0 })} />
                <select className="input" aria-label={`Jenis add-on ${i + 1}`} value={item.tag ?? ""}
                  onChange={(e) => updateAddOn(i, { tag: e.target.value as AddOnTag })}>
                  {(Object.keys(ADD_ON_TAG_LABELS) as AddOnTag[]).map((tag) => (
                    <option key={tag} value={tag}>{ADD_ON_TAG_LABELS[tag]}</option>
                  ))}
                </select>
                <button type="button" onClick={() => set("addOns", (form.addOns ?? []).filter((_, j) => j !== i))}
                  className="rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label={`Hapus ${item.name}`}>
                  <X size={16} />
                </button>
              </div>
              <textarea value={item.desc ?? ""} onChange={(e) => updateAddOn(i, { desc: e.target.value })}
                placeholder="Keterangan (opsional): apa yang didapat peserta?" aria-label={`Keterangan ${item.name}`}
                className="input min-h-[2.25rem] w-full resize-y text-xs" />
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_9rem_12rem_auto]">
            <input placeholder="Nama, cth: Bagasi 23 kg" aria-label="Nama add-on baru" className="input" value={addOnItem.name}
              onChange={(e) => setAddOnItem((p) => ({ ...p, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitAddOn(); } }} />
            <input type="number" min={0} inputMode="numeric" placeholder="Harga" aria-label="Harga add-on baru" className="input"
              value={addOnItem.price} onChange={(e) => setAddOnItem((p) => ({ ...p, price: e.target.value }))} />
            <select className="input" aria-label="Jenis add-on baru" value={addOnItem.tag}
              onChange={(e) => setAddOnItem((p) => ({ ...p, tag: e.target.value as AddOnTag }))}>
              {(Object.keys(ADD_ON_TAG_LABELS) as AddOnTag[]).map((tag) => (
                <option key={tag} value={tag}>{ADD_ON_TAG_LABELS[tag]}</option>
              ))}
            </select>
            <button type="button" onClick={commitAddOn}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus size={15} /> Tambah
            </button>
          </div>
          <input placeholder="Keterangan (opsional)" aria-label="Keterangan add-on baru" className="input text-sm"
            value={addOnItem.desc} onChange={(e) => setAddOnItem((p) => ({ ...p, desc: e.target.value }))} />
        </div>
      </Section>

      {/* 9. Deskripsi & catatan */}
      <Section number={9} title="Deskripsi & catatan" description="Tampil di halaman tour. Setiap baris baru menjadi paragraf terpisah.">
        <Field label="Cerita trip" htmlFor="tour-description"
          hint="Tulis konkret: rute utama, tempo perjalanan, musim, cocok untuk siapa. Hindari klaim umum tanpa detail.">
          <textarea id="tour-description" className="input min-h-[180px]" value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="cth: Rute ini fokus ke Murmansk dan Teriberka dengan ritme santai untuk berburu aurora tiga malam..." />
        </Field>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Catatan penting" htmlFor="tour-notes">
            <textarea id="tour-notes" className="input min-h-[110px]" value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
              placeholder="cth: Paspor minimal berlaku 6 bulan saat berangkat." />
          </Field>
          <Field label="Informasi visa" htmlFor="tour-visa">
            <textarea id="tour-visa" className="input min-h-[110px]" value={form.visaInfo ?? ""} onChange={(e) => set("visaInfo", e.target.value)}
              placeholder="cth: E-visa Rusia diurus tim Sundaf, proses sekitar 4 hari kerja." />
          </Field>
        </div>
      </Section>

      {/* 10. Lanjutan */}
      <details className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
          Pengaturan lanjutan: skema pembayaran
          <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
            {paymentPlan.mode === "auto" ? "Otomatis" : paymentPlan.mode === "hidden" ? "Disembunyikan" : "Manual"}
          </span>
        </summary>
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Otomatis menghitung DP dan cicilan dari harga, biaya wajib, dan tanggal berangkat. Total acuan: {rupiah(paymentPlanTotal(form))}.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Mode" htmlFor="payment-mode">
              <select id="payment-mode" className="input" value={paymentPlan.mode}
                onChange={(e) => setPaymentPlan({ mode: e.target.value as PaymentPlanMode })}>
                <option value="auto">Otomatis</option>
                <option value="manual">Manual</option>
                <option value="hidden">Sembunyikan</option>
              </select>
            </Field>
          </div>

          {paymentPlan.mode === "auto" && (
            <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              DP default Rp 1.500.000, cicilan kedua H+7 dari booking, cicilan terakhir mengikuti jarak keberangkatan.
              Tanpa tanggal berangkat, skema tidak tampil.
            </p>
          )}

          {paymentPlan.mode === "hidden" && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              Skema pembayaran tidak tampil di halaman tour dan PDF.
            </p>
          )}

          {paymentPlan.mode === "manual" && (
            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Judul bagian" htmlFor="payment-title">
                  <input id="payment-title" className="input" placeholder="Booking Seat DP 1 Juta-an" value={paymentPlan.title ?? ""}
                    onChange={(e) => setPaymentPlan({ title: e.target.value })} />
                </Field>
                <Field label="Teks urgensi" htmlFor="payment-urgency">
                  <input id="payment-urgency" className="input" placeholder="Sisa 5 kursi lagi" value={paymentPlan.urgencyLabel ?? ""}
                    onChange={(e) => setPaymentPlan({ urgencyLabel: e.target.value })} />
                </Field>
                <Field label="Kalimat pembuka" htmlFor="payment-intro">
                  <textarea id="payment-intro" className="input min-h-[80px]" placeholder="Pembayaran aman dan fleksibel..."
                    value={paymentPlan.intro ?? ""} onChange={(e) => setPaymentPlan({ intro: e.target.value })} />
                </Field>
                <Field label="Metode pembayaran" htmlFor="payment-methods">
                  <textarea id="payment-methods" className="input min-h-[80px]" placeholder="Transfer bank, QRIS, e-wallet..."
                    value={paymentPlan.paymentMethodsLabel ?? ""} onChange={(e) => setPaymentPlan({ paymentMethodsLabel: e.target.value })} />
                </Field>
              </div>

              <div>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="label">Tahapan pembayaran</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setPaymentPlan({ mode: "manual", steps: paymentPlanTemplate(form) })}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      Pakai template 3 tahap
                    </button>
                    <button type="button" onClick={addPaymentPlanStep}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                      Tambah tahap
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {paymentPlan.steps.map((step, i) => (
                    <div key={i} className="grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700 md:grid-cols-[1fr_10rem_11rem_auto]">
                      <input className="input" placeholder="DP1" aria-label={`Nama tahap ${i + 1}`} value={step.label}
                        onChange={(e) => setPaymentPlanStep(i, { label: e.target.value })} />
                      <input type="date" className="input" aria-label={`Tanggal tahap ${i + 1}`} value={step.dueDate}
                        onChange={(e) => setPaymentPlanStep(i, { dueDate: e.target.value })} />
                      <input type="number" min={0} className="input" placeholder="Nominal" aria-label={`Nominal tahap ${i + 1}`}
                        value={step.amount} onChange={(e) => setPaymentPlanStep(i, { amount: e.target.value })} />
                      <button type="button" onClick={() => removePaymentPlanStep(i)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        Hapus
                      </button>
                    </div>
                  ))}
                  {paymentPlan.steps.length === 0 && (
                    <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      Belum ada tahap. Klik &quot;Pakai template 3 tahap&quot; atau &quot;Tambah tahap&quot;.
                    </p>
                  )}
                </div>
              </div>

              <Field label="Catatan kecil" htmlFor="payment-fineprint">
                <input id="payment-fineprint" className="input" placeholder="Jadwal pembayaran dapat disesuaikan tim Sundaf."
                  value={paymentPlan.finePrint ?? ""} onChange={(e) => setPaymentPlan({ finePrint: e.target.value })} />
              </Field>
            </div>
          )}
        </div>
      </details>

      {draftSavedAt && !draftError && (
        <p className="text-xs text-gray-400">Isian tersimpan otomatis di browser ini {formatDraftTime(draftSavedAt)} sampai Anda menekan Simpan.</p>
      )}
    </form>
  );
}

function Section({ number, title, description, children }: { number: number; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{number}</span>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label mb-1" htmlFor={htmlFor}>
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error
        ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        : hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

function ListEditor({
  label,
  tone,
  items,
  input,
  onInput,
  editingIdx,
  onCommit,
  onEdit,
  onCancelEdit,
  onRemove,
}: {
  label: string;
  tone: "include" | "exclude";
  items: string[];
  input: string;
  onInput: (value: string) => void;
  editingIdx: number | null;
  onCommit: () => void;
  onEdit: (i: number) => void;
  onCancelEdit: () => void;
  onRemove: (i: number) => void;
}) {
  const color = tone === "include"
    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300";
  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div className="mb-2 flex gap-2">
        <input className="input flex-1" value={input} aria-label={`Tambah baris ${label.toLowerCase()}`}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCommit(); } }}
          placeholder={editingIdx !== null ? "Edit lalu tekan Enter" : "Ketik lalu tekan Enter"} />
        <button type="button" onClick={onCommit}
          className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
          {editingIdx !== null ? "Simpan" : "Tambah"}
        </button>
        {editingIdx !== null && (
          <button type="button" onClick={onCancelEdit} className="rounded-lg bg-gray-400 px-3 py-2 text-sm text-white">Batal</button>
        )}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className={`flex items-center justify-between rounded px-3 py-1.5 text-sm ${color} ${editingIdx === i ? "ring-2 ring-blue-400" : ""}`}>
            <span className="min-w-0 break-words">{item}</span>
            <span className="ml-2 flex shrink-0 items-center gap-1">
              <button type="button" title="Edit" aria-label={`Edit ${item}`} onClick={() => onEdit(i)} className="text-blue-500 hover:text-blue-700">
                <Pencil size={13} />
              </button>
              <button type="button" title="Hapus" aria-label={`Hapus ${item}`} onClick={() => onRemove(i)} className="text-red-500">
                <X size={14} />
              </button>
            </span>
          </li>
        ))}
      </ul>
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
    <div className="space-y-3">
      <div className="grid grid-cols-[5rem_1fr] gap-3">
        <div>
          <label className="label mb-1 text-xs" htmlFor={`itinerary-day-${submitTone}`}>Hari ke</label>
          <input id={`itinerary-day-${submitTone}`} type="number" min={1} className="input text-center" value={item.day}
            onChange={(e) => onChange({ ...item, day: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label mb-1 text-xs" htmlFor={`itinerary-title-${submitTone}`}>Judul hari</label>
          <input id={`itinerary-title-${submitTone}`} placeholder="cth: Tiba di Murmansk, berburu aurora" className="input" value={item.title}
            onChange={(e) => onChange({ ...item, title: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label mb-1 text-xs" htmlFor={`itinerary-desc-${submitTone}`}>Kegiatan</label>
        <textarea id={`itinerary-desc-${submitTone}`} className="input min-h-[90px]" value={item.description}
          placeholder="Ceritakan kegiatan hari ini. Ctrl/Cmd + Enter untuk menyimpan."
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit();
            }
          }} />
      </div>
      <div>
        <p className="label mb-2 text-xs">Foto hari ini (opsional)</p>
        <ImageUpload value={item.image ?? ""} onChange={(url) => onChange({ ...item, image: url })}
          folder="tours/itinerary" uploadLabel="Upload foto hari ini" publicImage />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onSubmit} disabled={!item.title.trim()}
          className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition disabled:opacity-50 ${
            submitTone === "add" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
          }`}>
          <SubmitIcon size={15} />
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            <X size={15} /> Batal
          </button>
        )}
      </div>
    </div>
  );
}
