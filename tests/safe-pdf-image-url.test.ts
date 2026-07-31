import assert from "node:assert/strict";
import test from "node:test";
import { deflateSync } from "node:zlib";

import {
  assertAllowedPdfImageUrl,
  fetchPdfImageDataUrl,
  isAllowedPdfImageHostname,
  PDF_IMAGE_MAX_DIMENSION,
  PDF_IMAGE_MAX_PIXELS,
  pdfImageBytesToDataUrl,
  validatePdfImageDataUrl,
} from "../lib/safe-image-url";

const publicResolver = async () => ["93.184.216.34"];
const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngWithDimensions(width: number, height: number): Buffer {
  const image = Buffer.from(pngBytes);
  image.writeUInt32BE(width, 16);
  image.writeUInt32BE(height, 20);
  image.writeUInt32BE(crc32(image.subarray(12, 29)), 29);
  return image;
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.byteLength);
  chunk.writeUInt32BE(data.byteLength, 0);
  typeBytes.copy(chunk, 4);
  Buffer.from(data).copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, 8 + data.byteLength)), 8 + data.byteLength);
  return chunk;
}

function onePixelPngWithInflatedData(inflatedData: Uint8Array): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0);
  header.writeUInt32BE(1, 4);
  header[8] = 8;
  header[9] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(inflatedData)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function jpegWithDimensions(width: number, height: number): Buffer {
  return Buffer.from([
    0xff, 0xd8,
    0xff, 0xc0, 0x00, 0x11, 0x08,
    height >>> 8, height & 0xff,
    width >>> 8, width & 0xff,
    0x03,
    0x01, 0x11, 0x00,
    0x02, 0x11, 0x00,
    0x03, 0x11, 0x00,
    0xff, 0xda, 0x00, 0x0c, 0x03,
    0x01, 0x00,
    0x02, 0x11,
    0x03, 0x11,
    0x00, 0x3f, 0x00,
    0x00,
    0xff, 0xd9,
  ]);
}

function pngResponse(init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("content-type", "image/png");
  return new Response(pngBytes, { ...init, headers });
}

test("allows only configured HTTPS image CDN hostnames", async () => {
  assert.equal(isAllowedPdfImageHostname("res.cloudinary.com"), true);
  assert.equal(isAllowedPdfImageHostname("cdn.rbth.com"), true);
  assert.equal(isAllowedPdfImageHostname("images.pexels.com"), true);
  assert.equal(isAllowedPdfImageHostname("evilrbth.com"), false);

  const url = await assertAllowedPdfImageUrl(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    publicResolver,
  );
  assert.equal(url.hostname, "res.cloudinary.com");

  await assert.rejects(() => assertAllowedPdfImageUrl(
    "http://res.cloudinary.com/demo/image/upload/sample.jpg",
    publicResolver,
  ));
  await assert.rejects(() => assertAllowedPdfImageUrl(
    "https://user:pass@res.cloudinary.com/demo/image/upload/sample.jpg",
    publicResolver,
  ));
  await assert.rejects(() => assertAllowedPdfImageUrl(
    "https://res.cloudinary.com:8443/demo/image/upload/sample.jpg",
    publicResolver,
  ));
  await assert.rejects(() => assertAllowedPdfImageUrl(
    "https://res.cloudinary.com.attacker.example/image.jpg",
    publicResolver,
  ));
});

test("reuses public-address validation for image CDN DNS answers", async () => {
  await assert.rejects(() => assertAllowedPdfImageUrl(
    "https://images.pexels.com/photos/example.jpg",
    async () => ["169.254.169.254"],
  ));
  await assert.rejects(() => assertAllowedPdfImageUrl(
    "https://images.pexels.com/photos/example.jpg",
    async () => ["93.184.216.34", "10.0.0.8"],
  ));
});

test("fetches a bounded verified image and returns an in-memory data URL", async () => {
  let requestInit: RequestInit | undefined;
  const result = await fetchPdfImageDataUrl(
    "https://res.cloudinary.com/demo/image/upload/sample.png",
    {
      fetchImpl: async (_input, init) => {
        requestInit = init;
        return pngResponse();
      },
      resolveAddresses: publicResolver,
    },
  );

  assert.equal(result, `data:image/png;base64,${pngBytes.toString("base64")}`);
  assert.equal(requestInit?.redirect, "manual");
  assert.ok(requestInit?.signal);
});

test("revalidates redirect protocol, hostname, and resolved address before following", async () => {
  const requested: string[] = [];
  const fetchImpl = async (input: string | URL) => {
    requested.push(String(input));
    return new Response(null, {
      status: 302,
      headers: { Location: "https://attacker.example/internal.png" },
    });
  };

  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://res.cloudinary.com/demo/image/upload/start.png",
    { fetchImpl, resolveAddresses: publicResolver },
  ));
  assert.deepEqual(requested, [
    "https://res.cloudinary.com/demo/image/upload/start.png",
  ]);

  requested.length = 0;
  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://res.cloudinary.com/demo/image/upload/start.png",
    {
      fetchImpl: async (input) => {
        requested.push(String(input));
        return new Response(null, {
          status: 302,
          headers: { Location: "http://res.cloudinary.com/insecure.png" },
        });
      },
      resolveAddresses: publicResolver,
    },
  ));
  assert.deepEqual(requested, [
    "https://res.cloudinary.com/demo/image/upload/start.png",
  ]);

  requested.length = 0;
  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://res.cloudinary.com/demo/image/upload/start.png",
    {
      fetchImpl: async (input) => {
        requested.push(String(input));
        return new Response(null, {
          status: 302,
          headers: { Location: "https://images.pexels.com/private.png" },
        });
      },
      resolveAddresses: async (hostname) => hostname === "images.pexels.com"
        ? ["127.0.0.1"]
        : ["93.184.216.34"],
    },
  ));
  assert.deepEqual(requested, [
    "https://res.cloudinary.com/demo/image/upload/start.png",
  ]);
});

test("allows redirects between approved wildcard CDN subdomains", async () => {
  const requested: string[] = [];
  const result = await fetchPdfImageDataUrl(
    "https://cdn.rbth.com/start.png",
    {
      fetchImpl: async (input) => {
        requested.push(String(input));
        if (requested.length === 1) {
          return new Response(null, {
            status: 302,
            headers: { Location: "https://media.rbth.com/final.png" },
          });
        }
        return pngResponse();
      },
      resolveAddresses: publicResolver,
    },
  );

  assert.match(result, /^data:image\/png;base64,/);
  assert.deepEqual(requested, [
    "https://cdn.rbth.com/start.png",
    "https://media.rbth.com/final.png",
  ]);
});

test("follows a limited redirect between approved public image hosts", async () => {
  const requested: string[] = [];
  const result = await fetchPdfImageDataUrl(
    "https://picsum.photos/seed/demo/100/100",
    {
      fetchImpl: async (input) => {
        requested.push(String(input));
        if (requested.length === 1) {
          return new Response(null, {
            status: 302,
            headers: { Location: "https://fastly.picsum.photos/id/1/100/100.png" },
          });
        }
        return pngResponse();
      },
      resolveAddresses: publicResolver,
    },
  );

  assert.match(result, /^data:image\/png;base64,/);
  assert.deepEqual(requested, [
    "https://picsum.photos/seed/demo/100/100",
    "https://fastly.picsum.photos/id/1/100/100.png",
  ]);
});

test("rejects unexpected MIME types and mismatched image signatures", async () => {
  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://images.unsplash.com/photo.jpg",
    {
      fetchImpl: async () => new Response(pngBytes, {
        headers: { "Content-Type": "text/plain" },
      }),
      resolveAddresses: publicResolver,
    },
  ));

  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://images.unsplash.com/photo.jpg",
    {
      fetchImpl: async () => new Response("not a png", {
        headers: { "Content-Type": "image/png" },
      }),
      resolveAddresses: publicResolver,
    },
  ));
});

test("enforces declared and streamed response byte limits", async () => {
  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://upload.wikimedia.org/example.png",
    {
      fetchImpl: async () => pngResponse({
        headers: {
          "Content-Length": "100",
          "Content-Type": "image/png",
        },
      }),
      maxBytes: 50,
      resolveAddresses: publicResolver,
    },
  ));

  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://upload.wikimedia.org/example.png",
    {
      fetchImpl: async () => pngResponse(),
      maxBytes: 8,
      resolveAddresses: publicResolver,
    },
  ));
});

test("aborts image downloads that exceed the time limit", async () => {
  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://images.pexels.com/photos/slow.jpg",
    {
      fetchImpl: async (_input, init) => new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), {
          once: true,
        });
      }),
      resolveAddresses: publicResolver,
      timeoutMs: 20,
    },
  ), /batas waktu/);

  await assert.rejects(() => fetchPdfImageDataUrl(
    "https://images.pexels.com/photos/stalled.png",
    {
      fetchImpl: async () => new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(pngBytes.subarray(0, 8));
          },
        }),
        { headers: { "Content-Type": "image/png" } },
      ),
      resolveAddresses: publicResolver,
      timeoutMs: 20,
    },
  ), /batas waktu/);
});

test("bounds and validates stored data images before PDF rendering", () => {
  const dataUrl = pdfImageBytesToDataUrl(pngBytes, "image/png");
  assert.equal(validatePdfImageDataUrl(dataUrl), dataUrl);

  assert.throws(() => validatePdfImageDataUrl(
    "data:image/png;base64,bm90IGEgcG5n",
  ));
  assert.throws(() => validatePdfImageDataUrl(dataUrl, 8));
  assert.throws(() => validatePdfImageDataUrl(
    "data:image/svg+xml;base64,PHN2Zy8+",
  ));
  assert.throws(() => pdfImageBytesToDataUrl(
    Buffer.from("RIFF0000WEBP", "ascii"),
    "image/webp",
  ));
});

test("rejects signature-only and truncated JPEG and PNG payloads", () => {
  assert.throws(
    () => pdfImageBytesToDataUrl(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png",
    ),
    /Struktur gambar PNG/,
  );
  assert.throws(
    () => pdfImageBytesToDataUrl(
      Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
      "image/jpeg",
    ),
    /Struktur gambar JPEG/,
  );
  assert.throws(
    () => pdfImageBytesToDataUrl(pngBytes.subarray(0, pngBytes.length - 4), "image/png"),
    /Struktur gambar PNG/,
  );

  const corruptCrc = Buffer.from(pngBytes);
  corruptCrc[corruptCrc.length - 5] ^= 0x01;
  assert.throws(
    () => pdfImageBytesToDataUrl(corruptCrc, "image/png"),
    /Struktur gambar PNG/,
  );
});

test("rejects excessive image dimensions and decoded pixel counts", () => {
  assert.throws(
    () => pdfImageBytesToDataUrl(
      pngWithDimensions(PDF_IMAGE_MAX_DIMENSION + 1, 1),
      "image/png",
    ),
    /Dimensi gambar PDF/,
  );

  const overPixelSide = Math.floor(Math.sqrt(PDF_IMAGE_MAX_PIXELS)) + 1;
  assert.ok(overPixelSide <= PDF_IMAGE_MAX_DIMENSION);
  assert.throws(
    () => pdfImageBytesToDataUrl(
      jpegWithDimensions(overPixelSide, overPixelSide),
      "image/jpeg",
    ),
    /Dimensi gambar PDF/,
  );

  const hugeFrame = jpegWithDimensions(PDF_IMAGE_MAX_DIMENSION + 1, 1);
  const smallFrame = jpegWithDimensions(1, 1);
  const duplicateFrame = Buffer.concat([
    hugeFrame.subarray(0, 21),
    smallFrame.subarray(2),
  ]);
  assert.throws(
    () => pdfImageBytesToDataUrl(duplicateFrame, "image/jpeg"),
    /Struktur gambar JPEG/,
  );
});

test("rejects compressed PNG data that expands beyond its declared dimensions", () => {
  const compressedBomb = onePixelPngWithInflatedData(Buffer.alloc(1_000_000));
  assert.ok(compressedBomb.byteLength < 2_000);
  assert.throws(
    () => pdfImageBytesToDataUrl(compressedBomb, "image/png"),
    /Data terkompresi gambar PNG/,
  );
});
