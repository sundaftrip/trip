import assert from "node:assert/strict";
import test from "node:test";
import { canonicalTourPath, isSubstantialArchivedTour } from "../lib/seo-routes";

const NOW = new Date("2026-07-26T00:00:00.000Z");

test("keeps the current slug as the canonical tour path", () => {
  assert.equal(canonicalTourPath({ id: "abc", slug: "russia-aurora" }), "/tours/russia-aurora");
  assert.equal(canonicalTourPath({ id: "abc", slug: null }), "/tours/abc");
});

test("keeps future and flexible tours indexable", () => {
  assert.equal(isSubstantialArchivedTour({ tripDate: "2026-09-04" }, NOW), true);
  assert.equal(isSubstantialArchivedTour({ tripDate: null }, NOW), true);
});

test("noindexes thin archives while preserving documented past trips", () => {
  assert.equal(isSubstantialArchivedTour({
    tripDate: "2019-01-01",
    description: "Ringkasan singkat.",
    gallery: [],
    itinerary: [],
    inclusions: [],
  }, NOW), false);

  assert.equal(isSubstantialArchivedTour({
    tripDate: "2025-01-01",
    description: "Dokumentasi perjalanan ".repeat(20),
    gallery: ["1", "2", "3"],
    itinerary: [],
    inclusions: [],
  }, NOW), true);
});
