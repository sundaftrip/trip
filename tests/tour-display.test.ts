import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTourDisplayTitle } from "../lib/tour-display";

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

