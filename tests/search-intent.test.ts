import assert from "node:assert/strict";
import test from "node:test";
import { expandedSearchTerms, resolveSearchIntent } from "../lib/search-intent";

test("maps Indonesian and English country aliases to the same intent", () => {
  assert.deepEqual(resolveSearchIntent("kanada"), resolveSearchIntent("Canada"));
  assert.deepEqual(resolveSearchIntent("rusia"), resolveSearchIntent("Russia"));
});

test("maps Astana to Kazakhstan tour and visa search terms", () => {
  const intent = resolveSearchIntent("astana");
  assert.equal(intent?.countryLabel, "Kazakhstan");
  assert.equal(intent?.tourHref, "/tours?destination=asia-tengah");
  assert.deepEqual(intent?.countryTerms, ["Kazakhstan", "Kazakstan"]);
});

test("recognizes aliases inside natural-language queries", () => {
  assert.equal(resolveSearchIntent("info visa untuk Russia")?.countryLabel, "Rusia");
  assert.equal(resolveSearchIntent("tour keluarga ke Vancouver")?.countryLabel, "Kanada");
});

test("expands city searches without dropping the original query", () => {
  assert.deepEqual(expandedSearchTerms("Astana"), ["Astana", "Kazakhstan", "Kazakstan"]);
});
