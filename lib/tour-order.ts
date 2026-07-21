export const MAX_PINNED_TOURS = 5;

type TourOrderItem = {
  title?: string | null;
  country?: string | null;
  cityHighlight?: string | null;
  pinned?: boolean | null;
  status?: string | null;
  tripDate?: Date | string | null;
};

export type PublicTourState = "bookable" | "flexible" | "sold" | "completed";

function time(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const ms = date.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function pinnedValue(tour: TourOrderItem) {
  return tour.pinned ? 1 : 0;
}

function comparePinned(a: TourOrderItem, b: TourOrderItem) {
  return pinnedValue(b) - pinnedValue(a);
}

function compareDateAscNullLast(a: TourOrderItem, b: TourOrderItem) {
  const at = time(a.tripDate) ?? Number.POSITIVE_INFINITY;
  const bt = time(b.tripDate) ?? Number.POSITIVE_INFINITY;
  return at - bt;
}

function compareDateDescNullLast(a: TourOrderItem, b: TourOrderItem) {
  const at = time(a.tripDate) ?? Number.NEGATIVE_INFINITY;
  const bt = time(b.tripDate) ?? Number.NEGATIVE_INFINITY;
  return bt - at;
}

function coreMarketValue(tour: TourOrderItem) {
  const haystack = [tour.country, tour.title, tour.cityHighlight].filter(Boolean).join(" ").toLowerCase();
  return /(rusia|russia|aurora|murmansk|teriberka|asia tengah|central asia|kazakhstan|kyrgyzstan|uzbekistan|tajikistan)/i.test(haystack)
    ? 0
    : 1;
}

function compareCoreMarket(a: TourOrderItem, b: TourOrderItem) {
  return coreMarketValue(a) - coreMarketValue(b);
}

export function getPublicTourState(tour: TourOrderItem, now = new Date()): PublicTourState {
  if (tour.status === "FULL") return "sold";
  const tripTime = time(tour.tripDate);
  if (tripTime !== null && tripTime < now.getTime()) return "completed";
  return tripTime === null ? "flexible" : "bookable";
}

export function isDoneTour(tour: TourOrderItem, now = new Date()) {
  const state = getPublicTourState(tour, now);
  return state === "sold" || state === "completed";
}

export function compareFeaturedTourOrder(a: TourOrderItem, b: TourOrderItem) {
  return comparePinned(a, b) || compareCoreMarket(a, b) || compareDateAscNullLast(a, b);
}

export function comparePublicTourCatalogOrder(a: TourOrderItem, b: TourOrderItem, now = new Date()) {
  const aDone = isDoneTour(a, now);
  const bDone = isDoneTour(b, now);
  if (aDone !== bDone) return aDone ? 1 : -1;
  return aDone ? compareDateDescNullLast(a, b) : compareFeaturedTourOrder(a, b);
}
