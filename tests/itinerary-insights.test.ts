import assert from "node:assert/strict";
import test from "node:test";
import {
  buildItineraryDisplay,
  resolveItineraryDayImage,
} from "../lib/itinerary-insights";

test("preserves optional itinerary day image for public highlight cards", () => {
  const day = buildItineraryDisplay({
    day: 3,
    title: "Metro tour",
    description: "Red Square dan Arbat.",
    image: " https://res.cloudinary.com/demo/image/upload/day-3.jpg ",
  });

  assert.equal(day.image, "https://res.cloudinary.com/demo/image/upload/day-3.jpg");
  assert.equal(
    resolveItineraryDayImage(day, 2, ["/gallery/one.webp", "/gallery/two.webp"]),
    day.image,
  );
});

test("omits blank itinerary day image", () => {
  const day = buildItineraryDisplay({
    day: 1,
    title: "Penerbangan ke Moskow",
    description: "Berangkat dari Jakarta.",
    image: "   ",
  });

  assert.equal(day.image, undefined);
  assert.equal(
    resolveItineraryDayImage(day, 3, ["/gallery/one.webp", "/gallery/two.webp"]),
    "/gallery/two.webp",
  );
});

test("uses a safe local image when neither a day image nor tour gallery exists", () => {
  assert.equal(
    resolveItineraryDayImage({}, 0, []),
    "/about-gallery-md/01-aurora.webp",
  );
});
