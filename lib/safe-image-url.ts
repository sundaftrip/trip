import { inflateSync } from "node:zlib";
import type {
  AddressResolver,
  FetchLike,
} from "@/lib/safe-public-url";
import {
  assertPublicHttpUrl,
  fetchPublicBytes,
  UnsafeUrlError,
} from "@/lib/safe-public-url";

export type PdfImageFetchOptions = {
  fetchImpl?: FetchLike;
  maxBytes?: number;
  maxRedirects?: number;
  resolveAddresses?: AddressResolver;
  timeoutMs?: number;
};

export const PDF_IMAGE_MAX_BYTES = 4_000_000;
export const PDF_IMAGE_MAX_DECODED_BYTES = 36_000_000;
export const PDF_IMAGE_MAX_DIMENSION = 6_000;
export const PDF_IMAGE_MAX_PIXELS = 8_000_000;
export const PDF_IMAGE_TIMEOUT_MS = 8_000;

const JPEG_MAX_HEADER_SEGMENTS = 1_024;
const PDF_IMAGE_MAX_URL_LENGTH = 8_192;
const PNG_MAX_CHUNKS = 4_096;

const PDF_IMAGE_EXACT_HOSTNAMES = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "images.pexels.com",
  "upload.wikimedia.org",
]);

// Keep these aligned with wildcard image hosts in next.config.ts.
const PDF_IMAGE_HOSTNAME_SUFFIXES = [
  ".rbth.com",
  ".pexels.com",
];

const PDF_IMAGE_MIME_TYPES = new Map([
  ["image/jpeg", "image/jpeg"],
  ["image/jpg", "image/jpeg"],
  ["image/png", "image/png"],
]);

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
}

export function isAllowedPdfImageHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return PDF_IMAGE_EXACT_HOSTNAMES.has(normalized)
    || PDF_IMAGE_HOSTNAME_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

function parseAllowedPdfImageUrl(
  input: string | URL,
): URL {
  const value = input instanceof URL ? input.href : input;
  if (value.length > PDF_IMAGE_MAX_URL_LENGTH) {
    throw new UnsafeUrlError("URL gambar terlalu panjang.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new UnsafeUrlError("URL gambar tidak valid.");
  }

  if (url.protocol !== "https:") {
    throw new UnsafeUrlError("URL gambar wajib memakai HTTPS.");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("URL gambar tidak boleh memuat kredensial.");
  }
  if (url.port) {
    throw new UnsafeUrlError("Port URL gambar tidak diizinkan.");
  }

  const hostname = normalizeHostname(url.hostname);
  if (!isAllowedPdfImageHostname(hostname)) {
    throw new UnsafeUrlError("Hostname gambar tidak diizinkan.");
  }

  return url;
}

export async function assertAllowedPdfImageUrl(
  input: string | URL,
  resolveAddresses?: AddressResolver,
): Promise<URL> {
  const url = parseAllowedPdfImageUrl(input);

  return assertPublicHttpUrl(
    url,
    resolveAddresses,
    [...PDF_IMAGE_EXACT_HOSTNAMES],
    PDF_IMAGE_HOSTNAME_SUFFIXES,
    ["https:"],
  );
}

function normalizedMimeType(headers: Headers): string {
  const raw = headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  const normalized = raw ? PDF_IMAGE_MIME_TYPES.get(raw) : null;
  if (!normalized) {
    throw new UnsafeUrlError("Respons sumber bukan gambar JPEG atau PNG.");
  }
  return normalized;
}

type ImageDimensions = {
  height: number;
  width: number;
};

type PngMetadata = ImageDimensions & {
  bitDepth: number;
  colorType: number;
  imageData: Uint8Array;
  interlaceMethod: number;
};

const PNG_CHANNELS_BY_COLOR_TYPE = new Map([
  [0, 1],
  [2, 3],
  [3, 1],
  [4, 2],
  [6, 4],
]);

const PNG_BIT_DEPTHS_BY_COLOR_TYPE = new Map<number, Set<number>>([
  [0, new Set([1, 2, 4, 8, 16])],
  [2, new Set([8, 16])],
  [3, new Set([1, 2, 4, 8])],
  [4, new Set([8, 16])],
  [6, new Set([8, 16])],
]);

const PNG_CRC_TABLE = Uint32Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return crc >>> 0;
});

function readUint32(bytes: Uint8Array, offset: number): number {
  return new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).getUint32(offset, false);
}

function pngCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ PNG_CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function combineByteChunks(chunks: readonly Uint8Array[], byteLength: number): Uint8Array {
  const combined = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return combined;
}

function pngMetadata(bytes: Uint8Array): PngMetadata {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 33 || signature.some((value, index) => bytes[index] !== value)) {
    throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
  }

  let offset = 8;
  let metadata: Omit<PngMetadata, "imageData"> | null = null;
  const imageDataChunks: Uint8Array[] = [];
  let imageDataByteLength = 0;
  let imageDataEnded = false;
  let sawPalette = false;
  let sawImageData = false;
  let sawImageEnd = false;
  let chunkIndex = 0;

  while (offset + 12 <= bytes.length) {
    if (chunkIndex >= PNG_MAX_CHUNKS) {
      throw new UnsafeUrlError("Struktur gambar PNG terlalu kompleks.");
    }
    const chunkLength = readUint32(bytes, offset);
    if (chunkLength > bytes.length - offset - 12) {
      throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
    }

    const typeOffset = offset + 4;
    const dataOffset = offset + 8;
    const crcOffset = dataOffset + chunkLength;
    for (let index = typeOffset; index < dataOffset; index += 1) {
      const value = bytes[index];
      if (!((value >= 65 && value <= 90) || (value >= 97 && value <= 122))) {
        throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
      }
    }
    if (pngCrc32(bytes.subarray(typeOffset, crcOffset)) !== readUint32(bytes, crcOffset)) {
      throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
    }

    const chunkType = String.fromCharCode(
      bytes[typeOffset],
      bytes[typeOffset + 1],
      bytes[typeOffset + 2],
      bytes[typeOffset + 3],
    );
    if (chunkIndex === 0 && (chunkType !== "IHDR" || chunkLength !== 13)) {
      throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
    }
    if (chunkType === "IHDR") {
      if (metadata || chunkLength !== 13) {
        throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
      }
      const bitDepth = bytes[dataOffset + 8];
      const colorType = bytes[dataOffset + 9];
      const compressionMethod = bytes[dataOffset + 10];
      const filterMethod = bytes[dataOffset + 11];
      const interlaceMethod = bytes[dataOffset + 12];
      if (
        !PNG_BIT_DEPTHS_BY_COLOR_TYPE.get(colorType)?.has(bitDepth)
        || compressionMethod !== 0
        || filterMethod !== 0
        || (interlaceMethod !== 0 && interlaceMethod !== 1)
      ) {
        throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
      }
      metadata = {
        width: readUint32(bytes, dataOffset),
        height: readUint32(bytes, dataOffset + 4),
        bitDepth,
        colorType,
        interlaceMethod,
      };
    } else if (chunkType === "PLTE") {
      if (
        !metadata
        || sawPalette
        || sawImageData
        || chunkLength === 0
        || chunkLength % 3 !== 0
        || chunkLength > 768
        || metadata.colorType === 0
        || metadata.colorType === 4
        || (metadata.colorType === 3 && chunkLength / 3 > 2 ** metadata.bitDepth)
      ) {
        throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
      }
      sawPalette = true;
    } else if (chunkType === "IDAT") {
      if (!metadata || imageDataEnded) {
        throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
      }
      sawImageData = true;
      imageDataByteLength += chunkLength;
      imageDataChunks.push(bytes.subarray(dataOffset, crcOffset));
    } else if (chunkType === "IEND") {
      if (!metadata || !sawImageData || chunkLength !== 0) {
        throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
      }
      offset += 12;
      sawImageEnd = true;
      break;
    } else {
      // An unknown critical chunk means this decoder cannot safely interpret the file.
      if ((bytes[typeOffset] & 0x20) === 0) {
        throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
      }
    }

    if (sawImageData && chunkType !== "IDAT") imageDataEnded = true;
    offset += chunkLength + 12;
    chunkIndex += 1;
  }

  if (
    !metadata
    || !sawImageData
    || imageDataByteLength === 0
    || !sawImageEnd
    || offset !== bytes.length
    || (metadata.colorType === 3 && !sawPalette)
  ) {
    throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
  }
  return {
    ...metadata,
    imageData: combineByteChunks(imageDataChunks, imageDataByteLength),
  };
}

function pngDecodedByteLength(metadata: PngMetadata): number {
  const channels = PNG_CHANNELS_BY_COLOR_TYPE.get(metadata.colorType);
  if (!channels) throw new UnsafeUrlError("Struktur gambar PNG tidak valid.");
  const bitsPerPixel = channels * metadata.bitDepth;
  const passByteLength = (
    xStart: number,
    yStart: number,
    xStep: number,
    yStep: number,
  ) => {
    const width = metadata.width <= xStart
      ? 0
      : Math.ceil((metadata.width - xStart) / xStep);
    const height = metadata.height <= yStart
      ? 0
      : Math.ceil((metadata.height - yStart) / yStep);
    if (width === 0 || height === 0) return 0;
    return height * (1 + Math.ceil((width * bitsPerPixel) / 8));
  };

  if (metadata.interlaceMethod === 0) {
    return passByteLength(0, 0, 1, 1);
  }
  return [
    [0, 0, 8, 8],
    [4, 0, 8, 8],
    [0, 4, 4, 8],
    [2, 0, 4, 4],
    [0, 2, 2, 4],
    [1, 0, 2, 2],
    [0, 1, 1, 2],
  ].reduce(
    (total, [xStart, yStart, xStep, yStep]) => total
      + passByteLength(xStart, yStart, xStep, yStep),
    0,
  );
}

function validatePngImageData(metadata: PngMetadata): void {
  const expectedByteLength = pngDecodedByteLength(metadata);
  if (expectedByteLength <= 0 || expectedByteLength > PDF_IMAGE_MAX_DECODED_BYTES) {
    throw new UnsafeUrlError("Data terurai gambar PNG terlalu besar atau tidak valid.");
  }

  let decoded: Uint8Array;
  try {
    decoded = inflateSync(metadata.imageData, {
      maxOutputLength: expectedByteLength + 1,
    });
  } catch {
    throw new UnsafeUrlError("Data terkompresi gambar PNG tidak valid.");
  }
  if (decoded.byteLength !== expectedByteLength) {
    throw new UnsafeUrlError("Data terkompresi gambar PNG tidak valid.");
  }
}

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3,
  0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb,
  0xcd, 0xce, 0xcf,
]);

function jpegDimensions(bytes: Uint8Array): ImageDimensions {
  if (
    bytes.length < 12
    || bytes[0] !== 0xff
    || bytes[1] !== 0xd8
    || bytes[bytes.length - 2] !== 0xff
    || bytes[bytes.length - 1] !== 0xd9
  ) {
    throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
  }

  let offset = 2;
  let dimensions: ImageDimensions | null = null;
  let sawScan = false;
  let segmentCount = 0;

  while (offset < bytes.length - 2) {
    segmentCount += 1;
    if (segmentCount > JPEG_MAX_HEADER_SEGMENTS) {
      throw new UnsafeUrlError("Struktur gambar JPEG terlalu kompleks.");
    }
    if (bytes[offset] !== 0xff) {
      throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
    }
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9) break;
    if (marker === 0x01) continue;
    if (marker >= 0xd0 && marker <= 0xd8) {
      throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
    }
    if (marker === 0x00 || offset + 2 > bytes.length) {
      throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
    }

    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
    }

    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      const precision = bytes[offset + 2];
      const componentCount = bytes[offset + 7];
      if (
        dimensions
        || precision === 0
        || precision > 16
        || componentCount === 0
        || componentCount > 4
        || segmentLength !== 8 + componentCount * 3
      ) {
        throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
      }
      dimensions = {
        height: (bytes[offset + 3] << 8) | bytes[offset + 4],
        width: (bytes[offset + 5] << 8) | bytes[offset + 6],
      };
    }
    if (marker === 0xda) {
      const scanComponentCount = bytes[offset + 2];
      if (
        scanComponentCount === 0
        || scanComponentCount > 4
        || segmentLength !== 6 + scanComponentCount * 2
        || offset + segmentLength >= bytes.length - 2
      ) {
        throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
      }
      sawScan = true;
      break;
    }

    offset += segmentLength;
  }

  if (!dimensions || !sawScan) {
    throw new UnsafeUrlError("Struktur gambar JPEG tidak valid.");
  }
  return dimensions;
}

function validateImageStructure(bytes: Uint8Array, mimeType: string): void {
  const png = mimeType === "image/png" ? pngMetadata(bytes) : null;
  const { height, width } = png ?? jpegDimensions(bytes);

  if (
    width <= 0
    || height <= 0
    || width > PDF_IMAGE_MAX_DIMENSION
    || height > PDF_IMAGE_MAX_DIMENSION
    || width * height > PDF_IMAGE_MAX_PIXELS
  ) {
    throw new UnsafeUrlError("Dimensi gambar PDF terlalu besar atau tidak valid.");
  }
  if (png) validatePngImageData(png);
}

export function pdfImageBytesToDataUrl(
  bytes: Uint8Array,
  mimeType: string,
  maxBytes = PDF_IMAGE_MAX_BYTES,
): string {
  const normalizedMime = PDF_IMAGE_MIME_TYPES.get(mimeType.toLowerCase());
  if (!normalizedMime) {
    throw new UnsafeUrlError("Format gambar PDF tidak didukung.");
  }
  if (bytes.byteLength > maxBytes) {
    throw new UnsafeUrlError("Gambar PDF terlalu besar.");
  }
  validateImageStructure(bytes, normalizedMime);

  return `data:${normalizedMime};base64,${Buffer.from(bytes).toString("base64")}`;
}

export function validatePdfImageDataUrl(
  input: string,
  maxBytes = PDF_IMAGE_MAX_BYTES,
): string {
  const maxEncodedLength = Math.ceil(maxBytes / 3) * 4 + 4;
  if (input.length > "data:image/jpeg;base64,".length + maxEncodedLength) {
    throw new UnsafeUrlError("Data URL gambar terlalu besar atau tidak valid.");
  }
  const match = /^data:(image\/(?:png|jpe?g));base64,([a-z\d+/]*={0,2})$/i.exec(input);
  if (!match) {
    throw new UnsafeUrlError("Data URL gambar tidak valid.");
  }

  const encoded = match[2];
  if (encoded.length % 4 !== 0 || encoded.length > maxEncodedLength) {
    throw new UnsafeUrlError("Data URL gambar terlalu besar atau tidak valid.");
  }

  const bytes = Buffer.from(encoded, "base64");
  if (bytes.toString("base64") !== encoded) {
    throw new UnsafeUrlError("Data URL gambar tidak memakai base64 yang valid.");
  }

  const declaredMime = match[1].toLowerCase() === "image/png" ? "image/png" : "image/jpeg";
  return pdfImageBytesToDataUrl(bytes, declaredMime, maxBytes);
}

export async function fetchPdfImageDataUrl(
  input: string | URL,
  options: PdfImageFetchOptions = {},
): Promise<string> {
  const {
    fetchImpl,
    maxBytes = PDF_IMAGE_MAX_BYTES,
    maxRedirects = 2,
    resolveAddresses,
    timeoutMs = PDF_IMAGE_TIMEOUT_MS,
  } = options;

  try {
    const url = parseAllowedPdfImageUrl(input);
    const response = await fetchPublicBytes(url, {
      allowedContentTypes: [...PDF_IMAGE_MIME_TYPES.keys()],
      allowedHostnameSuffixes: PDF_IMAGE_HOSTNAME_SUFFIXES,
      allowedHostnames: [...PDF_IMAGE_EXACT_HOSTNAMES],
      allowedProtocols: ["https:"],
      fetchImpl,
      headers: {
        Accept: "image/jpeg, image/png",
      },
      maxBytes,
      maxRedirects,
      resolveAddresses,
      timeoutMs,
    });

    if (!response.ok) {
      throw new UnsafeUrlError("Sumber gambar gagal merespons.");
    }

    const mimeType = normalizedMimeType(response.headers);
    return pdfImageBytesToDataUrl(response.bytes, mimeType, maxBytes);
  } catch (error) {
    if (error instanceof UnsafeUrlError) throw error;
    throw new UnsafeUrlError("Gambar tidak dapat diambil dengan aman.");
  }
}
