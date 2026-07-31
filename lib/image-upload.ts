const MIB = 1024 * 1024;

export const MAX_ADMIN_IMAGE_BYTES = 4 * MIB;
export const MAX_FIELD_EXPENSE_IMAGE_BYTES = 3 * MIB;
export const MAX_IMAGE_UPLOAD_REQUEST_BYTES = 5 * MIB;

export const ADMIN_UPLOAD_FOLDERS = [
  "travel",
  "blog",
  "testimonials",
  "tours/hero",
  "tours/gallery",
  "tours/portfolio",
] as const;

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export class ImageUploadValidationError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 413 | 415 = 400,
  ) {
    super(message);
    this.name = "ImageUploadValidationError";
  }
}

function hasPrefix(bytes: Uint8Array, prefix: readonly number[]) {
  if (bytes.byteLength < prefix.length) return false;
  return prefix.every((value, index) => bytes[index] === value);
}

export function detectImageMimeType(bytes: Uint8Array): SupportedImageMimeType | null {
  if (hasPrefix(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  const isWebp =
    bytes.byteLength >= 16 &&
    hasPrefix(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50 &&
    bytes[12] === 0x56 &&
    bytes[13] === 0x50 &&
    bytes[14] === 0x38 &&
    [0x20, 0x4c, 0x58].includes(bytes[15]);
  return isWebp ? "image/webp" : null;
}

function isSupportedMimeType(value: string): value is SupportedImageMimeType {
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

export function validateImageBytes(
  input: ArrayBuffer | Uint8Array,
  claimedMimeType: string,
  maxBytes: number,
) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.byteLength === 0) {
    throw new ImageUploadValidationError("File gambar kosong.");
  }
  if (bytes.byteLength > maxBytes) {
    throw new ImageUploadValidationError("Ukuran gambar melewati batas yang diizinkan.", 413);
  }

  const normalizedMimeType = claimedMimeType.toLowerCase();
  if (!isSupportedMimeType(normalizedMimeType)) {
    throw new ImageUploadValidationError("Format gambar harus JPG, PNG, atau WebP.", 415);
  }

  const detectedMimeType = detectImageMimeType(bytes);
  if (!detectedMimeType || detectedMimeType !== normalizedMimeType) {
    throw new ImageUploadValidationError("Isi file tidak sesuai dengan format gambar yang dipilih.");
  }

  return {
    bytes: Buffer.from(bytes),
    mimeType: detectedMimeType,
  };
}

export function toImageDataUrl(bytes: Uint8Array, mimeType: SupportedImageMimeType) {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

const CANONICAL_BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const IMAGE_DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/i;

export function parseStrictImageDataUrl(input: string, maxBytes: number) {
  const match = IMAGE_DATA_URL.exec(input);
  if (!match || !CANONICAL_BASE64.test(match[2])) {
    throw new ImageUploadValidationError("Format data gambar tidak valid.");
  }

  const encoded = match[2];
  const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
  const decodedLength = (encoded.length / 4) * 3 - padding;
  if (decodedLength > maxBytes) {
    throw new ImageUploadValidationError("Ukuran gambar melewati batas yang diizinkan.", 413);
  }

  const decoded = Buffer.from(encoded, "base64");
  if (decoded.byteLength !== decodedLength) {
    throw new ImageUploadValidationError("Format data gambar tidak valid.");
  }

  const validated = validateImageBytes(decoded, match[1].toLowerCase(), maxBytes);
  return {
    ...validated,
    dataUrl: toImageDataUrl(validated.bytes, validated.mimeType),
  };
}

function isSafeFolderName(value: string) {
  return (
    /^[A-Za-z0-9][A-Za-z0-9/_-]{0,99}$/.test(value) &&
    !value.includes("//") &&
    value.split("/").every((segment) => segment !== "." && segment !== "..")
  );
}

export function resolveAdminUploadFolder(
  requested: FormDataEntryValue | null,
  configuredFolder?: string,
) {
  if (requested !== null && typeof requested !== "string") {
    throw new ImageUploadValidationError("Folder upload tidak valid.");
  }

  const configured = configuredFolder?.trim() || "travel";
  if (!isSafeFolderName(configured)) {
    throw new ImageUploadValidationError("Konfigurasi folder upload tidak valid.");
  }

  const selected = requested || configured;
  const allowed = new Set<string>([...ADMIN_UPLOAD_FOLDERS, configured]);
  if (!allowed.has(selected)) {
    throw new ImageUploadValidationError("Folder upload tidak diizinkan.");
  }
  return selected;
}

type BodyRequest = Pick<Request, "body" | "headers">;

export async function readBoundedRequestBody(request: BodyRequest, maxBytes: number) {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      throw new ImageUploadValidationError("Ukuran permintaan tidak valid.");
    }
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength)) {
      throw new ImageUploadValidationError("Ukuran permintaan tidak valid.");
    }
    if (declaredLength > maxBytes) {
      throw new ImageUploadValidationError("Ukuran permintaan melewati batas yang diizinkan.", 413);
    }
  }

  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new ImageUploadValidationError("Ukuran permintaan melewati batas yang diizinkan.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const output = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}
