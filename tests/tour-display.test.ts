import assert from "node:assert/strict";
import test from "node:test";
import { localizePdfText } from "../lib/itinerary-pdf-localization";
import { normalizeItineraryDisplayTitle, normalizeTourDisplayTitle, replaceEditorialDashes } from "../lib/tour-display";

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

test("replaces editorial dashes without changing structural hyphens", () => {
  assert.equal(
    replaceEditorialDashes("Hanoi – Ninh Binh — Hoa Lu - Tam Coc"),
    "Hanoi, Ninh Binh, Hoa Lu, Tam Coc",
  );
  assert.equal(replaceEditorialDashes("Asia Tengah 4-TAN"), "Asia Tengah 4-TAN");
  assert.equal(
    replaceEditorialDashes("Hanoi – Ninh Binh", " · "),
    "Hanoi · Ninh Binh",
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
