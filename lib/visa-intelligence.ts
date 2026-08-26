import { visaSlug } from "@/lib/visa-slug";

export const VISA_INTELLIGENCE_CANONICAL_URL =
  "https://sundaftrip.com/visa-intelligence";
export const VISA_INTELLIGENCE_JSON_URL =
  `${VISA_INTELLIGENCE_CANONICAL_URL}/data.json`;
export const VISA_INTELLIGENCE_RSS_URL =
  `${VISA_INTELLIGENCE_CANONICAL_URL}/feed.xml`;

type DateInput = Date | string | null | undefined;

export type VisaIntelligenceInput = {
  id: string;
  flag: string;
  name: string;
  en: string;
  region: string;
  visa: string;
  stay: string;
  cost: string;
  officialFee?: string | null;
  servicePrice?: string | null;
  notes: string;
  conditions?: readonly string[];
  sourceUrl?: string | null;
  lastVerifiedAt?: DateInput;
  updatedAt: DateInput;
};

const VISA_STATUS_LABELS: Readonly<Record<string, string>> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
  conditional: "Bersyarat",
};

function cleanText(value: string | null | undefined) {
  return value?.trim() || null;
}

function isoDate(value: DateInput) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function publicHttpUrl(value: string | null | undefined) {
  const candidate = cleanText(value);
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export type VisaIntelligenceRecord = ReturnType<typeof buildVisaIntelligenceRecord>;

export function buildVisaIntelligenceRecord(input: VisaIntelligenceInput) {
  const slug = visaSlug(input.en || input.name) || input.id;
  const statusCode = cleanText(input.visa)?.toLowerCase() || "unknown";
  const sourceUrl = publicHttpUrl(input.sourceUrl);

  return {
    record_id: `visa:${slug}`,
    country: {
      name_id: input.name.trim(),
      name_en: input.en.trim(),
      region: input.region.trim(),
      flag: input.flag.trim(),
    },
    traveler_scope: {
      passport: "Indonesia",
      passport_type: "ordinary",
    },
    visa_status: {
      code: statusCode,
      label_id: VISA_STATUS_LABELS[statusCode] ?? input.visa.trim(),
    },
    maximum_stay: cleanText(input.stay),
    fees: {
      official_fee: cleanText(input.officialFee),
      sundaf_service_price: cleanText(input.servicePrice),
      legacy_cost_summary: cleanText(input.cost),
    },
    conditions: (input.conditions ?? []).map((item) => item.trim()).filter(Boolean),
    notes: cleanText(input.notes),
    source: sourceUrl
      ? {
          url: sourceUrl,
          classification: "stored_reference",
          caveat:
            "This link is stored with the record; its authority and freshness must be checked independently.",
        }
      : null,
    last_checked_at: isoDate(input.lastVerifiedAt),
    database_updated_at: isoDate(input.updatedAt),
    detail_url: `https://sundaftrip.com/visa/${slug}`,
  };
}

export function buildVisaIntelligenceDataset(
  inputs: readonly VisaIntelligenceInput[],
  generatedAt: DateInput = new Date(),
) {
  const records = inputs
    .map(buildVisaIntelligenceRecord)
    .sort((a, b) => {
      const aDate = a.last_checked_at ?? a.database_updated_at ?? "";
      const bDate = b.last_checked_at ?? b.database_updated_at ?? "";
      return bDate.localeCompare(aDate) || a.country.name_id.localeCompare(b.country.name_id, "id");
    });
  const recordsWithSource = records.filter((record) => record.source).length;
  const recordsWithCheckDate = records.filter((record) => record.last_checked_at).length;
  const latestCheckedAt = records.reduce<string | null>((latest, record) => {
    if (!record.last_checked_at) return latest;
    return !latest || record.last_checked_at > latest ? record.last_checked_at : latest;
  }, null);

  return {
    schema_version: "1.0",
    dataset_id: "sundaf-visa-intelligence",
    dataset_type: "current_status_snapshot",
    title: "Sundaf Visa Intelligence",
    canonical_url: VISA_INTELLIGENCE_CANONICAL_URL,
    generated_at: isoDate(generatedAt),
    language: "id-ID",
    scope: {
      traveler: "Pemegang paspor biasa Indonesia",
      subject: "Status dan persyaratan visa per negara yang tercatat di database Sundaf Trip",
    },
    methodology: {
      page: `${VISA_INTELLIGENCE_CANONICAL_URL}#metodologi`,
      source_classification: "stored_reference",
      update_model:
        "Snapshot is generated from the current Sundaf Trip visa database; database updates are not proof of a government rule change.",
    },
    summary: {
      record_count: records.length,
      records_with_source: recordsWithSource,
      records_with_check_date: recordsWithCheckDate,
      latest_checked_at: latestCheckedAt,
    },
    limitations: [
      "This dataset is informational and is not legal or immigration advice.",
      "Coverage can be incomplete or stale, and a stored source link is not automatically an official source.",
      "last_checked_at is an internal review date, not a government effective date.",
      "This is a current-status snapshot, not a historical change log or correction history.",
      "Travelers must verify requirements with the responsible government, embassy, consulate, and carrier before travel.",
    ],
    distributions: {
      json: VISA_INTELLIGENCE_JSON_URL,
      rss: VISA_INTELLIGENCE_RSS_URL,
      html: VISA_INTELLIGENCE_CANONICAL_URL,
    },
    records,
  };
}

export type VisaIntelligenceDataset = ReturnType<typeof buildVisaIntelligenceDataset>;

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function serializeVisaIntelligenceRss(dataset: VisaIntelligenceDataset) {
  const lastBuildDate = dataset.generated_at
    ? new Date(dataset.generated_at).toUTCString()
    : new Date(0).toUTCString();
  const items = dataset.records.map((record) => {
    const date = record.last_checked_at ?? record.database_updated_at ?? dataset.generated_at;
    const details = [
      `Status tercatat: ${record.visa_status.label_id}`,
      record.maximum_stay ? `Masa tinggal tercatat: ${record.maximum_stay}` : null,
      record.source ? `Rujukan tersimpan: ${record.source.url}` : "Rujukan tersimpan: tidak tersedia",
      "Snapshot ini bukan pemberitahuan perubahan resmi.",
    ].filter(Boolean).join(" · ");
    const guidDate = record.database_updated_at ?? record.last_checked_at ?? "undated";

    return [
      "    <item>",
      `      <title>${escapeXml(`${record.country.name_id}: ${record.visa_status.label_id}`)}</title>`,
      `      <link>${escapeXml(record.detail_url)}</link>`,
      `      <guid isPermaLink="false">${escapeXml(`${record.record_id}:${guidDate}`)}</guid>`,
      date ? `      <pubDate>${new Date(date).toUTCString()}</pubDate>` : null,
      `      <description>${escapeXml(details)}</description>`,
      `      <category>${escapeXml(record.visa_status.label_id)}</category>`,
      record.source
        ? `      <sundaf:sourceUrl>${escapeXml(record.source.url)}</sundaf:sourceUrl>`
        : null,
      record.last_checked_at
        ? `      <sundaf:lastCheckedAt>${escapeXml(record.last_checked_at)}</sundaf:lastCheckedAt>`
        : null,
      "    </item>",
    ].filter(Boolean).join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sundaf="https://sundaftrip.com/visa-intelligence/schema/1.0">',
    "  <channel>",
    "    <title>Sundaf Visa Intelligence</title>",
    `    <link>${VISA_INTELLIGENCE_CANONICAL_URL}</link>`,
    "    <description>Current visa-status snapshots for Indonesian ordinary-passport holders. Not an official change log.</description>",
    "    <language>id-ID</language>",
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${VISA_INTELLIGENCE_RSS_URL}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
