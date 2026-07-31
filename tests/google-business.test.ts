import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGoogleBusinessUrl } from "../lib/google-business";

test("normalizes supported Google Business and Maps share links", () => {
  assert.equal(
    normalizeGoogleBusinessUrl("maps.app.goo.gl/AbCd123"),
    "https://maps.app.goo.gl/AbCd123",
  );
  assert.equal(
    normalizeGoogleBusinessUrl("http://www.google.com/maps/place/Sundaf+Trip"),
    "https://www.google.com/maps/place/Sundaf+Trip",
  );
  assert.equal(
    normalizeGoogleBusinessUrl("https://g.page/r/example"),
    "https://g.page/r/example",
  );
});

test("rejects blank, malformed, and non-Google links", () => {
  assert.equal(normalizeGoogleBusinessUrl(""), undefined);
  assert.equal(normalizeGoogleBusinessUrl("https://example.com/sundaf-trip"), undefined);
  assert.equal(normalizeGoogleBusinessUrl("https://business.google.com/locations"), undefined);
  assert.equal(normalizeGoogleBusinessUrl("https://www.google.com/drive/"), undefined);
  assert.equal(normalizeGoogleBusinessUrl("not a url"), undefined);
});
