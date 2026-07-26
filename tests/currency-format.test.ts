import assert from "node:assert/strict";
import test from "node:test";
import { formatCurrency } from "../lib/utils";

test("formats customer-facing prices as whole Indonesian rupiah", () => {
  const formatted = formatCurrency(33_400_000).replace(/\s+/g, " ");
  assert.match(formatted, /^Rp\s?33\.400\.000$/);
  assert.doesNotMatch(formatted, /,\d{2}$/);
});
