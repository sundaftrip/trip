import assert from "node:assert/strict";
import test from "node:test";

import { applyOptionalServicesToDepartures } from "../lib/tour-optional-pricing";

function normalizeCurrency(value: string) {
  return value.replace(/\s+/g, " ");
}

test("adds selected optional services to every departure independently", () => {
  const departures = applyOptionalServicesToDepartures([
    { id: "april", priceLabel: "lama", priceValue: 40_000_000 },
    { id: "mei", priceLabel: "lama", priceValue: 43_000_000 },
  ], 3_600_000);

  assert.equal(normalizeCurrency(departures[0].priceLabel), "Rp 43.600.000");
  assert.equal(normalizeCurrency(departures[1].priceLabel), "Rp 46.600.000");
});

test("preserves a departure label when no numeric price is available", () => {
  const departures = applyOptionalServicesToDepartures([
    { id: "fleksibel", priceLabel: "Sesuai permintaan" },
  ], 3_600_000);

  assert.equal(departures[0].priceLabel, "Sesuai permintaan");
});
