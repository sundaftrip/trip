import type { PdfAddOn } from "@/components/pdf/ItineraryPDF";
import {
  resolveTourVisaOffers,
  type TourVisaSource,
  type VisaServiceCatalogEntry,
} from "./tour-visa-offers";
import { formatCurrency } from "./utils";

const VISA_SERVICE_NAME = /\b(?:e[\s-]?)?visa\b/i;
const VISA_PREFIX = /^(?:(?:jasa|layanan|pengurusan|biaya)\s+)*(?:e\s*)?visa(?:\s+|$)/;

function normalizedName(value: string) {
  return value.toLocaleLowerCase("id-ID").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function visaServiceScope(name: string): string | null {
  // Unit labels do not change a service's scope. Every other trailing token,
  // including visa type, duration and additional countries, must be preserved.
  const normalized = normalizedName(name).replace(/\s+(?:per\s+)?(?:orang|pax)$/, "");
  return VISA_PREFIX.test(normalized) ? normalized.replace(VISA_PREFIX, "") : null;
}

/** Replace optional legacy visa quotes; mandatory charges are kept verbatim. */
export function preparePdfVisaAddOns(
  addOns: readonly PdfAddOn[],
  tour: TourVisaSource,
  catalog: readonly VisaServiceCatalogEntry[],
): PdfAddOn[] {
  const mandatoryVisa = addOns.filter((item) => item.tag === "wajib" && VISA_SERVICE_NAME.test(item.name));
  // Reuse the resolver only to identify which already-required visa covers an
  // offer. An unspecified mandatory visa is not quoted a second time.
  const coveredOffers = mandatoryVisa.map((item) => resolveTourVisaOffers({ title: item.name }, catalog));
  const unspecifiedMandatoryVisa = mandatoryVisa.some((item) => visaServiceScope(item.name) === "");
  const seenOfferIds = new Set(coveredOffers.flatMap((offers) => offers.map((offer) => offer.id)));
  const destinationOffers = resolveTourVisaOffers(tour, catalog);
  const knownScopes = new Set([
    ...catalog.flatMap((record) => [normalizedName(record.name), normalizedName(record.en)]),
    ...destinationOffers.map((offer) => visaServiceScope(offer.name)),
  ].filter((scope): scope is string => Boolean(scope)));
  // Only an exact known single-service name is replaceable. A missing country
  // record or an extra service qualifier cannot silently disappear from a quote.
  const preservedServices = new Set(addOns.filter((item) => {
    if (item.tag === "wajib" || !VISA_SERVICE_NAME.test(item.name)) return false;
    const scope = visaServiceScope(item.name);
    return scope !== "" && (scope === null || !knownScopes.has(scope));
  }));
  const preservedOfferIds = new Set([...preservedServices].flatMap((item) => (
    resolveTourVisaOffers({ title: item.name }, catalog).map((offer) => offer.id)
  )));
  const optionalVisa = unspecifiedMandatoryVisa ? [] : destinationOffers.flatMap((offer) => {
    if (seenOfferIds.has(offer.id) || preservedOfferIds.has(offer.id)) return [];
    seenOfferIds.add(offer.id);
    return [{
      name: offer.name,
      price: offer.price,
      priceLabel: formatCurrency(offer.price),
      tag: "" as const,
      desc: [
        "Layanan pengurusan visa, di luar subtotal paket.",
        offer.processingTime ? `Estimasi layanan: ${offer.processingTime}.` : "",
        `Rincian: https://sundaftrip.com${offer.href}`,
      ].filter(Boolean).join(" "),
    }];
  });

  // Replace only covered visa services. An absent catalog offer is not evidence
  // that an unrelated legacy service or its CMS quote should be removed.
  const retained = addOns.flatMap((item) => {
    if (item.tag === "wajib" || !VISA_SERVICE_NAME.test(item.name)) return [item];
    if (preservedServices.has(item)) return [item];
    const matchingOffers = resolveTourVisaOffers({ title: item.name }, catalog);
    if (matchingOffers.length > 0 && matchingOffers.every((offer) => seenOfferIds.has(offer.id))) return [];
    if (seenOfferIds.size > 0 && visaServiceScope(item.name) === "") return [];
    return [item];
  });
  return [
    ...retained,
    ...optionalVisa,
  ];
}
