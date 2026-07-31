import assert from "node:assert/strict";
import test from "node:test";

import { serializeJsonLd } from "../lib/safe-json-ld";

test("serializes JSON-LD while escaping script-breaking characters", () => {
  const serialized = serializeJsonLd({
    payload: "</script><script>alert('xss')</script> & >",
  });

  assert.equal(
    serialized,
    '{"payload":"\\u003c/script\\u003e\\u003cscript\\u003ealert(\'xss\')\\u003c/script\\u003e \\u0026 \\u003e"}',
  );
  assert.equal(serialized.includes("<"), false);
  assert.equal(serialized.includes(">"), false);
  assert.equal(serialized.includes("&"), false);
});

test("escapes JavaScript line and paragraph separators", () => {
  const serialized = serializeJsonLd({ text: "before\u2028middle\u2029after" });

  assert.equal(serialized, '{"text":"before\\u2028middle\\u2029after"}');
  assert.equal(serialized.includes("\u2028"), false);
  assert.equal(serialized.includes("\u2029"), false);
});

test("preserves valid JSON values", () => {
  const value = {
    "@context": "https://schema.org",
    active: true,
    count: 3,
    optional: null,
    nested: ["one", "two"],
  };

  assert.deepEqual(JSON.parse(serializeJsonLd(value)), value);
});

test("rejects values that JSON.stringify cannot serialize", () => {
  assert.throws(
    () => serializeJsonLd(undefined),
    new TypeError("JSON-LD value must be JSON-serializable."),
  );
});
