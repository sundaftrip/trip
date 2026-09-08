import test from "node:test";
import assert from "node:assert/strict";
import { LATIN_AMERICA_PACKAGES } from "../lib/latin-america-packages";
import { packageTotal, type PackagePrice } from "../lib/latin-america-package-types";

test("published catalogue totals reconcile to their displayed components", () => {
  for (const [id, detail] of Object.entries(LATIN_AMERICA_PACKAGES)) {
    assert.ok(Number.isSafeInteger(detail.price.from) && detail.price.from > 0, id);
    assert.equal(detail.price.groupSize, 20, id);
    assert.equal(detail.price.components.reduce((sum, line) => sum + line.amount, 0), detail.price.from, id);
    assert.equal(detail.hotels.reduce((sum, hotel) => sum + hotel.nights, 0), detail.days.length - 1, id);
    assert.equal(new Set(detail.price.options.map((option) => option.id)).size, detail.price.options.length, id);
    for (const option of detail.price.options) assert.ok(Number.isSafeInteger(option.amount) && option.amount > 0, `${id}/${option.id}`);
  }
});

test("selecting optional services cannot duplicate a charge or change the base price", () => {
  const price: PackagePrice = {
    from: 100_000, groupSize: 20, hotel: "Test", updated: "Test", components: [], airfareNote: "", basisNote: "",
    options: [
      { id: "hotel", name: "Hotel", amount: 20_000, description: "" },
      { id: "rail", name: "Rail", amount: 15_000, description: "" },
    ],
  };
  assert.equal(packageTotal(price), 100_000);
  assert.equal(packageTotal(price, ["hotel", "rail"]), 135_000);
  assert.equal(packageTotal(price, ["rail"]), 115_000);
  assert.equal(packageTotal(price, ["hotel", "hotel", "unknown"]), 120_000);
  assert.equal(price.from, 100_000);
});
