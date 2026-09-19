// Run after a preview-mode build to check the actual deployment file trace.
// This intentionally checks emitted artifacts rather than matching config text.
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const tracePath = path.join(root, ".next/server/app/(website)/tours/[id]/pdf/route.js.nft.json");
const trace = JSON.parse(await readFile(tracePath, "utf8"));
const tracedFiles = new Set(trace.files.map((file) => path.resolve(path.dirname(tracePath), file)));
const requiredPublicFiles = [
  "public/logo.png",
  "public/vietnam/assets/logo-dark.png",
  "public/vietnam/assets/hero-sapa.jpg",
  "public/vietnam/assets/hanoi-street.jpg",
  "public/vietnam/assets/halong-sunset.jpg",
  "public/trip-photos/trip-1.jpg",
  "public/trip-photos/trip-2.jpg",
  "public/trip-photos/trip-3.jpg",
  "public/trip-photos/trip-4.jpg",
  "public/trip-photos/trip-5.jpg",
  "public/trip-photos/trip-6.jpg",
  "public/trip-photos/cp-1.jpg",
  "public/trip-photos/cp-2.jpg",
];
const requiredPublicPaths = new Set(requiredPublicFiles.map((file) => path.join(root, file)));
const tracedPublicPaths = [...tracedFiles].filter((file) =>
  file.startsWith(`${path.join(root, "public")}${path.sep}`),
);

for (const file of requiredPublicFiles) {
  assert.ok(tracedFiles.has(path.join(root, file)), `Required PDF fallback is missing: ${file}`);
}
assert.deepEqual(
  tracedPublicPaths.sort(),
  [...requiredPublicPaths].sort(),
  "PDF function must not bundle public assets outside its explicit fallback allowlist",
);

let traceBytes = 0;
for (const file of tracedFiles) traceBytes += (await stat(file)).size;
assert.ok(traceBytes < 5 * 1024 * 1024, `PDF function trace grew beyond 5 MiB: ${traceBytes} bytes`);
console.log(JSON.stringify({ requiredPublicFiles: requiredPublicFiles.length, traceBytes }, null, 2));
