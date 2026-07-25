import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalogTours,
  getCatalogTripType,
  parseCatalogFilters,
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

test("keeps future sold-out departures in open trip and past records in archive", () => {
  assert.equal(getCatalogTripType(tours[1], NOW), "open");
  assert.equal(getCatalogTripType(tours[3], NOW), "archive");
  assert.deepEqual(
    filterCatalogTours(tours, DEFAULT_CATALOG_FILTERS, NOW).map((tour) => tour.id),
    ["open", "sold-future"],
  );
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
