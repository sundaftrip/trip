import assert from "node:assert/strict";
import test from "node:test";
import {
  formatOptionalActivityDisclosure,
  formatPackageCostDisclosure,
  TOUR_COST_DETAILS_NOTE,
  tourSubtotalLabel,
} from "../lib/tour-cost-disclosure";
import { reviewedEnglishFor } from "../lib/reviewed-english-copy";

test("subtotal captions distinguish package, required additions and selected services in both languages", () => {
  assert.equal(tourSubtotalLabel(false), "Harga paket");
  assert.equal(tourSubtotalLabel(true), "Subtotal paket + tambahan wajib");
  for (const hasMandatory of [false, true]) {
    assert.equal(tourSubtotalLabel(hasMandatory, true), "Subtotal pilihan per orang");
    assert.match(reviewedEnglishFor(tourSubtotalLabel(hasMandatory, true))!, /subtotal/);
  }
  assert.match(reviewedEnglishFor(tourSubtotalLabel(true))!, /subtotal/);
  assert.match(reviewedEnglishFor(TOUR_COST_DETAILS_NOTE)!, /excluded costs/);
});

test("disclosure keeps exact base exclusions and reconciles required additions already counted", () => {
  const items = ["Visa Rusia", "Bagasi pesawat domestik Rusia", "Tipping"];
  const before = [...items];
  const text = formatPackageCostDisclosure(items, true);
  assert.ok(text.includes(items.join("; ")));
  assert.match(text, /Tambahan wajib yang ditampilkan sudah dihitung dalam subtotal/);
  assert.match(text, /Tambahan opsional yang belum dipilih tidak termasuk subtotal/);
  assert.deepEqual(items, before);
  for (const missing of [undefined, null, [], ["", "  "]]) {
    const fallback = formatPackageCostDisclosure(missing, false);
    assert.ok(fallback.includes(TOUR_COST_DETAILS_NOTE));
    assert.doesNotMatch(fallback, /Visa Rusia|Bagasi|sudah dihitung/);
  }
});

test("optional activity disclosure preserves actual scope and omits required and legacy visa entries", () => {
  const items = [
    { name: "Bagasi", tag: "wajib", price: 2_500_000 },
    { name: "Visa Rusia", price: 1_400_000, tag: "recommended" },
    { name: "eVisa Rusia", price: 1_400_000, tag: "recommended" },
    { name: "Sami Village", price: "1500000", desc: "Tiket masuk dan kereta rusa; di luar paket utama." },
    { name: "Aktivitas belum berharga", price: null },
    { name: "Museum Visage", price: 200_000 },
    null,
  ];
  const before = structuredClone(items);
  const result = formatOptionalActivityDisclosure(items);
  assert.match(result, /Sami Village \(Rp\s*1\.500\.000\): Tiket masuk dan kereta rusa; di luar paket utama/);
  assert.match(result, /Aktivitas belum berharga \(harga dikonfirmasi\)/);
  assert.match(result, /Museum Visage \(Rp\s*200\.000\)/);
  assert.doesNotMatch(result, /Bagasi|Visa Rusia|eVisa Rusia|1\.400\.000|2\.500\.000/);
  assert.deepEqual(items, before);
  assert.equal(formatOptionalActivityDisclosure(null), "");
});
