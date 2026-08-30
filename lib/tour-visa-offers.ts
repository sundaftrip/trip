import { visaSlug } from "@/lib/visa-slug";

export type TourVisaSource = {
  title?: string | null;
  slug?: string | null;
  country?: string | null;
  cityHighlight?: string | null;
  route?: string | null;
  // Legacy prose inputs are accepted but never used as evidence of a destination.
  destinationText?: string | readonly string[] | null;
  itinerary?: unknown;
};

export type VisaServiceVariant = {
  name?: string | null;
  priceIDR?: number | null;
  processingTime?: string | null;
  sortOrder?: number | null;
};

export type VisaServiceCatalogEntry = {
  name: string;
  en: string;
  region?: string | null;
  visa?: string | null;
  servicePrice?: string | null;
  sortOrder?: number | null;
  variants?: readonly VisaServiceVariant[] | null;
};

export type TourVisaOffer = {
  id: string;
  name: string;
  price: number;
  href: string;
  processingTime: string | null;
};

type PricedVisaRecord = {
  record: VisaServiceCatalogEntry;
  price: number;
  processingTime: string | null;
};

const CANADA_ALIASES = ["canada", "kanada", "vancouver", "banff", "calgary"];
const UNITED_STATES_ALIASES = [
  "united states",
  "amerika serikat",
  "usa",
  "u s",
  "new york",
  "los angeles",
  "san francisco",
  "las vegas",
];
const SCHENGEN_AREA_ALIASES = ["schengen", "eropa barat", "western europe"];

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(text: string, phrase: string) {
  const normalizedPhrase = normalizeText(phrase);
  return Boolean(normalizedPhrase) && ` ${text} `.includes(` ${normalizedPhrase} `);
}

function phraseIndex(text: string, phrases: readonly string[]) {
  let earliest = Number.POSITIVE_INFINITY;

  for (const phrase of phrases) {
    const normalizedPhrase = normalizeText(phrase);
    if (!normalizedPhrase) continue;
    const index = ` ${text} `.indexOf(` ${normalizedPhrase} `);
    if (index >= 0) earliest = Math.min(earliest, index);
  }

  return earliest;
}

function collectDestinationText(tour: TourVisaSource) {
  const values: string[] = [];

  // Only catalog destination metadata can select a visa service. Itinerary
  // prose, exclusions and visa notes can mention nationalities, architecture,
  // existing visas or transit without making those countries tour destinations.
  for (const value of [
    tour.title,
    tour.slug,
    tour.country,
    tour.cityHighlight,
    tour.route,
  ]) {
    if (value) values.push(value);
  }

  return normalizeText(values.join(" "));
}

export function parseVisaServicePrice(value?: string | null): number | null {
  if (!value) return null;

  const normalized = value
    .toLocaleLowerCase("id-ID")
    .replace(/\u00a0/g, " ")
    .trim();
  const scaledPrice = normalized.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb)\b/);

  if (scaledPrice) {
    const amount = Number(scaledPrice[1].replace(",", "."));
    const multiplier = scaledPrice[2] === "juta" || scaledPrice[2] === "jt"
      ? 1_000_000
      : 1_000;
    const parsed = Math.round(amount * multiplier);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  const groupedPrice = normalized.match(/\d{1,3}(?:[.,\s]\d{3})+|\d+/);
  if (!groupedPrice) return null;

  const parsed = Number(groupedPrice[0].replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function resolveRecordPrice(record: VisaServiceCatalogEntry) {
  const servicePrice = parseVisaServicePrice(record.servicePrice);
  if (servicePrice) {
    return { price: servicePrice, processingTime: null };
  }

  const pricedVariants = (record.variants ?? [])
    .map((variant, index) => ({ variant, index }))
    .filter(({ variant }) => Number.isFinite(variant.priceIDR) && Number(variant.priceIDR) > 0)
    .sort((left, right) => {
      const priceDifference = Number(left.variant.priceIDR) - Number(right.variant.priceIDR);
      if (priceDifference !== 0) return priceDifference;
      const sortDifference = (left.variant.sortOrder ?? left.index) - (right.variant.sortOrder ?? right.index);
      return sortDifference || left.index - right.index;
    });

  const selectedVariant = pricedVariants[0]?.variant;
  if (selectedVariant?.priceIDR) {
    return {
      price: selectedVariant.priceIDR,
      processingTime: selectedVariant.processingTime?.trim() || null,
    };
  }

  return null;
}

function isSchengenRecord(record: VisaServiceCatalogEntry) {
  const region = normalizeText(record.region ?? "");
  return containsPhrase(region, "schengen") && !containsPhrase(region, "non schengen");
}

function isCanadaRecord(record: VisaServiceCatalogEntry) {
  const names = normalizeText(`${record.name} ${record.en}`);
  return containsPhrase(names, "canada") || containsPhrase(names, "kanada");
}

function isUnitedStatesRecord(record: VisaServiceCatalogEntry) {
  const names = normalizeText(`${record.name} ${record.en}`);
  return (
    containsPhrase(names, "united states")
    || containsPhrase(names, "amerika serikat")
    || containsPhrase(names, "usa")
  );
}

function hasUnitedStatesDestination(text: string) {
  if (phraseIndex(text, UNITED_STATES_ALIASES) !== Number.POSITIVE_INFINITY) return true;
  return /\bamerika\b(?!\s+(?:utara|selatan|latin)\b)/.test(text);
}

function visaServiceIsRelevant(record: VisaServiceCatalogEntry) {
  const status = normalizeText(record.visa ?? "");
  return status !== "bebas" && status !== "voa";
}

function recordMatchIndex(text: string, record: VisaServiceCatalogEntry) {
  return phraseIndex(text, [record.name, record.en]);
}

function recordSort(left: VisaServiceCatalogEntry, right: VisaServiceCatalogEntry) {
  const sortDifference = (left.sortOrder ?? Number.MAX_SAFE_INTEGER)
    - (right.sortOrder ?? Number.MAX_SAFE_INTEGER);
  if (sortDifference !== 0) return sortDifference;
  return normalizeText(left.en || left.name).localeCompare(normalizeText(right.en || right.name));
}

function selectPricedRecord(
  records: readonly VisaServiceCatalogEntry[],
  text: string,
): PricedVisaRecord | null {
  const pricedRecords = records
    .map((record) => {
      const price = resolveRecordPrice(record);
      return price ? { record, ...price } : null;
    })
    .filter((entry): entry is PricedVisaRecord => entry !== null)
    .sort((left, right) => {
      const leftIndex = recordMatchIndex(text, left.record);
      const rightIndex = recordMatchIndex(text, right.record);
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;
      return recordSort(left.record, right.record);
    });

  return pricedRecords[0] ?? null;
}

function offerFromRecord(
  pricedRecord: PricedVisaRecord,
  options?: { id?: string; name?: string },
): TourVisaOffer {
  return {
    id: options?.id ?? `visa-${visaSlug(pricedRecord.record.en || pricedRecord.record.name)}`,
    name: options?.name ?? `Visa ${pricedRecord.record.name || pricedRecord.record.en}`,
    price: pricedRecord.price,
    href: `/visa/${visaSlug(pricedRecord.record.en || pricedRecord.record.name)}`,
    processingTime: pricedRecord.processingTime,
  };
}

export function resolveTourVisaOffers(
  tour: TourVisaSource,
  records: readonly VisaServiceCatalogEntry[],
): TourVisaOffer[] {
  const text = collectDestinationText(tour);
  if (!text) return [];

  const candidates: Array<TourVisaOffer & { matchIndex: number }> = [];
  const canadaDestinationIndex = phraseIndex(text, CANADA_ALIASES);
  const unitedStatesDestinationIndex = hasUnitedStatesDestination(text)
    ? Math.min(
        phraseIndex(text, UNITED_STATES_ALIASES),
        text.search(/\bamerika\b(?!\s+(?:utara|selatan|latin)\b)/) >= 0
          ? text.search(/\bamerika\b(?!\s+(?:utara|selatan|latin)\b)/)
          : Number.POSITIVE_INFINITY,
      )
    : Number.POSITIVE_INFINITY;

  if (canadaDestinationIndex !== Number.POSITIVE_INFINITY) {
    const pricedRecord = selectPricedRecord(
      records.filter((record) => visaServiceIsRelevant(record) && isCanadaRecord(record)),
      text,
    );
    if (pricedRecord) {
      candidates.push({
        ...offerFromRecord(pricedRecord, { id: "visa-canada", name: "Visa Kanada" }),
        matchIndex: canadaDestinationIndex,
      });
    }
  }

  if (unitedStatesDestinationIndex !== Number.POSITIVE_INFINITY) {
    const pricedRecord = selectPricedRecord(
      records.filter((record) => visaServiceIsRelevant(record) && isUnitedStatesRecord(record)),
      text,
    );
    if (pricedRecord) {
      candidates.push({
        ...offerFromRecord(pricedRecord, {
          id: "visa-united-states",
          name: "Visa Amerika Serikat",
        }),
        matchIndex: unitedStatesDestinationIndex,
      });
    }
  }

  const schengenRecords = records.filter(
    (record) => visaServiceIsRelevant(record) && isSchengenRecord(record),
  );
  const matchedSchengenRecords = schengenRecords.filter(
    (record) => recordMatchIndex(text, record) !== Number.POSITIVE_INFINITY,
  );
  const schengenAreaIndex = phraseIndex(text, SCHENGEN_AREA_ALIASES);

  if (schengenAreaIndex !== Number.POSITIVE_INFINITY || matchedSchengenRecords.length > 0) {
    const sourceRecords = matchedSchengenRecords.length > 0
      ? matchedSchengenRecords
      : schengenRecords;
    const pricedRecord = selectPricedRecord(sourceRecords, text);
    if (pricedRecord) {
      candidates.push({
        ...offerFromRecord(pricedRecord, { id: "visa-schengen", name: "Visa Schengen" }),
        matchIndex: Math.min(
          schengenAreaIndex,
          recordMatchIndex(text, pricedRecord.record),
        ),
      });
    }
  }

  for (const record of records) {
    if (
      !visaServiceIsRelevant(record)
      || isCanadaRecord(record)
      || isUnitedStatesRecord(record)
      || isSchengenRecord(record)
    ) {
      continue;
    }

    const matchIndex = recordMatchIndex(text, record);
    if (matchIndex === Number.POSITIVE_INFINITY) continue;
    const pricedRecord = selectPricedRecord([record], text);
    if (!pricedRecord) continue;
    candidates.push({ ...offerFromRecord(pricedRecord), matchIndex });
  }

  return candidates
    .sort((left, right) => left.matchIndex - right.matchIndex || left.id.localeCompare(right.id))
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      price: candidate.price,
      href: candidate.href,
      processingTime: candidate.processingTime,
    }));
}
