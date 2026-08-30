import assert from "node:assert/strict";
import test from "node:test";
import { prepareTourVisaWrite } from "../lib/tour-visa-publishing";
import { readTourItinerary, readTourVisaPlan } from "../lib/tour-visa-plan";
import type { TourVisaPlan } from "../lib/tour-visa-plan";
import { assessTourVisas } from "../lib/tour-visa-assessment";

const now = new Date("2026-08-31T12:00:00Z");
const days = [{ day: 1, title: "Lima", description: "Program perjalanan" }];
const records = [{ id: "pe", name: "Peru", en: "Peru", visa: "wajib", stay: "30 hari", sourceUrl: "https://example.gov/visa", lastVerifiedAt: "2026-08-30", servicePrice: "Rp 1.000.000", variants: [] }];
const plan = { version: 1, passportCountry: "ID", passportType: "ordinary", purpose: "tourism", destinations: [{ countryId: "pe", stayDays: 5, kind: "visit", service: "offer" }] };
const draft = { country: "Peru", title: "Latin America", status: "DRAFT", itinerary: days, inclusions: [], addOns: [] };
const confirmation = { visaReviewConfirmed: true, visaReviewFingerprint: assessTourVisas({ plan: plan as TourVisaPlan, country: draft.country, inclusions: [], addOns: [] }, records, now).fingerprint };

test("new public catalog cannot bypass structured visa review", () => {
  const result = prepareTourVisaWrite({ ...draft, status: "ACTIVE" }, null, records, now);
  assert.equal(result.ok, false);
});

test("draft saves incomplete routes without pretending they are reviewed", () => {
  const result = prepareTourVisaWrite(draft, null, records, now);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(readTourItinerary(result.itinerary), days);
});

test("publishing requires acknowledgment and server-stamps the matching assessment", () => {
  assert.equal(prepareTourVisaWrite({ ...draft, status: "ACTIVE", visaPlan: plan }, null, records, now).ok, false);
  const result = prepareTourVisaWrite({ ...draft, status: "ACTIVE", visaPlan: plan, ...confirmation }, null, records, now);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(readTourVisaPlan(result.itinerary)?.review?.at, now.toISOString());
    assert.deepEqual(readTourItinerary(result.itinerary), days);
  }
});

test("forged review supplied by a client does not authorize first publication", () => {
  const result = prepareTourVisaWrite({ ...draft, status: "ACTIVE", visaPlan: { ...plan, review: { at: now.toISOString(), fingerprint: "forged" } } }, null, records, now);
  assert.equal(result.ok, false);
});

test("unknown country or stale rules cannot be acknowledged into publishable facts", () => {
  for (const data of [[], [{ ...records[0], lastVerifiedAt: "2020-01-01" }]]) {
    assert.equal(prepareTourVisaWrite({ ...draft, status: "ACTIVE", visaPlan: plan, ...confirmation }, null, data, now).ok, false);
  }
});

test("legacy live catalog allows unrelated edits but requires plan when route changes", () => {
  const existing = { ...draft, status: "ACTIVE" };
  assert.equal(prepareTourVisaWrite({ price: 100 }, existing, records, now).ok, true);
  assert.equal(prepareTourVisaWrite({ country: "Vietnam" }, existing, records, now).ok, false);
  assert.equal(prepareTourVisaWrite({ status: "DRAFT" }, existing, records, now).ok, true);
});

test("editing itinerary days preserves saved plan and cannot trust a forged envelope review", () => {
  const first = prepareTourVisaWrite({ ...draft, status: "ACTIVE", visaPlan: plan, ...confirmation }, null, records, now);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const existing = { ...draft, status: "ACTIVE", itinerary: first.itinerary };
  const updatedDays = [{ ...days[0], description: "Updated program" }];
  const result = prepareTourVisaWrite({ itinerary: updatedDays }, existing, records, now);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(readTourItinerary(result.itinerary), updatedDays);
    assert.deepEqual(readTourVisaPlan(result.itinerary), readTourVisaPlan(first.itinerary));
  }
  assert.equal(prepareTourVisaWrite({ visaPlan: null }, existing, records, now).ok, false);
});

test("rule changes invalidate an old review at publication", () => {
  const first = prepareTourVisaWrite({ ...draft, status: "ACTIVE", visaPlan: plan, ...confirmation }, null, records, now);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const existing = { ...draft, itinerary: first.itinerary };
  assert.equal(prepareTourVisaWrite({ status: "ACTIVE" }, existing, [{ ...records[0], servicePrice: "Rp 2.000.000" }], now).ok, false);
});

test("malformed non-array itinerary is rejected instead of erasing days", () => {
  assert.equal(prepareTourVisaWrite({ ...draft, itinerary: { unexpected: true } }, null, records, now).ok, false);
});

test("unchanged full admin payload does not make nullable legacy fields into route edits", () => {
  const existing = { ...draft, status: "ACTIVE", duration: null, addOns: null, tripDate: new Date("2027-04-15T00:00:00Z") };
  const body = { ...existing, price: 200, duration: "", addOns: [], tripDate: "2027-04-15T00:00:00.000Z", visaPlan: null };
  assert.equal(prepareTourVisaWrite(body, existing, records, now).ok, true);
});

test("a stale browser confirmation cannot acknowledge changed visa data", () => {
  const result = prepareTourVisaWrite({ ...draft, status: "ACTIVE", visaPlan: plan, ...confirmation }, null, [{ ...records[0], servicePrice: "Rp 2.000.000" }], now);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /berubah/);
});
