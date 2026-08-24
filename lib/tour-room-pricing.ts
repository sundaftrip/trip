export const TOUR_ROOM_PRICE_KEYS = {
  quad: "__room_price_quad",
  triple: "__room_price_triple",
  twin: "__room_price_twin",
} as const;

export type TourRoomPriceCode = keyof typeof TOUR_ROOM_PRICE_KEYS;

export type TourRoomPrice = {
  code: TourRoomPriceCode;
  guestsPerRoom: 2 | 3 | 4;
  label: string;
  headlinePrice: number;
  mandatoryTotalPrice: number;
};

export type TourStartingPrice = {
  headlinePrice: number;
  mandatoryTotalPrice: number;
  source: "room_tier" | "tour_price";
};

type RoomPriceDefinition = {
  code: TourRoomPriceCode;
  key: string;
  guestsPerRoom: 2 | 3 | 4;
  label: string;
};

const ROOM_PRICE_DEFINITIONS: RoomPriceDefinition[] = [
  {
    code: "quad",
    key: TOUR_ROOM_PRICE_KEYS.quad,
    guestsPerRoom: 4,
    label: "4 orang/kamar",
  },
  {
    code: "triple",
    key: TOUR_ROOM_PRICE_KEYS.triple,
    guestsPerRoom: 3,
    label: "3 orang/kamar",
  },
  {
    code: "twin",
    key: TOUR_ROOM_PRICE_KEYS.twin,
    guestsPerRoom: 2,
    label: "2 orang/kamar",
  },
];

const ROOM_PRICE_KEYS = new Set(ROOM_PRICE_DEFINITIONS.map((item) => item.key));

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parsePositivePrice(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("-")) return null;

  // The catalog importer stores integer IDR amounts, but accepting formatted
  // values keeps manually entered JSON such as "Rp40.900.000" usable.
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizedMandatoryTotal(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function normalizedTourPrice(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

/**
 * Room-tier JSON is authoritative when present. This prevents a later promo or
 * base-price edit from making the "harga mulai" label disagree with the first
 * occupancy card. Tours without room tiers retain their existing price path.
 */
export function resolveTourStartingPrice(
  tourBasePrice: number,
  mandatoryTotal: number,
  roomPrices: TourRoomPrice[],
): TourStartingPrice {
  const firstRoomPrice = roomPrices[0];
  if (firstRoomPrice) {
    return {
      headlinePrice: firstRoomPrice.headlinePrice,
      mandatoryTotalPrice: firstRoomPrice.mandatoryTotalPrice,
      source: "room_tier",
    };
  }

  const headlinePrice = normalizedTourPrice(tourBasePrice);
  return {
    headlinePrice,
    mandatoryTotalPrice: headlinePrice + normalizedMandatoryTotal(mandatoryTotal),
    source: "tour_price",
  };
}

export function parseTourHotelRoomPricing(
  hotel: unknown,
  mandatoryTotal = 0,
): {
  hotelInfo: Record<string, string> | null;
  roomPrices: TourRoomPrice[];
} {
  const record = asRecord(hotel);
  if (!record) return { hotelInfo: null, roomPrices: [] };

  const hotelEntries = Object.entries(record).flatMap(([label, value]) => {
    if (ROOM_PRICE_KEYS.has(label)) return [];
    if (typeof value !== "string" && typeof value !== "number") return [];
    return [[label, String(value)] as const];
  });
  const hotelInfo = hotelEntries.length > 0 ? Object.fromEntries(hotelEntries) : null;
  const requiredCosts = normalizedMandatoryTotal(mandatoryTotal);
  const roomPrices = ROOM_PRICE_DEFINITIONS.flatMap((definition) => {
    const headlinePrice = parsePositivePrice(record[definition.key]);
    if (!headlinePrice) return [];

    return [{
      code: definition.code,
      guestsPerRoom: definition.guestsPerRoom,
      label: definition.label,
      headlinePrice,
      mandatoryTotalPrice: headlinePrice + requiredCosts,
    }];
  });

  return { hotelInfo, roomPrices };
}
