import { assessTourVisas } from "./tour-visa-assessment";
import { normalizeTourVisaPlan, packTourItinerary, readTourItinerary, readTourVisaPlan } from "./tour-visa-plan";

type CountryRecord = Parameters<typeof assessTourVisas>[1][number];
type MutableTour = Record<string, unknown>;
type WriteResult = { ok: true; itinerary: ReturnType<typeof packTourItinerary> } | { ok: false; error: string };
const PUBLIC = new Set(["ACTIVE", "FULL"]);
const VISA_FIELDS = ["country", "duration", "tripDate", "inclusions", "addOns"];

function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function comparable(value: unknown) {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  return JSON.stringify(value ?? null);
}

function visaFieldValue(field: string, value: unknown) {
  if (field === "country" || field === "duration") return typeof value === "string" ? value.trim() : "";
  if (field === "tripDate") {
    const date = value instanceof Date ? value : typeof value === "string" && value ? new Date(value) : null;
    return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  if (field === "inclusions") return Array.isArray(value) ? value : [];
  if (field === "addOns") return Array.isArray(value) ? value.map((item) => object(item) ? {
    name: item.name, price: item.price, tag: item.tag ?? "", desc: item.desc ?? "",
  } : item) : [];
  return value;
}

/** Keep the existing API itinerary-array contract while exposing plan separately. */
export function tourVisaReadDto<T extends { itinerary?: unknown }>(tour: T, includeReview = false) {
  const savedPlan = readTourVisaPlan(tour.itinerary);
  const visaPlan = savedPlan && !includeReview ? { ...savedPlan, review: undefined } : savedPlan;
  return { ...tour, itinerary: readTourItinerary(tour.itinerary), visaPlan };
}

function itineraryIsValid(value: unknown) {
  if (value == null) return true;
  const days = Array.isArray(value) ? value : object(value) && value.version === 2 ? value.days : null;
  return Array.isArray(days) && days.every((day) => object(day)
    && typeof day.day === "number" && Number.isInteger(day.day) && day.day > 0
    && typeof day.title === "string" && typeof day.description === "string");
}

/** Review belongs to the authenticated save, never to client-supplied JSON. */
export function prepareTourVisaWrite(
  body: MutableTour,
  existing: MutableTour | null,
  records: readonly CountryRecord[],
  now = new Date(),
): WriteResult {
  if ("itinerary" in body && !itineraryIsValid(body.itinerary)) {
    return { ok: false, error: "Format itinerary tidak valid. Hari perjalanan tidak disimpan." };
  }
  const beforePlan = readTourVisaPlan(existing?.itinerary);
  const envelope = object(body.itinerary) && body.itinerary.version === 2 ? body.itinerary : null;
  const rawPlan = "visaPlan" in body ? body.visaPlan : envelope && "visaPlan" in envelope ? envelope.visaPlan : beforePlan;
  const parsed = normalizeTourVisaPlan(rawPlan);
  if (!parsed.ok) return parsed;
  const plan = parsed.value ? { ...parsed.value, review: undefined } : null;
  const beforeWithoutReview = beforePlan ? { ...beforePlan, review: undefined } : null;
  const next = { ...existing, ...body };
  const status = typeof next.status === "string" ? next.status : "DRAFT";
  const isPublic = PUBLIC.has(status);
  const wasPublic = PUBLIC.has(String(existing?.status));
  const changed = VISA_FIELDS.some((field) => field in body && comparable(visaFieldValue(field, body[field])) !== comparable(visaFieldValue(field, existing?.[field])))
    || comparable(plan) !== comparable(beforeWithoutReview);
  const needsReview = isPublic && (!existing || !wasPublic || changed || body.visaReviewConfirmed === true);
  const days = readTourItinerary("itinerary" in body ? body.itinerary : existing?.itinerary);

  // Existing catalogs remain online while their route data is reviewed. Only
  // unrelated edits may retain the legacy shape; new publication cannot.
  if (needsReview && !plan) {
    return { ok: false, error: "Pilih semua negara tujuan dan periksa informasi visa sebelum menerbitkan katalog. Anda tetap bisa menyimpan sebagai draft." };
  }
  if (!plan) return { ok: true, itinerary: packTourItinerary(days, null) };

  const assessment = assessTourVisas({
    plan,
    country: typeof next.country === "string" ? next.country : null,
    inclusions: Array.isArray(next.inclusions) ? next.inclusions.filter((item): item is string => typeof item === "string") : [],
    addOns: Array.isArray(next.addOns) ? next.addOns.filter((item): item is { name: string; tag?: string } => object(item) && typeof item.name === "string") : [],
  }, records, now);
  const existingReview = beforePlan?.review;
  const reviewStillMatches = !changed && existingReview?.fingerprint === assessment.fingerprint;
  const confirmationMatches = body.visaReviewConfirmed === true && body.visaReviewFingerprint === assessment.fingerprint;
  if (body.visaReviewConfirmed === true && !confirmationMatches) {
    return { ok: false, error: "Ringkasan visa berubah sejak ditinjau. Muat ulang data visa dan periksa kembali sebelum menyimpan." };
  }
  if (needsReview && assessment.issues.length > 0) {
    return { ok: false, error: `Informasi visa belum siap: ${assessment.issues.join(" ")} Simpan sebagai draft untuk melengkapinya.` };
  }
  if (needsReview && !confirmationMatches && !reviewStillMatches) {
    return { ok: false, error: "Periksa ringkasan visa dan konfirmasi pemeriksaan sebelum menerbitkan katalog." };
  }
  const review = confirmationMatches && assessment.issues.length === 0
    ? { at: now.toISOString(), fingerprint: assessment.fingerprint }
    : reviewStillMatches ? existingReview : undefined;
  return { ok: true, itinerary: packTourItinerary(days, { ...plan, ...(review ? { review } : {}) }) };
}
