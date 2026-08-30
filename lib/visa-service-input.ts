import type { Prisma } from "@prisma/client";

const VISA_STATUSES = new Set(["bebas", "voa", "evisa", "wajib", "conditional"]);
const MAX_INTEGER = 2_147_483_647; // Prisma Int / PostgreSQL integer.
const MAX_ITEMS = 100;

export class VisaServiceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VisaServiceInputError";
  }
}

type ServiceFields = {
  sortOrder: number;
  flag: string;
  name: string;
  en: string;
  region: string;
  visa: string;
  stay: string;
  cost: string;
  notes: string;
  officialFee: string | null;
  servicePrice: string | null;
  sourceUrl: string | null;
  lastVerifiedAt: Date | null;
  conditions: string[];
  eligibility: string[];
  documents: { name: string; hint?: string }[];
  faqs: { question: string; answer: string }[];
};

type VariantFields = {
  name: string;
  priceIDR: number | null;
  processingTime: string | null;
  notes: string | null;
};

export type ParsedVisaServiceInput = {
  data: Partial<ServiceFields>;
  variants?: (Partial<VariantFields> & { id?: string; sortOrder: number })[];
};

function invalid(field: string): never {
  throw new VisaServiceInputError(`Data ${field} tidak valid. Periksa kembali isian.`);
}

function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid(field);
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string, required = false, maxLength = 20_000): string {
  if (typeof value !== "string") invalid(field);
  const result = value.trim();
  if ((required && !result) || result.length > maxLength) invalid(field);
  return result;
}

function nullableText(value: unknown, field: string): string | null {
  return value === null ? null : text(value, field) || null;
}

function integer(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > MAX_INTEGER) invalid(field);
  return value;
}

function list(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) invalid(field);
  return value;
}

function sourceUrl(value: unknown): string | null {
  const raw = nullableText(value, "sumber aturan");
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    // This is a stored reference, not a URL-fetch operation. Reject credentials,
    // non-web schemes and local/IP-only destinations before public rendering.
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password
      || !host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":")
      || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host)) invalid("sumber aturan");
    return url.href;
  } catch {
    invalid("sumber aturan");
  }
}

function verifiedDate(value: unknown): Date | null {
  const raw = nullableText(value, "tanggal pemeriksaan");
  if (!raw) return null;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/);
  if (!match) invalid("tanggal pemeriksaan");
  const calendar = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(calendar.getTime())
    || calendar.toISOString().slice(0, 10) !== raw.slice(0, 10)) invalid("tanggal pemeriksaan");
  return date;
}

/** Whitelisted create/update parsing. An omitted field never becomes an update. */
export function parseVisaServiceInput(body: unknown, mode: "create" | "update"): ParsedVisaServiceInput {
  const input = object(body, "layanan visa");
  const data: Partial<ServiceFields> = {};
  for (const key of ["flag", "name", "en", "region", "visa", "stay", "cost", "notes"] as const) {
    if (Object.hasOwn(input, key)) {
      data[key] = text(input[key], key, key === "name" || key === "visa", key === "name" ? 500 : 20_000);
    }
  }
  if (mode === "create" && (!data.name || !data.visa)) {
    throw new VisaServiceInputError("Nama negara & jenis visa wajib diisi.");
  }
  if (data.visa !== undefined && !VISA_STATUSES.has(data.visa)) invalid("jenis visa");
  if (Object.hasOwn(input, "sortOrder")) data.sortOrder = integer(input.sortOrder, "urutan");
  for (const key of ["officialFee", "servicePrice"] as const) {
    if (Object.hasOwn(input, key)) data[key] = nullableText(input[key], key);
  }
  if (Object.hasOwn(input, "sourceUrl")) data.sourceUrl = sourceUrl(input.sourceUrl);
  if (Object.hasOwn(input, "lastVerifiedAt")) data.lastVerifiedAt = verifiedDate(input.lastVerifiedAt);
  for (const key of ["conditions", "eligibility"] as const) {
    if (Object.hasOwn(input, key)) data[key] = list(input[key], key).map((item) => text(item, key)).filter(Boolean);
  }
  if (Object.hasOwn(input, "documents")) {
    data.documents = list(input.documents, "dokumen").map((item) => {
      const doc = object(item, "dokumen");
      const hint = Object.hasOwn(doc, "hint") ? text(doc.hint, "petunjuk dokumen") : "";
      return { name: text(doc.name, "nama dokumen", true), ...(hint ? { hint } : {}) };
    });
  }
  if (Object.hasOwn(input, "faqs")) {
    data.faqs = list(input.faqs, "FAQ").map((item) => {
      const faq = object(item, "FAQ");
      return { question: text(faq.question, "pertanyaan", true), answer: text(faq.answer, "jawaban", true) };
    });
  }
  if (!Object.hasOwn(input, "variants")) return { data };

  const ids = new Set<string>();
  const variants = list(input.variants, "varian layanan").map((item, index) => {
    const variant = object(item, "varian layanan");
    const id = Object.hasOwn(variant, "id") && variant.id !== undefined
      ? text(variant.id, "ID varian", true, 200) : undefined;
    if (id && (mode === "create" || ids.has(id))) invalid("ID varian");
    if (id) ids.add(id);
    const fields: Partial<VariantFields> = {};
    if (Object.hasOwn(variant, "name")) fields.name = text(variant.name, "nama varian", true, 500);
    if (!id && !fields.name) invalid("nama varian");
    if (Object.hasOwn(variant, "priceIDR")) fields.priceIDR = variant.priceIDR === null ? null : integer(variant.priceIDR, "harga varian");
    for (const key of ["processingTime", "notes"] as const) {
      if (Object.hasOwn(variant, key)) fields[key] = nullableText(variant[key], key);
    }
    return { ...(id ? { id } : {}), ...fields,
      sortOrder: Object.hasOwn(variant, "sortOrder") ? integer(variant.sortOrder, "urutan varian") : index };
  });
  return { data, variants };
}

function newVariant(variant: NonNullable<ParsedVisaServiceInput["variants"]>[number]) {
  if (variant.id || !variant.name) invalid("varian baru");
  return {
    name: variant.name,
    sortOrder: variant.sortOrder,
    priceIDR: variant.priceIDR ?? null,
    processingTime: variant.processingTime ?? null,
    notes: variant.notes ?? null,
  };
}

export function visaServiceCreateData(input: ParsedVisaServiceInput): Prisma.CountryVisaCreateInput {
  if (!input.data.name || !input.data.visa) invalid("layanan visa");
  return {
    sortOrder: 0, flag: "", en: "", region: "", stay: "", cost: "", notes: "",
    officialFee: null, servicePrice: null, sourceUrl: null, lastVerifiedAt: null,
    conditions: [], eligibility: [], documents: [], faqs: [],
    ...input.data, name: input.data.name, visa: input.data.visa,
    variants: { create: (input.variants ?? []).map(newVariant) },
  };
}

/** Build a single atomic nested mutation after reading this country's own IDs. */
export function visaServiceUpdateData(
  input: ParsedVisaServiceInput,
  existingVariantIds: readonly string[],
): Prisma.CountryVisaUpdateInput {
  if (input.variants === undefined) return { ...input.data };
  const ownedIds = new Set(existingVariantIds);
  const retainedIds = input.variants.flatMap((variant) => variant.id ? [variant.id] : []);
  if (retainedIds.some((id) => !ownedIds.has(id))) {
    throw new VisaServiceInputError("Varian layanan tidak ditemukan pada negara ini. Muat ulang data sebelum menyimpan.");
  }
  return {
    ...input.data,
    variants: {
      deleteMany: retainedIds.length ? { id: { notIn: retainedIds } } : {},
      update: input.variants.filter((variant) => variant.id).map(({ id, ...data }) => ({ where: { id }, data })),
      create: input.variants.filter((variant) => !variant.id).map(newVariant),
    },
  };
}
