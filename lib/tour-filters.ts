import { getCommerceTourStatus, parseDurationDays } from "./tour-commerce";

export type CatalogTripType = "open" | "private" | "archive";
export type CatalogDuration = "all" | "short" | "medium" | "long";
export type CatalogPrice = "all" | "under-10" | "10-20" | "20-plus";
export type CatalogAvailability =
  | "all"
  | "available"
  | "last_seats"
  | "confirmed"
  | "sold_out"
  | "waitlist";
export type CatalogSort = "relevant" | "departure" | "price" | "newest";

export type CatalogFilterState = {
  type: CatalogTripType;
  destination: string;
  month: string;
  duration: CatalogDuration;
  price: CatalogPrice;
  availability: CatalogAvailability;
  sort: CatalogSort;
};

export type CatalogFilterTour = {
  id: string;
  title: string;
  country?: string | null;
  cityHighlight?: string | null;
  tripDate?: string | Date | null;
  createdAt?: string | Date | null;
  duration?: string | null;
  price?: number | null;
  promoPrice?: number | null;
  mandatoryTotal?: number | null;
  seatsLeft?: number | null;
  status?: string | null;
  badge?: string | null;
  pinned?: boolean | null;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilterState = {
  type: "open",
  destination: "all",
  month: "all",
  duration: "all",
  price: "all",
  availability: "all",
  sort: "relevant",
};

const TRIP_TYPE_TO_QUERY: Record<CatalogTripType, string> = {
  open: "open-trip",
  private: "land-tour",
  archive: "archive",
};

const QUERY_TO_TRIP_TYPE: Record<string, CatalogTripType> = {
  open: "open",
  "open-trip": "open",
  private: "private",
  "land-tour": "private",
  archive: "archive",
  completed: "archive",
};

function one(value: string | string[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends string>(value: string | undefined, options: readonly T[]): value is T {
  return Boolean(value && options.includes(value as T));
}

export function parseCatalogFilters(
  input:
    | URLSearchParams
    | Record<string, string | string[] | null | undefined>,
): CatalogFilterState {
  const get = (key: string) =>
    input instanceof URLSearchParams ? input.get(key) || undefined : one(input[key]) || undefined;

  const rawType = get("type");
  const duration = get("duration");
  const price = get("price");
  const availability = get("availability");
  const sort = get("sort");
  const destination = get("destination") || get("region") || "all";
  const month = get("month") || "all";

  return {
    type: (rawType && QUERY_TO_TRIP_TYPE[rawType]) || DEFAULT_CATALOG_FILTERS.type,
    destination: /^[a-z0-9-]+$/i.test(destination) ? destination : "all",
    month: month === "all" || /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : "all",
    duration: isOneOf(duration, ["all", "short", "medium", "long"] as const)
      ? duration
      : "all",
    price: isOneOf(price, ["all", "under-10", "10-20", "20-plus"] as const)
      ? price
      : "all",
    availability: isOneOf(
      availability,
      ["all", "available", "last_seats", "confirmed", "sold_out", "waitlist"] as const,
    )
      ? availability
      : "all",
    sort: isOneOf(sort, ["relevant", "departure", "price", "newest"] as const)
      ? sort
      : "relevant",
  };
}

export function serializeCatalogFilters(state: CatalogFilterState) {
  const params = new URLSearchParams();

  if (state.type !== DEFAULT_CATALOG_FILTERS.type) {
    params.set("type", TRIP_TYPE_TO_QUERY[state.type]);
  }
  if (state.destination !== "all") params.set("destination", state.destination);
  if (state.month !== "all") params.set("month", state.month);
  if (state.duration !== "all") params.set("duration", state.duration);
  if (state.price !== "all") params.set("price", state.price);
  if (state.availability !== "all") params.set("availability", state.availability);
  if (state.sort !== "relevant") params.set("sort", state.sort);

  return params.toString();
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCatalogDestination(tour: CatalogFilterTour) {
  const text = `${tour.country || ""} ${tour.cityHighlight || ""} ${tour.title}`.toLocaleLowerCase(
    "id-ID",
  );
  if (/(rusia|russia|aurora|murmansk|teriberka|moscow|moskow|petersburg)/i.test(text)) {
    return "rusia";
  }
  if (/(asia tengah|central asia|4[- ]?tan|kazakh|kyrgyz|uzbek|tajik|turkmen)/i.test(text)) {
    return "asia-tengah";
  }
  if (/(vietnam|hanoi|sapa|danang|da nang|hoi an|phu quoc|ninh binh)/i.test(text)) {
    return "vietnam";
  }
  if (/(jepang|japan|tokyo|hokkaido|osaka|kyoto|sapporo|otaru)/i.test(text)) {
    return "jepang";
  }
  return slugify(tour.country || tour.cityHighlight || "lainnya") || "lainnya";
}

export function getCatalogTripType(
  tour: CatalogFilterTour,
  now = new Date(),
): CatalogTripType {
  const status = getCommerceTourStatus(tour, now);
  if (status === "completed") return "archive";
  if (!tour.tripDate || status === "flexible") return "private";
  return "open";
}

function matchesDuration(tour: CatalogFilterTour, duration: CatalogDuration) {
  if (duration === "all") return true;
  const days = parseDurationDays(tour.duration);
  if (days === null) return false;
  if (duration === "short") return days <= 6;
  if (duration === "medium") return days >= 7 && days <= 10;
  return days >= 11;
}

function priceOf(tour: CatalogFilterTour) {
  const basePrice = Number(tour.promoPrice ?? tour.price);
  if (!Number.isFinite(basePrice) || basePrice <= 0) return null;

  const rawMandatoryTotal = Number(tour.mandatoryTotal);
  const mandatoryTotal =
    Number.isFinite(rawMandatoryTotal) && rawMandatoryTotal > 0 ? rawMandatoryTotal : 0;
  return basePrice + mandatoryTotal;
}

function matchesPrice(tour: CatalogFilterTour, price: CatalogPrice) {
  if (price === "all") return true;
  const value = priceOf(tour);
  if (value === null) return false;
  if (price === "under-10") return value < 10_000_000;
  if (price === "10-20") return value >= 10_000_000 && value <= 20_000_000;
  return value > 20_000_000;
}

function dateTime(value?: string | Date | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) ? time : null;
}

export function getUpcomingDepartureMonths<T extends CatalogFilterTour>(
  tours: T[],
  now = new Date(),
) {
  const nowTime = now.getTime();
  return Array.from(
    new Set(
      tours.flatMap((tour) => {
        const departureTime = dateTime(tour.tripDate);
        if (departureTime === null || departureTime < nowTime) return [];

        const month = tour.tripDate instanceof Date
          ? tour.tripDate.toISOString().slice(0, 7)
          : String(tour.tripDate).slice(0, 7);
        return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? [month] : [];
      }),
    ),
  ).sort();
}

export function filterCatalogTours<T extends CatalogFilterTour>(
  tours: T[],
  filters: CatalogFilterState,
  now = new Date(),
) {
  const matching = tours.filter((tour) => {
    const commerceStatus = getCommerceTourStatus(tour, now);
    return (
      getCatalogTripType(tour, now) === filters.type &&
      (filters.destination === "all" || getCatalogDestination(tour) === filters.destination) &&
      (filters.month === "all" ||
        (typeof tour.tripDate === "string"
          ? tour.tripDate.startsWith(filters.month)
          : tour.tripDate?.toISOString().startsWith(filters.month))) &&
      matchesDuration(tour, filters.duration) &&
      matchesPrice(tour, filters.price) &&
      (filters.availability === "all" || commerceStatus === filters.availability)
    );
  });

  return matching.sort((a, b) => {
    const aDate = dateTime(a.tripDate);
    const bDate = dateTime(b.tripDate);
    const aPrice = priceOf(a);
    const bPrice = priceOf(b);

    if (filters.sort === "departure") {
      return (aDate ?? Number.POSITIVE_INFINITY) - (bDate ?? Number.POSITIVE_INFINITY);
    }
    if (filters.sort === "price") {
      return (aPrice ?? Number.POSITIVE_INFINITY) - (bPrice ?? Number.POSITIVE_INFINITY);
    }
    if (filters.sort === "newest") {
      return (
        (dateTime(b.createdAt) ?? Number.NEGATIVE_INFINITY)
        - (dateTime(a.createdAt) ?? Number.NEGATIVE_INFINITY)
      );
    }

    const pinDifference = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinDifference) return pinDifference;
    const statusRank = (tour: CatalogFilterTour) => {
      const status = getCommerceTourStatus(tour, now);
      return {
        confirmed: 0,
        last_seats: 1,
        available: 2,
        waitlist: 3,
        sold_out: 4,
        flexible: 5,
        completed: 6,
      }[status];
    };
    return (
      statusRank(a) - statusRank(b) ||
      (aDate ?? Number.POSITIVE_INFINITY) - (bDate ?? Number.POSITIVE_INFINITY)
    );
  });
}
