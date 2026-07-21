import assert from "node:assert/strict";
import test from "node:test";
import {
  comparePublicTourCatalogOrder,
  getPublicTourState,
  isDoneTour,
} from "../lib/tour-order";
import { isPublicTourVisible } from "../lib/public-tours";

const NOW = new Date("2026-07-21T10:00:00.000Z");

test("classifies public tour availability from status and departure date", () => {
  assert.equal(getPublicTourState({ status: "ACTIVE", tripDate: null }, NOW), "flexible");
  assert.equal(getPublicTourState({ status: "ACTIVE", tripDate: "2026-09-04" }, NOW), "bookable");
  assert.equal(getPublicTourState({ status: "FULL", tripDate: "2026-09-04" }, NOW), "sold");
  assert.equal(getPublicTourState({ status: "ACTIVE", tripDate: "2026-02-07" }, NOW), "completed");
});

test("treats sold and completed tours as documentation", () => {
  assert.equal(isDoneTour({ status: "FULL", tripDate: "2026-09-04" }, NOW), true);
  assert.equal(isDoneTour({ status: "ACTIVE", tripDate: "2026-02-07" }, NOW), true);
  assert.equal(isDoneTour({ status: "ACTIVE", tripDate: "2026-09-04" }, NOW), false);
});

test("orders bookable tours before documentation", () => {
  const upcoming = { title: "Upcoming", status: "ACTIVE", tripDate: "2026-09-04" };
  const sold = { title: "Sold", status: "FULL", tripDate: "2026-10-04" };
  const completed = { title: "Completed", status: "ACTIVE", tripDate: "2026-02-07" };

  const ordered = [sold, completed, upcoming].sort((a, b) =>
    comparePublicTourCatalogOrder(a, b, NOW),
  );

  assert.deepEqual(ordered.map((tour) => tour.title), ["Upcoming", "Sold", "Completed"]);
});

test("keeps only the two legacy live drafts publicly visible", () => {
  assert.equal(isPublicTourVisible({ status: "DRAFT", slug: "russia-aurora" }), true);
  assert.equal(isPublicTourVisible({ status: "DRAFT", slug: "central-asia-4-tan" }), true);
  assert.equal(isPublicTourVisible({ status: "DRAFT", slug: "unpublished-draft" }), false);
  assert.equal(isPublicTourVisible({ status: "CANCELLED", slug: "russia-cancelled" }), false);
});
