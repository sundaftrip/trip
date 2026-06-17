import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireB2bCatalogAdmin } from "@/lib/b2b-catalog-admin";

const FOLDER = "b2b-russia-catalog";
const UPLOAD_OPTIONS = {
  unique_filename: "true",
  use_filename: "true",
};

export async function POST() {
  const guard = await requireB2bCatalogAdmin();
  if (guard.response) return guard.response;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary belum dikonfigurasi." }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      folder: FOLDER,
      timestamp,
      ...UPLOAD_OPTIONS,
    },
    apiSecret,
  );

  return NextResponse.json({
    apiKey,
    cloudName,
    folder: FOLDER,
    signature,
    timestamp,
    uniqueFilename: UPLOAD_OPTIONS.unique_filename,
    useFilename: UPLOAD_OPTIONS.use_filename,
  });
}
