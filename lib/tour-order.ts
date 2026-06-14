export const MAX_PINNED_TOURS = 5;

type TourOrderItem = {
  pinned?: boolean | null;
  status?: string | null;
  tripDate?: Date | string | null;
};

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

export function isDoneTour(tour: TourOrderItem, now = new Date()) {
  const tripTime = time(tour.tripDate);
  return tour.status === "FULL" || (tripTime !== null && tripTime < now.getTime());
}

export function compareFeaturedTourOrder(a: TourOrderItem, b: TourOrderItem) {
  return comparePinned(a, b) || compareDateAscNullLast(a, b);
}

export function comparePublicTourCatalogOrder(a: TourOrderItem, b: TourOrderItem, now = new Date()) {
  const aDone = isDoneTour(a, now);
  const bDone = isDoneTour(b, now);
  if (aDone !== bDone) return aDone ? 1 : -1;
  return aDone ? compareDateDescNullLast(a, b) : compareFeaturedTourOrder(a, b);
}
