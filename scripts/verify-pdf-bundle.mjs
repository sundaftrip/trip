// Run after a preview-mode build to check the actual deployment file trace.
// This intentionally checks emitted artifacts rather than matching config text.
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const tracePath = path.join(root, ".next/server/app/(website)/tours/[id]/pdf/route.js.nft.json");
const trace = JSON.parse(await readFile(tracePath, "utf8"));
const tracedFiles = new Set(trace.files.map((file) => path.resolve(path.dirname(tracePath), file)));
const supportedExtensions = new Set([".jpg", ".jpeg", ".png"]);
const excludedExtensions = new Set([
  ".webp", ".avif", ".gif", ".svg", ".ico", ".pdf", ".css", ".js",
  ".html", ".txt", ".woff", ".woff2", ".mp4",
]);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  }));
  return groups.flat();
}

let retainedImages = 0;
let retainedImageBytes = 0;
let excludedAssets = 0;
let excludedAssetBytes = 0;
for (const file of await filesUnder(path.join(root, "public"))) {
  const extension = path.extname(file).toLowerCase();
  const relative = path.relative(root, file);
  if (supportedExtensions.has(extension)) {
    assert.ok(tracedFiles.has(file), `PDF-compatible image is missing from the trace: ${relative}`);
    retainedImages += 1;
    retainedImageBytes += (await stat(file)).size;
  } else if (excludedExtensions.has(extension)) {
    assert.ok(!tracedFiles.has(file), `Unsupported public asset is still bundled: ${relative}`);
    excludedAssets += 1;
    excludedAssetBytes += (await stat(file)).size;
  }
}

assert.ok(retainedImages > 0, "No PDF-compatible image fixtures were checked");
assert.ok(excludedAssets > 0, "No unsupported public asset fixtures were checked");
for (const file of ["public/logo.png", "public/vietnam/assets/logo-dark.png", "public/trip-photos/trip-1.jpg"]) {
  assert.ok(tracedFiles.has(path.join(root, file)), `Required PDF fallback is missing: ${file}`);
}

let traceBytes = 0;
for (const file of tracedFiles) traceBytes += (await stat(file)).size;
console.log(JSON.stringify({ retainedImages, retainedImageBytes, excludedAssets, excludedAssetBytes, traceBytes }, null, 2));
