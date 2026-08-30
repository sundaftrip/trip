import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { CMS_CONTENT_MAP } from "../lib/cms-content-map";

test("every advertised CMS editor route exists", () => {
  for (const row of CMS_CONTENT_MAP) {
    for (const control of row.controls) assert.ok(existsSync(new URL(`../app${control.href}/page.tsx`, import.meta.url)), control.href);
  }
});

test("static pages have honest limitations and no false editor action", () => {
  for (const publicPath of ["/custom-trip", "/destinations", "/jasa-urus-visa-terpercaya"]) {
    const row = CMS_CONTENT_MAP.find((item) => item.publicPath === publicPath);
    assert.ok(row);
    assert.deepEqual(row.controls, []);
    assert.match(row.note, /statis/);
  }
  assert.match(CMS_CONTENT_MAP.find((item) => item.publicPath === "/faq")!.note, /Gunakan FAQ CMS/);
});
