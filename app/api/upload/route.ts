import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import {
  ImageUploadValidationError,
  MAX_ADMIN_IMAGE_BYTES,
  MAX_IMAGE_UPLOAD_REQUEST_BYTES,
  readBoundedRequestBody,
  resolveAdminUploadFolder,
  toImageDataUrl,
  validateImageBytes,
} from "@/lib/image-upload";

function validationErrorResponse(error: unknown) {
  if (error instanceof ImageUploadValidationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: "Permintaan upload tidak valid." }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary belum dikonfigurasi. Tambahkan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET di environment variables." }, { status: 500 });
  }

  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let file: File;
  let folder: string;
  try {
    const requestBody = await readBoundedRequestBody(req, MAX_IMAGE_UPLOAD_REQUEST_BYTES);
    const headers = new Headers(req.headers);
    headers.delete("content-length");
    const boundedRequest = new Request(req.url, {
      method: "POST",
      headers,
      body: Buffer.from(requestBody),
    });
    const formData = await boundedRequest.formData();
    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File)) {
      throw new ImageUploadValidationError("File gambar wajib diisi.");
    }
    file = fileEntry;
    folder = resolveAdminUploadFolder(formData.get("folder"), process.env.CLOUDINARY_FOLDER);
  } catch (error) {
    return validationErrorResponse(error);
  }

  try {
    const validated = validateImageBytes(
      await file.arrayBuffer(),
      file.type,
      MAX_ADMIN_IMAGE_BYTES,
    );
    const url = await uploadImage(toImageDataUrl(validated.bytes, validated.mimeType), folder);
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof ImageUploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal upload gambar. Periksa konfigurasi Cloudinary." }, { status: 500 });
  }
}
