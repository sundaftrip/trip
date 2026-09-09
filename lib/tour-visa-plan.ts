/** Visa planning metadata shares the itinerary JSON column without changing legacy arrays. */
export type TourVisaDestination = {
  countryId: string;
  stayDays: number;
  kind: "visit" | "transit";
  service: "offer" | "included" | "separate" | "none";
  variantId?: string;
};

export type TourVisaReview = { at: string; fingerprint: string };

export type TourVisaPlan = {
  version: 1;
  passportCountry: "ID";
  passportType: "ordinary";
  purpose: "tourism";
  destinations: TourVisaDestination[];
  review?: TourVisaReview;
};

export type TourItineraryDay = {
  day: number;
  title: string;
  description: string;
  image?: string;
};

export type TourItineraryEnvelope = { version: 2; days: TourItineraryDay[]; visaPlan: TourVisaPlan };
export type TourVisaPlanNormalization = { ok: true; value: TourVisaPlan | null } | { ok: false; error: string };

function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeTourVisaPlan(value: unknown): TourVisaPlanNormalization {
  if (value === null || value === undefined) return { ok: true, value: null };
  if (!object(value) || value.version !== 1) return { ok: false, error: "Format rencana visa tidak dikenali." };
  if (value.passportCountry !== "ID" || value.passportType !== "ordinary" || value.purpose !== "tourism") {
    return { ok: false, error: "Rencana ini hanya mendukung paspor biasa Indonesia untuk wisata." };
  }
  if (!Array.isArray(value.destinations) || value.destinations.length === 0 || value.destinations.length > 100) {
    return { ok: false, error: "Isi 1 sampai 100 negara tujuan atau transit dalam urutan perjalanan." };
  }
  const destinations: TourVisaDestination[] = [];
  for (const [index, item] of value.destinations.entries()) {
    if (!object(item) || typeof item.countryId !== "string" || !item.countryId.trim() || item.countryId.length > 200) {
      return { ok: false, error: `Pilih negara pada rute ke-${index + 1}.` };
    }
    if (item.kind !== "visit" && item.kind !== "transit") return { ok: false, error: `Jenis rute ke-${index + 1} harus kunjungan atau transit.` };
    if (typeof item.stayDays !== "number" || !Number.isInteger(item.stayDays) || item.stayDays < (item.kind === "transit" ? 0 : 1) || item.stayDays > 365) {
      return { ok: false, error: `Lama tinggal pada rute ke-${index + 1} harus berupa jumlah hari yang valid.` };
    }
    if (!["offer", "included", "separate", "none"].includes(String(item.service))) {
      return { ok: false, error: `Tentukan penanganan visa pada rute ke-${index + 1}.` };
    }
    if (item.variantId !== undefined && (typeof item.variantId !== "string" || !item.variantId.trim() || item.variantId.length > 200)) {
      return { ok: false, error: `Pilihan layanan visa pada rute ke-${index + 1} tidak valid.` };
    }
    destinations.push({
      countryId: item.countryId.trim(), stayDays: item.stayDays, kind: item.kind,
      service: item.service as TourVisaDestination["service"],
      ...(typeof item.variantId === "string" ? { variantId: item.variantId.trim() } : {}),
    });
  }
  let review: TourVisaReview | undefined;
  if (value.review !== undefined) {
    if (!object(value.review) || typeof value.review.at !== "string" || !Number.isFinite(Date.parse(value.review.at)) || typeof value.review.fingerprint !== "string" || !value.review.fingerprint.trim() || value.review.fingerprint.length > 300) {
      return { ok: false, error: "Catatan pemeriksaan visa tidak valid." };
    }
    review = { at: new Date(value.review.at).toISOString(), fingerprint: value.review.fingerprint.trim() };
  }
  return { ok: true, value: { version: 1, passportCountry: "ID", passportType: "ordinary", purpose: "tourism", destinations, ...(review ? { review } : {}) } };
}

export function readTourItinerary(value: unknown): TourItineraryDay[] {
  const days = Array.isArray(value) ? value : object(value) && value.version === 2 && Array.isArray(value.days) ? value.days : [];
  return days.filter((day): day is TourItineraryDay => object(day) && typeof day.day === "number" && Number.isFinite(day.day) && typeof day.title === "string" && typeof day.description === "string").map((day) => {
    const copy = { ...day };
    if (typeof copy.image !== "string") delete copy.image;
    return copy;
  });
}

export function readTourVisaPlan(value: unknown): TourVisaPlan | null {
  if (!object(value) || value.version !== 2) return null;
  const normalized = normalizeTourVisaPlan(value.visaPlan);
  return normalized.ok ? normalized.value : null;
}

export function packTourItinerary(days: readonly TourItineraryDay[], plan?: TourVisaPlan | null): TourItineraryDay[] | TourItineraryEnvelope {
  const result = normalizeTourVisaPlan(plan);
  if (!result.ok) throw new Error(result.error);
  const copy = days.map((day) => ({ ...day }));
  return result.value ? { version: 2, days: copy, visaPlan: result.value } : copy;
}
