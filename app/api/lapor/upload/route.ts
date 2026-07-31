import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { isTokenActive } from "@/lib/keuangan/calc";
import {
  ImageUploadValidationError,
  MAX_FIELD_EXPENSE_IMAGE_BYTES,
  MAX_IMAGE_UPLOAD_REQUEST_BYTES,
  parseStrictImageDataUrl,
  readBoundedRequestBody,
} from "@/lib/image-upload";

// Upload foto bukti pengeluaran lapangan. PUBLIK tapi divalidasi token
// trip — bukan sesi login. Hanya bisa upload kalau token valid.
export async function POST(req: NextRequest) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json({ error: "Upload foto belum dikonfigurasi." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    const requestBody = await readBoundedRequestBody(req, MAX_IMAGE_UPLOAD_REQUEST_BYTES);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(requestBody);
    const parsed: unknown = JSON.parse(decoded);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ImageUploadValidationError("Permintaan tidak valid.");
    }
    body = parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ImageUploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const image = typeof body.image === "string" ? body.image : "";
  if (!token || !image) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({
    where: { expenseToken: token },
    select: { id: true, tripDate: true },
  });
  if (!tour) {
    return NextResponse.json({ error: "Link tidak valid." }, { status: 403 });
  }
  if (!isTokenActive(tour.tripDate)) {
    return NextResponse.json({ error: "Link sudah kedaluwarsa." }, { status: 403 });
  }

  try {
    const validated = parseStrictImageDataUrl(image, MAX_FIELD_EXPENSE_IMAGE_BYTES);
    const url = await uploadImage(validated.dataUrl, "sundaftrip/field-expense");
    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof ImageUploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Field expense upload error:", err);
    return NextResponse.json({ error: "Gagal mengunggah foto." }, { status: 500 });
  }
}
