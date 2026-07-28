import assert from "node:assert/strict";
import test from "node:test";
import { selectTourExperienceHighlights } from "../lib/tour-experience-highlights";

test("keeps a CMS-selected itinerary highlight after the default six cards", () => {
  const itinerary = Array.from({ length: 9 }, (_, index) => ({
    day: index + 1,
    image: index === 7 ? "https://images.unsplash.com/photo-1485827329522-c625acce0067" : undefined,
  }));

  assert.deepEqual(
    selectTourExperienceHighlights(itinerary).map((item) => item.day),
    [1, 2, 3, 4, 5, 6, 8],
  );
});

test("does not duplicate a highlighted day already in the default rail", () => {
  const itinerary = Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    image: index === 2 || index === 6 ? "https://images.unsplash.com/photo-example" : undefined,
  }));

  assert.deepEqual(
    selectTourExperienceHighlights(itinerary).map((item) => item.day),
    [1, 2, 3, 4, 5, 6, 7],
  );
});
