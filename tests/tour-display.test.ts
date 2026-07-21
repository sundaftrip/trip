import assert from "node:assert/strict";
import test from "node:test";
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
