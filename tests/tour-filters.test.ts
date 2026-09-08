import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogTours,
  getCatalogTripType,
  getUpcomingDepartureMonths,
  parseCatalogFilters,
  resolveCatalogFilters,
  serializeCatalogFilters,
} from "../lib/tour-filters";

const NOW = new Date("2026-07-26T00:00:00.000Z");
const tours = [
  {
    id: "open",
    title: "Russia Aurora",
    country: "Russia",
    tripDate: "2026-12-10T00:00:00.000Z",
    duration: "9 hari",
    price: 33_000_000,
    seatsLeft: 8,
    status: "ACTIVE",
  },
  {
    id: "sold-future",
    title: "Winter Hokkaido",
    country: "Japan",
    tripDate: "2026-12-20T00:00:00.000Z",
    duration: "7 hari",
    price: 18_000_000,
    seatsLeft: 0,
    status: "FULL",
  },
  {
    id: "private",
    title: "Vietnam Private",
    country: "Vietnam",
    tripDate: null,
    duration: "6 hari",
    price: 8_000_000,
    seatsLeft: 0,
    status: "ACTIVE",
  },
  {
    id: "archive",
    title: "Central Asia 4-TAN",
    country: "Kazakhstan",
    tripDate: "2026-01-05T00:00:00.000Z",
    duration: "11 hari",
    price: 29_000_000,
    seatsLeft: 0,
    status: "FULL",
  },
];

test("serializes only meaningful catalog filter state and parses legacy region", () => {
  assert.equal(serializeCatalogFilters(DEFAULT_CATALOG_FILTERS), "");
  const query = serializeCatalogFilters({
    ...DEFAULT_CATALOG_FILTERS,
    type: "private",
    destination: "vietnam",
    price: "under-10",
  });
  assert.equal(query, "type=land-tour&destination=vietnam&price=under-10");
  assert.deepEqual(parseCatalogFilters(new URLSearchParams(query)), {
    ...DEFAULT_CATALOG_FILTERS,
    type: "private",
    destination: "vietnam",
    price: "under-10",
  });
  assert.equal(parseCatalogFilters({ region: "asia-tengah" }).destination, "asia-tengah");
});

test("destination entry links show matching land tours when no open trip is available", () => {
  for (const input of [
    new URLSearchParams("destination=vietnam"),
    { region: "Vietnam" },
    { destination: ["vietnam"], type: "invalid" },
  ]) {
    const filters = resolveCatalogFilters(tours, input, NOW);
    assert.equal(filters.type, "private");
    assert.equal(filters.destination, "vietnam");
    assert.deepEqual(filterCatalogTours(tours, filters, NOW).map((tour) => tour.id), ["private"]);
  }
});

test("an explicit category survives URL navigation even when it has no destination results", () => {
  for (const type of ["open-trip", "open", "land-tour", "private", "archive", "completed"]) {
    const input = new URLSearchParams({ destination: "vietnam", type });
    const filters = resolveCatalogFilters(tours, input, NOW);
    assert.equal(filters.type, parseCatalogFilters(input).type);
    assert.deepEqual(resolveCatalogFilters(tours, new URLSearchParams(serializeCatalogFilters(filters)), NOW), filters);
  }
  assert.equal(
    serializeCatalogFilters({ ...DEFAULT_CATALOG_FILTERS, destination: "vietnam" }),
    "type=open-trip&destination=vietnam",
  );
});

test("automatic category selection retains matching open trips and never substitutes another destination", () => {
  assert.equal(resolveCatalogFilters(tours, { destination: "rusia" }, NOW).type, "open");
  const bothTypes = [...tours, { ...tours[0], id: "vietnam-open", title: "Vietnam departure", country: "Vietnam" }];
  const vietnamFilters = resolveCatalogFilters(bothTypes, { destination: "vietnam" }, NOW);
  assert.equal(vietnamFilters.type, "open");
  assert.deepEqual(filterCatalogTours(bothTypes, vietnamFilters, NOW).map((tour) => tour.id), ["vietnam-open"]);
  assert.deepEqual(resolveCatalogFilters(tours, {}, NOW), DEFAULT_CATALOG_FILTERS);
  for (const destination of ["missing-country", "asia-tengah"]) {
    const filters = resolveCatalogFilters(tours, { destination }, NOW);
    assert.equal(filters.type, "open");
    assert.deepEqual(filterCatalogTours(tours, filters, NOW), []);
  }
  const canada = [{ ...tours[2], id: "canada", title: "Canadian Rockies", country: "Canada" }];
  assert.equal(resolveCatalogFilters(canada, { destination: "canada" }, NOW).type, "private");
});

test("automatic land-tour selection respects price, duration, month, availability and sorting", () => {
  const filters = resolveCatalogFilters(tours, {
    destination: "vietnam", price: "under-10", duration: "short", sort: "price",
  }, NOW);
  assert.equal(filters.type, "private");
  assert.equal(filters.price, "under-10");
  assert.equal(filters.duration, "short");
  assert.equal(filters.sort, "price");
  for (const extra of [
    { price: "20-plus" }, { duration: "long" }, { month: "2026-12" }, { availability: "confirmed" },
  ]) {
    const input = { destination: "vietnam", ...extra };
    const filtered = resolveCatalogFilters(tours, input, NOW);
    assert.deepEqual(filtered, parseCatalogFilters(input));
    assert.deepEqual(filterCatalogTours(tours, filtered, NOW), []);
  }
});

test("keeps future sold-out departures in open trip and past records in archive", () => {
  assert.equal(getCatalogTripType(tours[1], NOW), "open");
  assert.equal(getCatalogTripType(tours[3], NOW), "archive");
  assert.deepEqual(
    filterCatalogTours(tours, DEFAULT_CATALOG_FILTERS, NOW).map((tour) => tour.id),
    ["open", "sold-future"],
  );
});

test("lists only upcoming departure months in the catalog filter", () => {
  assert.deepEqual(getUpcomingDepartureMonths(tours, NOW), ["2026-12"]);
});

test("applies destination, month, duration, price, availability, and sort filters", () => {
  const filtered = filterCatalogTours(
    tours,
    {
      type: "open",
      destination: "jepang",
      month: "2026-12",
      duration: "medium",
      price: "10-20",
      availability: "sold_out",
      sort: "price",
    },
    NOW,
  );
  assert.deepEqual(filtered.map((tour) => tour.id), ["sold-future"]);
});

test("sorts newest tours by record creation time rather than departure date", () => {
  const tours = [
    {
      id: "older-record",
      title: "Older record",
      tripDate: "2026-12-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      price: 10_000_000,
      status: "ACTIVE",
    },
    {
      id: "newer-record",
      title: "Newer record",
      tripDate: "2026-09-01T00:00:00.000Z",
      createdAt: "2026-07-01T00:00:00.000Z",
      price: 10_000_000,
      status: "ACTIVE",
    },
  ];

  const results = filterCatalogTours(tours, {
    ...DEFAULT_CATALOG_FILTERS,
    sort: "newest",
  }, NOW);

  assert.deepEqual(results.map((tour) => tour.id), ["newer-record", "older-record"]);
});

test("filters and sorts by the displayed total including mandatory costs", () => {
  const pricedTours = [
    {
      id: "crosses-10m",
      title: "Crosses ten million",
      tripDate: "2026-10-01T00:00:00.000Z",
      price: 9_500_000,
      mandatoryTotal: 1_000_000,
      status: "ACTIVE",
    },
    {
      id: "promo-crosses-10m",
      title: "Promo crosses ten million",
      tripDate: "2026-10-02T00:00:00.000Z",
      price: 12_000_000,
      promoPrice: 9_250_000,
      mandatoryTotal: 1_000_000,
      status: "ACTIVE",
    },
    {
      id: "crosses-20m",
      title: "Crosses twenty million",
      tripDate: "2026-10-03T00:00:00.000Z",
      price: 20_000_000,
      mandatoryTotal: 1_000_000,
      status: "ACTIVE",
    },
    {
      id: "stays-under-10m",
      title: "Stays under ten million",
      tripDate: "2026-10-04T00:00:00.000Z",
      price: 8_000_000,
      mandatoryTotal: 500_000,
      status: "ACTIVE",
    },
  ];

  const middleBand = filterCatalogTours(
    pricedTours,
    {
      ...DEFAULT_CATALOG_FILTERS,
      price: "10-20",
      sort: "price",
    },
    NOW,
  );
  assert.deepEqual(
    middleBand.map((tour) => tour.id),
    ["promo-crosses-10m", "crosses-10m"],
  );

  assert.deepEqual(
    filterCatalogTours(
      pricedTours,
      { ...DEFAULT_CATALOG_FILTERS, price: "under-10" },
      NOW,
    ).map((tour) => tour.id),
    ["stays-under-10m"],
  );
  assert.deepEqual(
    filterCatalogTours(
      pricedTours,
      { ...DEFAULT_CATALOG_FILTERS, price: "20-plus" },
      NOW,
    ).map((tour) => tour.id),
    ["crosses-20m"],
  );
});

test("already-departed tours leave the booking catalog before the trip ends", () => {
  const ongoing = { ...tours[0], tripDate: "2026-07-20", duration: "11 hari" };
  assert.equal(getCatalogTripType(ongoing, NOW), "archive");
  assert.deepEqual(filterCatalogTours([ongoing], DEFAULT_CATALOG_FILTERS, NOW), []);
});
