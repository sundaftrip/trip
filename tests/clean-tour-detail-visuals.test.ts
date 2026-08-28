import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/website/clean/CleanTourDetail.tsx", import.meta.url),
  "utf8",
);
const bookingSource = readFileSync(
  new URL("../components/website/clean/TourBookingExperience.tsx", import.meta.url),
  "utf8",
);

test("shows visual highlights for every itinerary day", () => {
  assert.match(source, /const experienceItems = itinerary\.map\(/);
  assert.doesNotMatch(source, /const experienceItems = itinerary\.slice\(/);
});

test("renders the resolved image inside every itinerary day", () => {
  assert.match(source, /const dayImage = resolveItineraryDayImage\(item, index, heroImages\)/);
  assert.match(source, /className=\{styles\.detailDayImage\}/);
  assert.match(source, /Gambaran perjalanan Hari \$\{item\.day\}: \$\{dayTitle\}/);
});

test("does not repeat the hero gallery before the itinerary", () => {
  assert.doesNotMatch(source, /GalleryZoom/);
  assert.doesNotMatch(source, /id="galeri"/);
  assert.doesNotMatch(source, /Dokumentasi &amp; gambaran perjalanan/);
  assert.match(
    source,
    /completedTourHref=\{itinerary\.length > 0 \? "#itinerary" : "#ringkasan"\}/,
  );
  assert.doesNotMatch(bookingSource, /Lihat dokumentasi/);
  assert.match(bookingSource, /Lihat itinerary perjalanan/);
});
