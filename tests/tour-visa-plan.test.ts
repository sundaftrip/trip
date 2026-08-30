import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTourVisaPlan, packTourItinerary, readTourItinerary, readTourVisaPlan, type TourVisaPlan } from "../lib/tour-visa-plan";

const days = [{ day: 1, title: "Lima", description: "Arrival", image: "/lima.jpg" }];
const plan: TourVisaPlan = { version: 1, passportCountry: "ID", passportType: "ordinary", purpose: "tourism", destinations: [{ countryId: "peru", stayDays: 3, kind: "visit", service: "offer" }] };

test("reads legacy day arrays and packs them without changing their storage shape", () => {
  assert.deepEqual(readTourItinerary(days), days);
  assert.deepEqual(packTourItinerary(days, null), days);
  assert.equal(readTourVisaPlan(days), null);
});

test("stores and reads itinerary and visa plan in a versioned envelope", () => {
  const packed = packTourItinerary(days, plan);
  assert.deepEqual(packed, { version: 2, days, visaPlan: plan });
  assert.deepEqual(readTourItinerary(packed), days);
  assert.deepEqual(readTourVisaPlan(packed), plan);
});

test("malformed itinerary input is safe and does not mutate source records", () => {
  assert.deepEqual(readTourItinerary(null), []);
  assert.deepEqual(readTourItinerary({ version: 3, days }), []);
  assert.deepEqual(readTourItinerary([null, { day: "one" }, ...days]), days);
  assert.equal(readTourVisaPlan({ version: 2, days, visaPlan: {} }), null);
  assert.deepEqual(days, [{ day: 1, title: "Lima", description: "Arrival", image: "/lima.jpg" }]);
});

test("empty plans remain explicit null, and normalization trims identifiers", () => {
  assert.deepEqual(normalizeTourVisaPlan(undefined), { ok: true, value: null });
  assert.deepEqual(normalizeTourVisaPlan(null), { ok: true, value: null });
  const result = normalizeTourVisaPlan({ ...plan, destinations: [{ ...plan.destinations[0], countryId: " peru ", variantId: "  sticker  " }] });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value?.destinations[0], { countryId: "peru", stayDays: 3, kind: "visit", service: "offer", variantId: "sticker" });
});

test("rejects unsupported profiles and incomplete or unsafe plans", () => {
  for (const value of [
    [], {}, "plan", { ...plan, version: 2 }, { ...plan, passportCountry: "US" },
    { ...plan, passportType: "diplomatic" }, { ...plan, purpose: "work" },
    { ...plan, destinations: [] }, { ...plan, destinations: [null] },
    { ...plan, destinations: [{ ...plan.destinations[0], countryId: "" }] },
    { ...plan, destinations: [{ ...plan.destinations[0], stayDays: -1 }] },
    { ...plan, destinations: [{ ...plan.destinations[0], stayDays: 0 }] },
    { ...plan, destinations: [{ ...plan.destinations[0], stayDays: 1.5 }] },
    { ...plan, destinations: [{ ...plan.destinations[0], stayDays: 366 }] },
    { ...plan, destinations: [{ ...plan.destinations[0], kind: "stop" }] },
    { ...plan, destinations: [{ ...plan.destinations[0], service: "free" }] },
    { ...plan, review: { at: "yesterday", fingerprint: "abc" } },
    { ...plan, review: { at: "2026-08-31T00:00:00.000Z", fingerprint: "" } },
  ]) assert.equal(normalizeTourVisaPlan(value).ok, false, JSON.stringify(value));
});

test("supports zero-day transit, repeat visits and an explicit review stamp", () => {
  const value = { ...plan, destinations: [...plan.destinations, { countryId: "us", stayDays: 0, kind: "transit", service: "separate" }, ...plan.destinations], review: { at: "2026-08-31T00:00:00.000Z", fingerprint: "abc" } };
  assert.deepEqual(normalizeTourVisaPlan(value), { ok: true, value });
});

test("invalid optional day images cannot escape the typed reader", () => {
  assert.deepEqual(readTourItinerary([{ ...days[0], image: 42 }]), [{ day: 1, title: "Lima", description: "Arrival" }]);
  assert.throws(() => packTourItinerary(days, { ...plan, destinations: [] }), /negara/);
});
