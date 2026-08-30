import type { GeoDestinationContent, GeoFaq, GeoPageContent, GeoSection } from "@/types/geo";

type Check = (value: unknown) => boolean;
export type GeoCmsInvalidField = "sections" | "faqs" | "content";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const isString: Check = (value) => typeof value === "string";

function arrayOf(check: Check): Check {
  return (value) => {
    if (!Array.isArray(value)) return false;
    // Iteration visits sparse slots too, unlike Array.every.
    for (const item of value) if (!check(item)) return false;
    return true;
  };
}

function shape(
  strings: readonly string[],
  required: Readonly<Record<string, Check>> = {},
  optional: Readonly<Record<string, Check>> = {},
): Check {
  return (value) => {
    if (!isRecord(value)) return false;
    for (const key of strings) if (!isString(value[key])) return false;
    for (const [key, check] of Object.entries(required)) if (!check(value[key])) return false;
    for (const [key, check] of Object.entries(optional)) {
      if (value[key] !== undefined && !check(value[key])) return false;
    }
    return true;
  };
}

const checkSections = arrayOf(shape(["title"], {}, { body: isString, items: arrayOf(isString) }));
const checkFaqs = arrayOf(shape(["question", "answer"]));
const quickFactIcons = new Set(["plane", "calendar", "thermometer", "wallet", "map-pin"]);
const checkDestination = shape([], {
  hero: shape([
    "eyebrow", "titleLine1", "titleLine2", "description", "image", "imageAlt",
    "primaryCtaLabel", "allToursCtaLabel", "secondaryCtaLabel",
  ]),
  quickFacts: arrayOf(shape(["label", "value"], {
    icon: (value) => typeof value === "string" && quickFactIcons.has(value),
  })),
  intro: shape(["eyebrow", "title"], { paragraphs: arrayOf(isString) }),
  guide: shape(["eyebrow", "title"], { cards: arrayOf(shape(["title", "content"])) }),
  activities: shape(["eyebrow", "title"], {
    items: arrayOf(shape(["title", "desc", "img"], {}, { video: isString, credit: isString })),
  }),
  travel: shape(["eyebrow", "title"], { steps: arrayOf(shape(["step", "title", "desc"])) }),
  budget: shape(["eyebrow", "title", "totalLabel", "totalValue", "note"], {
    items: arrayOf(shape(["item", "range"])),
  }),
  emptyTours: shape(["icon", "title", "description", "ctaLabel", "ctaHref"]),
  finalCta: shape(["title", "description", "buttonLabel"]),
});

/** Validate submitted JSON without coercing, filtering, or mutating stored data. */
export function validateGeoCmsStructuredInput(data: Record<string, unknown>): string | null {
  if (Object.hasOwn(data, "sections") && !checkSections(data.sections)) {
    return "Konten tambahan harus berupa daftar berisi judul, isi teks, dan poin teks yang valid.";
  }
  if (Object.hasOwn(data, "faqs") && !checkFaqs(data.faqs)) {
    return "FAQ harus berupa daftar pertanyaan dan jawaban teks yang valid.";
  }
  if (Object.hasOwn(data, "content") && data.content !== null && !checkDestination(data.content)) {
    return "Konten halaman destinasi tidak lengkap atau memiliki format yang tidak valid. Periksa seluruh bagian sebelum menyimpan.";
  }
  return null;
}

export interface GeoCmsEditorData {
  sections: GeoSection[];
  faqs: GeoFaq[];
  destination: GeoDestinationContent | undefined;
  invalidFields: GeoCmsInvalidField[];
}

/** Fallbacks are for display only. Callers must omit invalidFields when saving. */
export function normalizeGeoCmsEditorData(
  data: { sections?: unknown; faqs?: unknown; content?: unknown; destination?: unknown },
  fallback?: GeoPageContent,
): GeoCmsEditorData {
  const invalidFields: GeoCmsInvalidField[] = [];
  let sections = fallback?.sections ?? [];
  let faqs = fallback?.faqs ?? [];
  let destination = fallback?.destination;

  if (data.sections != null) {
    if (checkSections(data.sections)) sections = data.sections as GeoSection[];
    else invalidFields.push("sections");
  }
  if (data.faqs != null) {
    if (checkFaqs(data.faqs)) faqs = data.faqs as GeoFaq[];
    else invalidFields.push("faqs");
  }
  // A malformed persisted content value must not be hidden by a valid alias.
  const rawDestination = data.content ?? data.destination;
  if (rawDestination != null) {
    if (checkDestination(rawDestination)) destination = rawDestination as GeoDestinationContent;
    else invalidFields.push("content");
  }

  return { sections, faqs, destination, invalidFields };
}
