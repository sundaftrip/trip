import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ABOUT_GALLERY_IMAGES,
  B2B_GALLERY_IMAGES,
} from "../lib/static-gallery-manifests";

const aboutSource = readFileSync(
  new URL("../app/(website)/about/page.tsx", import.meta.url),
  "utf8",
);
const b2bSource = readFileSync(
  new URL("../lib/b2bGallery.ts", import.meta.url),
  "utf8",
);
const pdfRouteSource = readFileSync(
  new URL("../app/(website)/tours/[id]/pdf/route.ts", import.meta.url),
  "utf8",
);

test("marketing galleries use static URL manifests instead of runtime directory scans", () => {
  assert.equal(ABOUT_GALLERY_IMAGES.length, 24);
  assert.equal(ABOUT_GALLERY_IMAGES[0], "/about-gallery-md/01-aurora.webp");
  assert.equal(ABOUT_GALLERY_IMAGES.at(-1), "/about-gallery-md/24-aurora.webp");
  assert.equal(B2B_GALLERY_IMAGES.length, 30);
  assert.equal(B2B_GALLERY_IMAGES[0], "/b2b-gallery/b2b-01.webp");
  assert.equal(B2B_GALLERY_IMAGES.at(-1), "/b2b-gallery/b2b-30.webp");
  assert.doesNotMatch(aboutSource, /node:fs|readdirSync|existsSync/);
  assert.doesNotMatch(b2bSource, /node:fs|readdirSync|existsSync/);
});

test("PDF route does not resolve arbitrary paths under public", () => {
  assert.match(pdfRouteSource, /const LOCAL_PDF_IMAGES = new Map/);
  assert.match(pdfRouteSource, /LOCAL_PDF_IMAGES\.get\(src\)/);
  assert.doesNotMatch(pdfRouteSource, /realpath|requestedPath|src\.replace\(\/\^\\\/\+\//);
});
