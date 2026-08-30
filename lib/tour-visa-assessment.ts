import { parseVisaServicePrice, type TourVisaOffer, type VisaServiceCatalogEntry, type VisaServiceVariant } from "./tour-visa-offers";
import { normalizeTourVisaPlan, type TourVisaDestination, type TourVisaPlan } from "./tour-visa-plan";
import { visaSlug } from "./visa-slug";

/** Internal content-review cadence, not an immigration validity period. */
export const VISA_REVIEW_MAX_AGE_DAYS = 90;

export type VisaAssessmentRecord = Omit<VisaServiceCatalogEntry, "variants"> & {
  id: string;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | Date | null;
  stay?: string | null;
  conditions?: readonly string[] | null;
  eligibility?: readonly string[] | null;
  variants?: readonly (VisaServiceVariant & { id?: string | null })[] | null;
};
export type TourVisaCountryRecord = VisaAssessmentRecord;

export type TourVisaAssessmentInput = {
  plan?: TourVisaPlan | null;
  country?: string | null;
  inclusions?: readonly string[] | null;
  addOns?: readonly { name: string; isMandatory?: boolean; mandatory?: boolean; tag?: string | null }[] | null;
};

export type TourVisaCountryStatus = "visa_free" | "visa_on_arrival" | "required" | "evisa" | "conditional" | "unknown";
export type TourVisaServiceState = "offered" | "included" | "separate" | "consultation" | "not_needed";
export type TourVisaCountryAssessment = {
  id: string;
  name: string;
  status: TourVisaCountryStatus;
  explanation: string;
  conditions: string[];
  sourceUrl: string | null;
  checkedAt: string | null;
  serviceState: TourVisaServiceState;
  href: string | null;
  stayDays: number | null;
  kind: "visit" | "transit";
};
export type AssessedTourVisaOffer = TourVisaOffer & { countryIds: string[]; variantId: string | null };
export type TourVisaAssessment = {
  countries: TourVisaCountryAssessment[];
  offers: AssessedTourVisaOffer[];
  /** Blocking catalog-data problems; traveler-specific checks belong in warnings. */
  issues: string[];
  warnings: string[];
  fingerprint: string;
  legacy: boolean;
  summary: string[];
};

type Stop = { destination: TourVisaDestination; record?: VisaAssessmentRecord; name: string; stayDays: number | null; index: number };
type Candidate = { stop: Stop; result: TourVisaCountryAssessment; isSchengen: boolean };
const DAY_MS = 86_400_000;
const STATUS: Record<string, TourVisaCountryStatus> = { bebas: "visa_free", voa: "visa_on_arrival", wajib: "required", evisa: "evisa", conditional: "conditional" };

function normalized(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function unique(values: readonly string[]) { return [...new Set(values)]; }
function strings(values?: readonly string[] | null) { return unique((values ?? []).filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean)); }
function safeSource(value?: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
function dateString(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function fresh(record: VisaAssessmentRecord, now: Date) {
  const checkedAt = dateString(record.lastVerifiedAt);
  const age = checkedAt ? now.getTime() - Date.parse(checkedAt) : Number.NaN;
  return Boolean(safeSource(record.sourceUrl)) && Number.isFinite(age) && age >= 0 && age <= VISA_REVIEW_MAX_AGE_DAYS * DAY_MS;
}
function schengen(record?: VisaAssessmentRecord) {
  const region = normalized(record?.region ?? "");
  return /\bschengen\b/.test(region) && !/\bnon schengen\b/.test(region);
}

// Only a simple day limit is executable. Windows, alternative durations and
// other prose require a human check rather than a guessed immigration rule.
function simpleStayLimit(value?: string | null) {
  const match = (value ?? "").trim().match(/^(?:(?:maksimal|max\.?|up to)\s+)?(\d+)\s*(?:hari|days?)(?:\s*(?:per kunjungan|per visit))?\.?$/i);
  return match && Number(match[1]) > 0 ? Number(match[1]) : null;
}

function exactCountry(text: string, records: readonly VisaAssessmentRecord[]) {
  const token = normalized(text);
  const aliases: Record<string, string> = { usa: "united states", us: "united states", "u s a": "united states", kanada: "canada" };
  const target = aliases[token] ?? token;
  const matches = records.filter((record) => [record.name, record.en].some((name) => {
    const key = normalized(name);
    return (aliases[key] ?? key) === target;
  }));
  return matches.length === 1 ? matches[0] : undefined;
}

function routeStops(plan: TourVisaPlan | null, country: string | null | undefined, records: readonly VisaAssessmentRecord[]): Stop[] {
  if (plan) return plan.destinations.map((destination, index) => {
    const matches = records.filter((record) => record.id === destination.countryId);
    const record = matches.length === 1 ? matches[0] : undefined;
    return { destination, record, name: record?.name ?? "Negara belum dipetakan", stayDays: destination.stayDays, index };
  });
  const fullMatch = exactCountry(country ?? "", records);
  const tokens = fullMatch ? [country!] : (country ?? "").split(/[,;|/\n•→–—]+|\s+(?:dan|and|&|-)\s+/i).map((part) => part.trim().replace(/^(?:dan|and)\s+/i, "")).filter(Boolean);
  return unique(tokens).map((name, index) => {
    const record = exactCountry(name, records);
    return { destination: { countryId: record?.id ?? `unmapped-${index}`, stayDays: 0, kind: "visit", service: "offer" }, record, name: record?.name ?? name, stayDays: null, index };
  });
}

function priceFor(record: VisaAssessmentRecord, variantId?: string): { price: number; processingTime: string | null; variantId: string | null } | { error: string; blocking: boolean } {
  const variants = record.variants ?? [];
  if (variantId) {
    const matches = variants.filter((variant) => variant.id === variantId);
    if (matches.length !== 1) return { error: "Pilihan layanan visa perlu diperiksa kembali.", blocking: true };
    const variant = matches[0];
    if (!Number.isFinite(variant.priceIDR) || Number(variant.priceIDR) <= 0) return { error: "Hubungi tim untuk harga layanan visa yang dipilih.", blocking: false };
    return { price: Number(variant.priceIDR), processingTime: variant.processingTime?.trim() || null, variantId };
  }
  if (variants.length > 1) return { error: "Pilih jenis layanan visa yang sesuai dengan perjalanan sebelum menampilkan harga.", blocking: true };
  if (variants.length === 1 && Number.isFinite(variants[0].priceIDR) && Number(variants[0].priceIDR) > 0) {
    return { price: Number(variants[0].priceIDR), processingTime: variants[0].processingTime?.trim() || null, variantId: variants[0].id ?? null };
  }
  const price = parseVisaServicePrice(record.servicePrice);
  return price ? { price, processingTime: null, variantId: null } : { error: "Hubungi tim untuk harga pengurusan visa.", blocking: false };
}

function matchingVisaReference(text: string, record: VisaAssessmentRecord, records: readonly VisaAssessmentRecord[]) {
  const value = normalized(text);
  if (!/\bvisa\b/.test(value)) return "none";
  const names = [record.name, record.en, ...(schengen(record) ? ["Schengen"] : [])];
  const mentions = (name: string) => ` ${value} `.includes(` ${normalized(name)} `);
  if (names.some(mentions)) return "match";
  // A named, unrelated visa is never removed or confused with this service.
  if (records.some((other) => [other.name, other.en].some(mentions)) || /\bschengen\b/.test(value)) return "other";
  return "ambiguous";
}

/** Stable change detector only. This is not an authorization token. */
function fingerprint(value: unknown) {
  const text = JSON.stringify(value);
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (let index = 0; index < text.length; index++) {
    a = Math.imul(a ^ text.charCodeAt(index), 0x01000193);
    b = Math.imul(b ^ text.charCodeAt(index), 0x85ebca6b);
  }
  return `visa-v1-${(a >>> 0).toString(16).padStart(8, "0")}${(b >>> 0).toString(16).padStart(8, "0")}`;
}

export function assessTourVisas(input: TourVisaAssessmentInput, records: readonly VisaAssessmentRecord[], now = new Date()): TourVisaAssessment {
  const normalizedPlan = normalizeTourVisaPlan(input.plan);
  const plan = normalizedPlan.ok ? normalizedPlan.value : null;
  const issues: string[] = normalizedPlan.ok ? [] : [normalizedPlan.error];
  const warnings: string[] = [];
  const legacy = !plan;
  const stops = normalizedPlan.ok ? routeStops(plan, input.country, records) : [];
  if (legacy) warnings.push("Daftar negara dan lama tinggal katalog ini belum diperiksa dalam rencana visa terstruktur.");
  if (!stops.length) issues.push("Negara tujuan belum tersedia untuk pemeriksaan visa.");
  const aggregated = new Map<string, Stop>();
  for (const stop of stops) {
    const key = `${stop.destination.countryId}:${stop.destination.kind}`;
    const previous = aggregated.get(key);
    if (!previous) aggregated.set(key, { ...stop, destination: { ...stop.destination } });
    else {
      if (previous.stayDays !== null && stop.stayDays !== null) previous.stayDays += stop.stayDays;
      if (previous.destination.service !== stop.destination.service || previous.destination.variantId !== stop.destination.variantId) {
        issues.push(`${stop.name}: pilihan layanan pada kunjungan berulang tidak sama.`);
        previous.destination.service = "none";
      }
    }
  }
  const candidates: Candidate[] = [...aggregated.values()].map((stop) => {
    const record = stop.record;
    const result: TourVisaCountryAssessment = {
      id: stop.destination.countryId, name: stop.name, status: "unknown", explanation: "Negara ini perlu dipetakan dan diperiksa sebelum kebutuhan visa dapat ditentukan.",
      conditions: strings([...(record?.conditions ?? []), ...(record?.eligibility ?? [])]),
      sourceUrl: safeSource(record?.sourceUrl), checkedAt: dateString(record?.lastVerifiedAt), serviceState: "consultation",
      href: record ? `/visa/${visaSlug(record.en || record.name)}` : null, stayDays: stop.stayDays, kind: stop.destination.kind,
    };
    const candidate = { stop, result, isSchengen: schengen(record) };
    if (!record) { issues.push(`${stop.name}: negara belum dipetakan ke layanan visa.`); return candidate; }
    if (!fresh(record, now)) {
      result.explanation = "Informasi visa perlu diperiksa kembali. Hubungi tim sebelum menyiapkan dokumen atau memilih layanan.";
      issues.push(`${record.name}: rujukan atau tanggal pemeriksaan visa belum lengkap atau sudah perlu diperbarui.`);
      return candidate;
    }
    result.status = STATUS[normalized(record.visa ?? "")] ?? "unknown";
    if (result.status === "unknown") {
      result.explanation = "Status visa belum ditetapkan. Tim perlu memeriksa persyaratan perjalanan ini.";
      issues.push(`${record.name}: status visa belum dikenali.`);
      return candidate;
    }
    if (stop.destination.kind === "transit") {
      result.status = "conditional";
      result.explanation = "Persyaratan transit perlu diperiksa sesuai bandara, tiket lanjutan, dan apakah Anda melewati imigrasi.";
      warnings.push(`${record.name}: pemeriksaan transit diperlukan; visa wisata tidak ditambahkan otomatis.`);
      return candidate;
    }
    const limit = simpleStayLimit(record.stay);
    if (limit !== null && stop.stayDays !== null && stop.stayDays > limit) {
      result.status = "conditional";
      result.explanation = `Rencana tinggal ${stop.stayDays} hari melebihi batas ${limit} hari pada rujukan. Hubungi tim untuk memeriksa izin yang sesuai.`;
      issues.push(`${record.name}: lama tinggal melebihi batas pada data visa.`);
      return candidate;
    }
    if (result.status === "visa_free" || result.status === "visa_on_arrival") {
      if (limit === null) {
        result.status = "unknown";
        result.explanation = "Batas lama tinggal belum dapat dipastikan dari data yang tersedia. Tim perlu memeriksa persyaratan perjalanan ini.";
        issues.push(`${record.name}: batas lama tinggal perlu diperiksa.`);
      } else if (stop.stayDays === null) {
        result.status = "conditional";
        result.explanation = `Data rujukan mencantumkan ${record.visa === "voa" ? "visa on arrival" : "bebas visa"} sampai ${limit} hari. Lama tinggal katalog belum dicatat; konfirmasikan kepada tim.`;
        warnings.push(`${record.name}: lama tinggal belum tersedia untuk memastikan persyaratan.`);
      } else {
        result.serviceState = "not_needed";
        result.explanation = result.status === "visa_free"
          ? `Bebas visa untuk wisata dengan paspor biasa Indonesia sampai ${limit} hari menurut data yang diperiksa. Rencana tinggal ${stop.stayDays} hari. Periksa syarat masuk sebelum berangkat.`
          : `Visa on arrival sampai ${limit} hari menurut data yang diperiksa. Tidak ada pengurusan visa sebelum keberangkatan yang ditambahkan di sini; periksa dokumen dan biaya saat kedatangan.`;
      }
      return candidate;
    }
    if (result.status === "conditional") {
      result.explanation = "Kebutuhan visa bergantung pada dokumen dan kondisi perjalanan Anda. Hubungi tim agar jalur pengurusan yang sesuai dapat diperiksa.";
      warnings.push(`${record.name}: kondisi masing-masing peserta perlu diperiksa sebelum memilih layanan.`);
      return candidate;
    }
    result.explanation = `${result.status === "evisa" ? "e-Visa" : "Visa"} diperlukan menurut data yang diperiksa untuk paspor biasa Indonesia dan perjalanan wisata. Jika sudah memiliki visa, periksa masa berlaku, jumlah entri, dan cakupannya bersama tim.`;
    return candidate;
  });

  for (const reference of [...(input.inclusions ?? []), ...(input.addOns ?? []).map((addOn) => addOn.name)]) {
    const text = normalized(reference);
    if (!/\bvisa\b/.test(text)) continue;
    const named = records.filter((record) => [record.name, record.en].some((name) => ` ${text} `.includes(` ${normalized(name)} `)));
    const referencedSchengen = /\bschengen\b/.test(text) || named.some(schengen);
    const outsideRoute = named.filter((record) => !stops.some((stop) => stop.record?.id === record.id) && !(schengen(record) && stops.some((stop) => schengen(stop.record))));
    if (outsideRoute.length || (referencedSchengen && !stops.some((stop) => schengen(stop.record)))) {
      issues.push(`Periksa komponen "${reference}" karena negara visanya tidak tercatat dalam rute.`);
    }
  }

  const applyCoverage = (candidate: Candidate) => {
    const { stop, result } = candidate;
    const record = stop.record!;
    if (stop.destination.service === "included" || stop.destination.service === "separate") {
      result.serviceState = stop.destination.service;
      result.explanation += stop.destination.service === "included" ? " Pengurusan visa sudah termasuk paket dan tidak ditambahkan lagi." : " Pengurusan visa ditangani terpisah dan tidak ditambahkan ke total ini.";
      return false;
    }
    if (stop.destination.service === "none") {
      result.explanation += " Pengurusan belum ditawarkan dalam katalog ini; hubungi tim bila membutuhkan bantuan.";
      return false;
    }
    const references = [
      ...(input.inclusions ?? []).map((name) => ({ name, included: true })),
      ...(input.addOns ?? []).map((addOn) => ({ name: addOn.name, included: false })),
    ];
    let conflict = false;
    for (const reference of references) {
      const match = matchingVisaReference(reference.name, record, records);
      if (match === "none") continue;
      if (match === "other") { warnings.push(`Periksa komponen visa lain pada paket: ${reference.name}.`); continue; }
      conflict = true;
      if (match === "match") {
        result.serviceState = reference.included ? "included" : "separate";
        result.explanation += reference.included ? " Visa tercantum dalam isi paket; biaya tidak ditambahkan lagi." : " Visa tercantum sebagai komponen biaya tersendiri; biaya tidak ditambahkan lagi.";
        warnings.push(`${record.name}: komponen visa yang sudah ada perlu diselaraskan dengan rencana visa.`);
      } else {
        result.serviceState = "consultation";
        result.explanation += " Ada komponen visa pada paket yang cakupannya belum jelas. Tim perlu memeriksanya agar biaya tidak dihitung dua kali.";
        issues.push(`${record.name}: cakupan komponen visa paket belum jelas.`);
      }
    }
    return !conflict;
  };

  const offers: AssessedTourVisaOffer[] = [];
  const addOffer = (candidate: Candidate, group: Candidate[] = [candidate]) => {
    const { stop, result } = candidate;
    const price = priceFor(stop.record!, stop.destination.variantId);
    if ("error" in price) {
      for (const item of group) { item.result.serviceState = "consultation"; item.result.explanation += ` ${price.error}`; }
      (price.blocking ? issues : warnings).push(`${result.name}: ${price.error}`);
      return;
    }
    const isGroup = candidate.isSchengen;
    const countryIds = unique(group.map((item) => item.result.id));
    offers.push({ id: isGroup ? "visa-schengen" : `visa-${visaSlug(stop.record!.en || stop.record!.name)}`, name: isGroup ? "Visa Schengen" : `Visa ${result.name}`, price: price.price, href: result.href!, processingTime: price.processingTime, countryIds, variantId: price.variantId });
    for (const item of group) {
      item.result.serviceState = "offered";
      if (isGroup) item.result.explanation += ` Satu layanan Schengen untuk rute ini, dengan pengajuan melalui ${result.name} berdasarkan lama tinggal dan urutan kunjungan yang dicatat.`;
    }
  };

  const schengenGroup = candidates.filter((candidate) => candidate.isSchengen);
  const schengenHandled = new Set<Candidate>();
  if (schengenGroup.length) {
    schengenGroup.forEach((candidate) => schengenHandled.add(candidate));
    const visitStops = stops.filter((stop) => stop.destination.kind === "visit");
    const enteredIndices = visitStops.flatMap((stop, index) => schengen(stop.record) ? [index] : []);
    const reentry = enteredIndices.length > 1 && visitStops.slice(enteredIndices[0], enteredIndices[enteredIndices.length - 1]).some((stop) => !schengen(stop.record));
    const totalDays = schengenGroup.reduce((total, candidate) => total + (candidate.stop.stayDays ?? 0), 0);
    const limits = schengenGroup.map((candidate) => simpleStayLimit(candidate.stop.record?.stay)).filter((limit): limit is number => limit !== null);
    const exceeded = limits.length > 0 && totalDays > Math.min(...limits);
    if (exceeded || reentry) {
      for (const candidate of schengenGroup) {
        if (candidate.result.status !== "unknown") candidate.result.status = "conditional";
        candidate.result.serviceState = "consultation";
        candidate.result.explanation += exceeded
          ? " Total tinggal di negara-negara Schengen melebihi batas pada rujukan; tim perlu memeriksa izin yang sesuai."
          : " Rute keluar lalu masuk kembali ke Schengen; jumlah entri visa perlu diperiksa bersama tim.";
      }
      if (exceeded) issues.push("Total lama tinggal di Schengen melebihi batas pada data visa.");
      if (reentry) warnings.push("Rute kembali memasuki Schengen; jumlah entri visa perlu diperiksa sebelum memilih layanan.");
    }
    const uncertain = schengenGroup.some((candidate) => !["required", "evisa"].includes(candidate.result.status));
    const eligible = schengenGroup.map(applyCoverage);
    if (uncertain) {
      for (const candidate of schengenGroup) {
        if (candidate.result.serviceState === "offered") candidate.result.serviceState = "consultation";
        candidate.result.explanation += " Penawaran Schengen menunggu pemeriksaan seluruh negara dalam rute.";
      }
      warnings.push("Penawaran Schengen tidak ditambahkan karena sebagian rute masih perlu diperiksa.");
    } else if (!eligible.every(Boolean)) {
      const states = unique(schengenGroup.map((candidate) => candidate.stop.destination.service));
      if (states.length > 1) issues.push("Penanganan layanan Schengen pada negara-negara dalam rute belum konsisten.");
    } else if (schengenGroup.length > 1 && schengenGroup.some((candidate) => candidate.stop.stayDays === null)) {
      issues.push("Catat lama tinggal dan urutan negara Schengen untuk menentukan negara pengajuan.");
      schengenGroup.forEach((candidate) => { candidate.result.explanation += " Negara pengajuan belum dapat ditentukan tanpa lama tinggal setiap negara."; });
    } else {
      const main = [...schengenGroup].sort((a, b) => (b.stop.stayDays ?? 0) - (a.stop.stayDays ?? 0) || a.stop.index - b.stop.index)[0];
      addOffer(main, schengenGroup);
    }
  }
  for (const candidate of candidates) {
    if (schengenHandled.has(candidate) || !["required", "evisa"].includes(candidate.result.status)) continue;
    if (applyCoverage(candidate)) addOffer(candidate);
  }

  const countries = candidates.map((candidate) => candidate.result);
  const relevantRecords = unique(stops.flatMap((stop) => stop.record ? [stop.record.id] : [])).sort().map((id) => records.find((record) => record.id === id)!).map((record) => ({
    id: record.id, name: record.name, en: record.en, region: record.region ?? null, visa: record.visa ?? null,
    stay: record.stay ?? null, servicePrice: record.servicePrice ?? null, sourceUrl: safeSource(record.sourceUrl), checkedAt: dateString(record.lastVerifiedAt), fresh: fresh(record, now),
    conditions: strings(record.conditions), eligibility: strings(record.eligibility),
    variants: (record.variants ?? []).map((variant) => ({ id: variant.id ?? null, name: variant.name ?? null, priceIDR: variant.priceIDR ?? null, processingTime: variant.processingTime ?? null })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  }));
  const marker = fingerprint({ version: 1, plan: plan ? { ...plan, review: undefined } : null, country: plan ? null : input.country ?? null, records: relevantRecords, inclusions: input.inclusions ?? [], addOns: input.addOns ?? [], issues: unique(issues) });
  return {
    countries, offers, issues: unique(issues), warnings: unique(warnings), fingerprint: marker, legacy,
    summary: countries.length ? countries.map((country) => `${country.name}: ${country.explanation}`) : ["Hubungi tim untuk pemeriksaan visa. Negara tujuan belum tersedia dalam rencana visa."],
  };
}
