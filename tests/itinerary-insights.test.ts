import assert from "node:assert/strict";
import test from "node:test";
import { buildItineraryDisplay } from "../lib/itinerary-insights";

test("preserves optional itinerary day image for public highlight cards", () => {
  const day = buildItineraryDisplay({
    day: 3,
    title: "Metro tour",
    description: "Red Square dan Arbat.",
    image: " https://res.cloudinary.com/demo/image/upload/day-3.jpg ",
  });

  assert.equal(day.image, "https://res.cloudinary.com/demo/image/upload/day-3.jpg");
});

test("omits blank itinerary day image", () => {
  const day = buildItineraryDisplay({
    day: 1,
    title: "Penerbangan ke Moskow",
    description: "Berangkat dari Jakarta.",
    image: "   ",
  });

  assert.equal(day.image, undefined);
});
