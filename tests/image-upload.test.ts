import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_UPLOAD_FOLDERS,
  ImageUploadValidationError,
  detectImageMimeType,
  parseStrictImageDataUrl,
  readBoundedRequestBody,
  resolveAdminUploadFolder,
  toImageDataUrl,
  validateImageBytes,
} from "../lib/image-upload";

const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46,
  0x08, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x58,
]);

function hasStatus(status: number) {
  return (error: unknown) =>
    error instanceof ImageUploadValidationError && error.status === status;
}

test("detects only the supported JPEG, PNG, and WebP signatures", () => {
  assert.equal(detectImageMimeType(JPEG), "image/jpeg");
  assert.equal(detectImageMimeType(PNG), "image/png");
  assert.equal(detectImageMimeType(WEBP), "image/webp");
  assert.equal(detectImageMimeType(Uint8Array.from([0x47, 0x49, 0x46, 0x38])), null);
});

test("validates declared MIME against file bytes and enforces decoded size", () => {
  assert.equal(validateImageBytes(JPEG, "image/jpeg", JPEG.byteLength).mimeType, "image/jpeg");
  assert.throws(() => validateImageBytes(JPEG, "image/png", 100), hasStatus(400));
  assert.throws(() => validateImageBytes(JPEG, "image/gif", 100), hasStatus(415));
  assert.throws(() => validateImageBytes(JPEG, "image/jpeg", 3), hasStatus(413));
});

test("strict data URI parser accepts canonical image data and normalizes MIME casing", () => {
  const parsed = parseStrictImageDataUrl(
    `data:IMAGE/JPEG;base64,${Buffer.from(JPEG).toString("base64")}`,
    100,
  );
  assert.equal(parsed.mimeType, "image/jpeg");
  assert.equal(parsed.dataUrl, toImageDataUrl(JPEG, "image/jpeg"));
});

test("strict data URI parser rejects parameters, whitespace, malformed base64, and MIME mismatch", () => {
  const encoded = Buffer.from(JPEG).toString("base64");
  assert.throws(
    () => parseStrictImageDataUrl(`data:image/jpeg;charset=utf-8;base64,${encoded}`, 100),
    hasStatus(400),
  );
  assert.throws(
    () => parseStrictImageDataUrl(`data:image/jpeg;base64,${encoded}\n`, 100),
    hasStatus(400),
  );
  assert.throws(() => parseStrictImageDataUrl("data:image/jpeg;base64,_9j_4A==", 100), hasStatus(400));
  assert.throws(() => parseStrictImageDataUrl("data:image/png;base64,/9j/4A==", 100), hasStatus(400));
  assert.throws(() => parseStrictImageDataUrl("data:image/jpeg;base64,/9j/4A==", 3), hasStatus(413));
});

test("admin folder resolver permits current clients and the exact server-configured default", () => {
  assert.ok(
    (ADMIN_UPLOAD_FOLDERS as readonly string[]).includes("tours/itinerary"),
    "itinerary day uploads must use an allowed admin folder",
  );
  for (const folder of ADMIN_UPLOAD_FOLDERS) {
    assert.equal(resolveAdminUploadFolder(folder, "custom/default"), folder);
  }
  assert.equal(resolveAdminUploadFolder(null, "custom/default"), "custom/default");
  assert.equal(resolveAdminUploadFolder("custom/default", "custom/default"), "custom/default");
  assert.throws(() => resolveAdminUploadFolder("attacker/folder", "custom/default"), hasStatus(400));
  assert.throws(() => resolveAdminUploadFolder("../travel", "custom/default"), hasStatus(400));
  assert.throws(() => resolveAdminUploadFolder(null, "../invalid"), hasStatus(400));
});

test("bounded body reader rejects an oversized declared request before reading it", async () => {
  const request = new Request("https://example.test/upload", {
    method: "POST",
    headers: { "content-length": "101" },
    body: "x",
  });
  await assert.rejects(() => readBoundedRequestBody(request, 100), hasStatus(413));
});

test("bounded body reader enforces the real streamed size without Content-Length", async () => {
  const request = {
    headers: new Headers(),
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2, 3]));
        controller.enqueue(Uint8Array.from([4, 5, 6]));
        controller.close();
      },
    }),
  };
  await assert.rejects(
    () => readBoundedRequestBody(request as unknown as Request, 5),
    hasStatus(413),
  );
});

test("bounded body reader returns a request at or below the limit", async () => {
  const request = new Request("https://example.test/upload", {
    method: "POST",
    body: Uint8Array.from([1, 2, 3, 4]),
  });
  assert.deepEqual(
    Array.from(await readBoundedRequestBody(request, 4)),
    [1, 2, 3, 4],
  );
});
