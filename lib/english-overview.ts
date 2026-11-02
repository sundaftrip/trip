// English, crawler-visible facts for the /en overview page.
// The site's ID/EN toggle translates in the browser only, so assistants and
// search crawlers never see English text without a server-rendered page.
import { resolveCanadaRockiesAddOns } from "./canada-catalog-preview";
import { canonicalTourPath } from "./seo-routes";
import { getCommerceTourStatus, mandatoryAddOnsTotal } from "./tour-commerce";
import { parseTourHotelRoomPricing, resolveTourStartingPrice } from "./tour-room-pricing";

export type EnglishOverviewTour = {
  id: string;
  slug?: string | null;
  title: string;
  country: string;
  cityHighlight?: string | null;
  duration: string | null;
  tripDate: Date | null;
  price: number;
  promoPrice: number | null;
  addOns: unknown;
  hotel?: unknown;
  status: string;
  badge?: string | null;
};

const COUNTRY_EN: Record<string, string> = {
  rusia: "Russia",
  jepang: "Japan",
  kanada: "Canada",
  vietnam: "Vietnam",
  kazakhstan: "Kazakhstan",
  kazakstan: "Kazakhstan",
  uzbekistan: "Uzbekistan",
  kirgizstan: "Kyrgyzstan",
  kyrgyzstan: "Kyrgyzstan",
  "asia tengah": "Central Asia",
  turki: "Turkey",
  tiongkok: "China",
  china: "China",
  "korea selatan": "South Korea",
  peru: "Peru",
};

const DATE_EN = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const STATUS_EN: Record<string, string> = {
  available: "Seats available",
  last_seats: "Last seats",
  confirmed: "Guaranteed departure",
  flexible: "Flexible dates",
};

export function englishCountry(country: string) {
  const key = country.trim().toLowerCase();
  return COUNTRY_EN[key] ?? country.trim();
}

/** "10 Hari 7 Malam" -> "10 days, 7 nights"; unknown formats are returned unchanged. */
export function englishDuration(duration: string | null | undefined) {
  if (!duration?.trim()) return null;
  const days = duration.match(/(\d+)\s*hari/i)?.[1];
  const nights = duration.match(/(\d+)\s*malam/i)?.[1];
  if (!days && !nights) return duration.trim();
  return [days ? `${days} days` : null, nights ? `${nights} nights` : null].filter(Boolean).join(", ");
}

export function englishDepartureDate(date: Date | null) {
  return date ? DATE_EN.format(date) : "Private trip, dates on request";
}

export function englishTourFacts(tour: EnglishOverviewTour, now = new Date()) {
  const addOns = resolveCanadaRockiesAddOns(tour.addOns, tour.slug);
  const mandatoryTotal = mandatoryAddOnsTotal(addOns);
  const { roomPrices } = parseTourHotelRoomPricing(tour.hotel, mandatoryTotal);
  const { headlinePrice, mandatoryTotalPrice } = resolveTourStartingPrice(
    tour.promoPrice ?? tour.price,
    mandatoryTotal,
    roomPrices,
  );
  const status = getCommerceTourStatus(tour, now);
  return {
    title: tour.title,
    path: canonicalTourPath(tour),
    country: englishCountry(tour.country),
    route: tour.cityHighlight?.replace(/•/g, "").replace(/\s+,/g, ",").trim() || null,
    departure: englishDepartureDate(tour.tripDate),
    duration: englishDuration(tour.duration),
    fromPrice: headlinePrice > 0 ? mandatoryTotalPrice : null,
    includesMandatoryAddOns: headlinePrice > 0 && mandatoryTotal > 0,
    statusLabel: STATUS_EN[status] ?? null,
  };
}

/** IDR amount in English formatting, e.g. "IDR 29,500,000". */
export function formatIdrEnglish(amount: number) {
  return `IDR ${Math.round(amount).toLocaleString("en-US")}`;
}
