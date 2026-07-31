import assert from "node:assert/strict";
import test from "node:test";

import { shouldResetScrollForNavigation } from "../lib/navigation-scroll";

const current = "https://sundaftrip.com/tours/vietnam#ulasan";

test("resets scroll for internal navigation to another page", () => {
  assert.equal(shouldResetScrollForNavigation(current, "/visa"), true);
  assert.equal(shouldResetScrollForNavigation(current, "/tours/jepang#harga-tanggal"), true);
});

test("preserves scroll for same-page tabs and catalog filters", () => {
  assert.equal(shouldResetScrollForNavigation(current, "#itinerary"), false);
  assert.equal(shouldResetScrollForNavigation(current, "/tours/vietnam?bulan=oktober"), false);
  assert.equal(shouldResetScrollForNavigation(current, "/tours/vietnam/"), false);
});

test("ignores external and non-web navigation", () => {
  assert.equal(shouldResetScrollForNavigation(current, "https://example.com/visa"), false);
  assert.equal(shouldResetScrollForNavigation(current, "mailto:halo@sundaftrip.com"), false);
  assert.equal(shouldResetScrollForNavigation(current, "http://["), false);
});
