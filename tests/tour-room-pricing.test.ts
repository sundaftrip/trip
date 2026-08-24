import assert from "node:assert/strict";
import test from "node:test";
import {
  parseTourHotelRoomPricing,
  resolveTourStartingPrice,
  TOUR_ROOM_PRICE_KEYS,
} from "../lib/tour-room-pricing";

test("extracts ordered occupancy prices and adds mandatory costs", () => {
  const result = parseTourHotelRoomPricing({
    Vancouver: "Hotel bintang 3",
    [TOUR_ROOM_PRICE_KEYS.twin]: 44_900_000,
    [TOUR_ROOM_PRICE_KEYS.quad]: "Rp40.900.000",
    [TOUR_ROOM_PRICE_KEYS.triple]: "42900000",
  }, 5_400_000);

  assert.deepEqual(result.hotelInfo, { Vancouver: "Hotel bintang 3" });
  assert.deepEqual(result.roomPrices, [
    {
      code: "quad",
      guestsPerRoom: 4,
      label: "4 orang/kamar",
      headlinePrice: 40_900_000,
      mandatoryTotalPrice: 46_300_000,
    },
    {
      code: "triple",
      guestsPerRoom: 3,
      label: "3 orang/kamar",
      headlinePrice: 42_900_000,
      mandatoryTotalPrice: 48_300_000,
    },
    {
      code: "twin",
      guestsPerRoom: 2,
      label: "2 orang/kamar",
      headlinePrice: 44_900_000,
      mandatoryTotalPrice: 50_300_000,
    },
  ]);
});

test("leaves legacy hotel data unchanged when reserved keys are absent", () => {
  assert.deepEqual(
    parseTourHotelRoomPricing({ Vancouver: "Hotel A", Banff: "Hotel B" }, 1_000_000),
    {
      hotelInfo: { Vancouver: "Hotel A", Banff: "Hotel B" },
      roomPrices: [],
    },
  );
});

test("hides reserved keys even when a room price is invalid", () => {
  assert.deepEqual(
    parseTourHotelRoomPricing({
      [TOUR_ROOM_PRICE_KEYS.quad]: "belum dikonfirmasi",
      [TOUR_ROOM_PRICE_KEYS.triple]: -1,
    }, -10),
    { hotelInfo: null, roomPrices: [] },
  );
});

test("uses the first room tier as the authoritative starting price", () => {
  const { roomPrices } = parseTourHotelRoomPricing({
    [TOUR_ROOM_PRICE_KEYS.quad]: 40_900_000,
    [TOUR_ROOM_PRICE_KEYS.triple]: 42_900_000,
  }, 5_400_000);

  assert.deepEqual(resolveTourStartingPrice(39_000_000, 5_400_000, roomPrices), {
    headlinePrice: 40_900_000,
    mandatoryTotalPrice: 46_300_000,
    source: "room_tier",
  });
});

test("keeps the existing tour price path when room tiers are absent", () => {
  assert.deepEqual(resolveTourStartingPrice(27_500_000, 1_250_000, []), {
    headlinePrice: 27_500_000,
    mandatoryTotalPrice: 28_750_000,
    source: "tour_price",
  });
});
