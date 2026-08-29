import assert from "node:assert/strict";
import test from "node:test";
import { localizePdfText } from "../lib/itinerary-pdf-localization";
import { normalizeTourServiceTerms } from "../lib/tour-service-terms";
import { normalizeItineraryDisplayTitle, normalizeTourDisplayTitle } from "../lib/tour-display";

test("normalizes an all-lowercase imported tour title", () => {
  assert.equal(
    normalizeTourDisplayTitle("musim dingin hokkaido + tokyo"),
    "Musim Dingin Hokkaido + Tokyo",
  );
});

test("keeps Indonesian connector words lowercase", () => {
  assert.equal(
    normalizeTourDisplayTitle("vietnam dari utara ke selatan"),
    "Vietnam dari Utara ke Selatan",
  );
});

test("preserves intentional mixed case and product acronyms", () => {
  assert.equal(
    normalizeTourDisplayTitle("Asia Tengah 4-TAN"),
    "Asia Tengah 4-TAN",
  );
});

test("removes a duplicated itinerary date with inconsistent punctuation", () => {
  assert.equal(
    normalizeItineraryDisplayTitle("4 September 2026): Jakarta – Almaty | Gerbang ke Asia Tengah"),
    "Jakarta – Almaty | Gerbang ke Asia Tengah",
  );
  assert.equal(
    normalizeItineraryDisplayTitle("(6 September 2026): Tur Kota Almaty – Kirgistan"),
    "Tur Kota Almaty – Kirgistan",
  );
});

test("removes a redundant day prefix", () => {
  assert.equal(normalizeItineraryDisplayTitle("Hari ke-3: Eksplorasi kota"), "Eksplorasi kota");
});

test("localizes mixed imported Vietnam itinerary phrasing", () => {
  assert.equal(localizePdfText("Sarapan at Hotel"), "Sarapan di hotel");
  assert.equal(
    localizePdfText("At 05:00 PM, transfer from Sapa ke Hanoi by shared limousine."),
    "Pukul 17.00, transfer dari Sapa ke Hanoi dengan shared limousine.",
  );
  assert.equal(
    localizePdfText("Begin your exploration of Hanoi dengan a relaxing one-hour cyclo ride through the charming Hanoi Old Quarter."),
    "Mulai eksplorasi Hanoi dengan cyclo ride santai selama satu jam melalui Hanoi Old Quarter.",
  );
});

test("keeps Tour Leader and Driver as the public service terms", () => {
  assert.equal(
    normalizeTourServiceTerms("Tips pemimpin tur & pengemudi"),
    "Tips Tour Leader & Driver",
  );
  assert.equal(
    normalizeTourServiceTerms("Tips pemimpin tur dan pengemudi"),
    "Tips Tour Leader & Driver",
  );
  assert.equal(
    normalizeTourServiceTerms("Tips Tour leader & driver"),
    "Tips Tour Leader & Driver",
  );
  assert.equal(
    localizePdfText("Tips Tour Leader & driver + city tax"),
    "Tips Tour Leader & Driver + city tax",
  );
  assert.equal(
    localizePdfText("Tips pemimpin tur & pengemudi"),
    "Tips Tour Leader & Driver",
  );
});
