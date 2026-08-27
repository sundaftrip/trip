import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeEnglishTranslation,
  REVIEWED_ENGLISH_COPY,
  reviewedEnglishFor,
} from "../lib/reviewed-english-copy";

test("uses the approved travel and visa terminology", () => {
  assert.equal(reviewedEnglishFor("Kelayakan"), "Requirements");
  assert.equal(reviewedEnglishFor("Syarat Kelayakan"), "Application Requirements");
  assert.equal(reviewedEnglishFor("Pemimpin tur & pengemudi"), "Tour leader & driver");
  assert.equal(reviewedEnglishFor("Pemandu wisata"), "Local guide");
});

test("keeps shared English copy free from the rejected house style", () => {
  const values = Object.values(REVIEWED_ENGLISH_COPY);
  const combined = values.join("\n");

  assert.ok(values.length >= 100);
  assert.doesNotMatch(combined, /[—–]/u);
  assert.doesNotMatch(
    combined,
    /\b(curated|crafted|seamless|unforgettable|immersive|world-class|unlock|elevate|embark)\b/i,
  );
  values.forEach((value) => assert.equal(value, value.trim()));
});

test("ships reviewed copy for the shared shell and homepage", () => {
  assert.equal(reviewedEnglishFor("Destinasi"), "Destinations");
  assert.equal(reviewedEnglishFor("JELAJAHI SUNDAF"), "SEARCH SUNDAF");
  assert.equal(
    reviewedEnglishFor("Pergi jauh. Pulang bawa cerita yang berbeda."),
    "Go far. Come home with a different story.",
  );
});

test("removes long dashes from cached and generated English copy", () => {
  assert.equal(normalizeEnglishTranslation("14–23 January 2027"), "14 to 23 January 2027");
  assert.equal(normalizeEnglishTranslation("Visa—subject to approval"), "Visa, subject to approval");
});
