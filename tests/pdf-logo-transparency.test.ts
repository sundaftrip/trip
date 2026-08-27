import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routeSource = readFileSync(
  new URL("../app/(website)/tours/[id]/pdf/route.ts", import.meta.url),
  "utf8",
);

test("uses a paper-matched colored PDF logo on light pages", () => {
  assert.match(
    routeSource,
    /preserveTransparency[\s\S]*?w_1400,c_fit,q_auto:best,f_png/,
  );
  assert.match(
    routeSource,
    /resolveImage\("\/logo-pdf-paper\.png"\)/,
  );
});

test("keeps the white PDF logo transparent on dark pages", () => {
  assert.match(
    routeSource,
    /toPdfImageSrc\("\/vietnam\/assets\/logo-dark\.png", \{ preserveTransparency: true \}\)/,
  );
});
