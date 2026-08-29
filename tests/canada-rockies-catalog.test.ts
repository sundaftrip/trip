import assert from "node:assert/strict";
import test from "node:test";
import {
  CANADA_ROCKIES_MANDATORY_TOTAL,
  CANADA_ROCKIES_PRICE_GUARD,
  CANADA_ROCKIES_ROOM_PRICES,
  CANADA_ROCKIES_TOUR,
} from "../data/catalog/canada-rockies-april-2027";

test("posting and mandatory totals stay within the audited public price gap", () => {
  for (const tier of ["quad", "triple", "twin"] as const) {
    const headlineGap = CANADA_ROCKIES_PRICE_GUARD.comparisonRoomPrices[tier]
      - CANADA_ROCKIES_ROOM_PRICES[tier];
    const payableGap = CANADA_ROCKIES_PRICE_GUARD.comparisonRoomPrices[tier]
      + CANADA_ROCKIES_PRICE_GUARD.comparisonMandatoryTotal
      - (CANADA_ROCKIES_ROOM_PRICES[tier] + CANADA_ROCKIES_MANDATORY_TOTAL);

    assert.ok(headlineGap >= CANADA_ROCKIES_PRICE_GUARD.minimumGap);
    assert.ok(headlineGap <= CANADA_ROCKIES_PRICE_GUARD.maximumGap);
    assert.ok(payableGap >= CANADA_ROCKIES_PRICE_GUARD.minimumGap);
    assert.ok(payableGap <= CANADA_ROCKIES_PRICE_GUARD.maximumGap);
  }
});

test("travel insurance is recommended and excluded from the default payable total", () => {
  const mandatoryTotal = CANADA_ROCKIES_TOUR.addOns
    .filter((item) => item.tag === "wajib")
    .reduce((sum, item) => sum + item.price, 0);
  const travelInsurance = CANADA_ROCKIES_TOUR.addOns.find((item) => (
    /asuransi perjalanan usia sampai 69 tahun/i.test(item.name)
  ));

  assert.equal(mandatoryTotal, CANADA_ROCKIES_MANDATORY_TOTAL);
  assert.equal(travelInsurance?.tag, "recommended");
  assert.equal(travelInsurance?.price, 1_000_000);
  assert.equal(CANADA_ROCKIES_ROOM_PRICES.quad + mandatoryTotal, 45_300_000);
  assert.equal(CANADA_ROCKIES_ROOM_PRICES.triple + mandatoryTotal, 47_300_000);
  assert.equal(CANADA_ROCKIES_ROOM_PRICES.twin + mandatoryTotal, 49_300_000);
  assert.equal(CANADA_ROCKIES_ROOM_PRICES.quad + mandatoryTotal + travelInsurance!.price, 46_300_000);
  assert.equal(CANADA_ROCKIES_ROOM_PRICES.triple + mandatoryTotal + travelInsurance!.price, 48_300_000);
  assert.equal(CANADA_ROCKIES_ROOM_PRICES.twin + mandatoryTotal + travelInsurance!.price, 50_300_000);
});

test("catalog route reconciles nine Canada days plus two journey days", () => {
  assert.deepEqual(
    CANADA_ROCKIES_TOUR.itinerary.map((day) => day.day),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  );
  assert.equal(CANADA_ROCKIES_TOUR.itinerary.length, 11);
  assert.match(CANADA_ROCKIES_TOUR.duration, /11 Hari/i);
  assert.match(CANADA_ROCKIES_TOUR.duration, /8 Malam Hotel/i);
});

test("catalog promises eight nights in three-star hotels with daily breakfast", () => {
  assert.match(
    CANADA_ROCKIES_TOUR.inclusions.join(" "),
    /delapan malam hotel bintang 3.*sarapan harian/i,
  );
  assert.match(CANADA_ROCKIES_TOUR.hotel["Standar akomodasi"], /bintang 3/i);
  assert.match(CANADA_ROCKIES_TOUR.hotel["Fasilitas makan"], /sarapan harian termasuk/i);
  assert.doesNotMatch(CANADA_ROCKIES_TOUR.exclusions.join(" "), /sarapan/i);
  assert.match(CANADA_ROCKIES_TOUR.exclusions.join(" "), /makan siang dan makan malam/i);
});

test("catalog avoids closed-attraction promises", () => {
  assert.doesNotMatch(
    CANADA_ROCKIES_TOUR.itinerary.map((day) => `${day.title} ${day.description}`).join(" "),
    /Ice Explorer|Skywalk|Spiral Tunnels Viewpoint/i,
  );
});

test("pre-registration cannot expose an automatic payment plan", () => {
  assert.equal(CANADA_ROCKIES_TOUR.paymentPlan.mode, "hidden");
  assert.equal(CANADA_ROCKIES_TOUR.status, "DRAFT");
  assert.match(CANADA_ROCKIES_TOUR.notes, /mengumpulkan peserta.*membentuk grup/i);
  assert.match(CANADA_ROCKIES_TOUR.notes, /invoice resmi/i);
  assert.doesNotMatch(CANADA_ROCKIES_TOUR.notes, /ferry|park fee|driver|Bow Lake|Ice Explorer/i);
});
