import test from "node:test";
import assert from "node:assert/strict";
import { LATIN_AMERICA_PACKAGES } from "../lib/latin-america-packages";
import { LATIN_AMERICA_PROGRAMMES } from "../lib/latin-america";
import { packageGroup, packageTotal, type PackagePrice } from "../lib/latin-america-package-types";

test("every public group size has a complete retail price and option schedule", () => {
  for (const [id, detail] of Object.entries(LATIN_AMERICA_PACKAGES)) {
    const price = detail.price;
    assert.deepEqual(price.groups.map((group) => group.groupSize), [10, 15, 20], id);
    assert.equal(packageGroup(price).from, price.from, id);
    assert.equal(price.from, Math.min(...price.groups.map((group) => group.from)), id);
    assert.equal(detail.hotels.reduce((sum, hotel) => sum + hotel.nights, 0), detail.days.length - 1, id);
    assert.equal(new Set(price.options.map((option) => option.id)).size, price.options.length, id);
    for (const group of price.groups) {
      assert.ok(Number.isSafeInteger(group.from) && group.from > 0, `${id}/${group.groupSize}`);
      assert.ok(Number.isSafeInteger(group.landOnlyFrom) && group.landOnlyFrom > 0 && group.landOnlyFrom < group.from);
      assert.ok(group.roomNote.length > 0);
      assert.deepEqual(Object.keys(group.optionPrices).sort(), price.options.map((option) => option.id).sort());
      for (const option of price.options) {
        const amount = group.optionPrices[option.id];
        assert.ok(Number.isSafeInteger(amount) && amount > 0, `${id}/${group.groupSize}/${option.id}`);
        if (group.groupSize === price.groupSize) assert.equal(amount, option.amount);
      }
    }
    assert.match(packageGroup(price, 15).roomNote, /7 kamar berdua \+ 1 kamar bersama tour leader/);
  }
});

test("group changes reprice selected options without duplicating charges", () => {
  const price: PackagePrice = {
    from: 100_000, groupSize: 20, hotel: "Test", basisNote: "",
    options: [
      { id: "hotel", name: "Hotel", amount: 20_000, description: "" },
      { id: "rail", name: "Rail", amount: 15_000, description: "" },
    ],
    groups: [
      { groupSize: 10, from: 160_000, landOnlyFrom: 80_000, optionPrices: { hotel: 35_000, rail: 15_000 }, roomNote: "5 twin" },
      { groupSize: 15, from: 130_000, landOnlyFrom: 60_000, optionPrices: { hotel: 25_000, rail: 15_000 }, roomNote: "7 twin + guest sharing TL" },
      { groupSize: 20, from: 100_000, landOnlyFrom: 50_000, optionPrices: { hotel: 20_000, rail: 15_000 }, roomNote: "10 twin" },
    ],
  };
  const selected = ["hotel", "rail", "hotel", "unknown"];
  assert.equal(packageTotal(price), 100_000);
  assert.equal(packageTotal(price, selected, 10), 210_000);
  assert.equal(packageTotal(price, selected, 15), 170_000);
  assert.equal(packageTotal(price, selected, 20), 135_000);
  assert.equal(packageTotal(price, [], 10), 160_000);
  assert.throws(() => packageTotal(price, selected, 12), RangeError);
  assert.equal(packageTotal(price, selected, 10, "land-only"), 130_000);
  assert.equal(packageTotal(price, selected, 15, "land-only"), 100_000);
  assert.equal(packageTotal(price, selected, 20, "land-only"), 85_000);
  assert.equal(packageTotal(price, [], 15, "land-only"), 60_000);
  assert.equal(packageTotal(price, selected, 15, "with-flights"), 170_000);
  assert.equal(price.from, 100_000);
});

test("public package payloads contain no procurement breakdown or research notes", () => {
  for (const detail of Object.values(LATIN_AMERICA_PACKAGES)) {
    assert.deepEqual(Object.keys(detail.price).sort(), ["from", "groupSize", "hotel", "options", "basisNote", "groups"].sort());
  }
  const publicData = JSON.stringify([LATIN_AMERICA_PACKAGES, LATIN_AMERICA_PROGRAMMES]);
  assert.doesNotMatch(publicData, /sampel|rata-rata|diteliti|alokasi|markup|airfare allowances|supplier proposals|pembagian tiket/i);
});


test("land-only describes required flights separately from common ground services", () => {
  for (const detail of Object.values(LATIN_AMERICA_PACKAGES)) {
    assert.ok(detail.landTour.duration && detail.landTour.meetingPoint && detail.landTour.finishPoint);
    assert.ok(detail.landTour.flightSectors.length > 0);
    assert.doesNotMatch(detail.included.join(" "), /Tiket Jakarta|Tiket internasional|penerbangan regional/i);
    assert.match(detail.flightInclusions, /Tiket/);
  }
  assert.equal(LATIN_AMERICA_PACKAGES.peru.landTour.finishPoint, "Bandara Cusco (CUZ)");
  assert.equal(LATIN_AMERICA_PACKAGES["empat-negara"].landTour.flightSectors.length, 7);
});
