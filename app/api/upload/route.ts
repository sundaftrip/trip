import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const ALLOWED_UPLOAD_FOLDERS = new Set([
  "travel",
  "blog",
  "testimonials",
  "tours/hero",
  "tours/gallery",
  "tours/portfolio",
]);

function isAllowedImageSignature(buffer: Buffer) {
  if (buffer.length < 12) return false;
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return true;
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return true;
  if (buffer.subarray(0, 3).toString("ascii") === "GIF") return true;
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return true;
  if (buffer.subarray(4, 12).toString("ascii").startsWith("ftypavif")) return true;
  return false;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary belum dikonfigurasi. Tambahkan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET di environment variables." }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const defaultFolder = (process.env.CLOUDINARY_FOLDER || "travel").trim();
  const requestedFolder = ((formData.get("folder") as string) || defaultFolder).trim();
  const allowedFolders = new Set([...ALLOWED_UPLOAD_FOLDERS, defaultFolder]);
  const folder = allowedFolders.has(requestedFolder) ? requestedFolder : "";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!folder) return NextResponse.json({ error: "Folder upload tidak diizinkan." }, { status: 422 });
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File harus gambar JPG, PNG, WEBP, GIF, atau AVIF." }, { status: 422 });
  }
  if (file.size <= 0) return NextResponse.json({ error: "File kosong tidak bisa diupload." }, { status: 422 });
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB." }, { status: 413 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!isAllowedImageSignature(buffer)) {
      return NextResponse.json({ error: "Isi file tidak cocok dengan format gambar yang diizinkan." }, { status: 422 });
    }
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const url = await uploadImage(base64, folder);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal upload gambar. Periksa konfigurasi Cloudinary." }, { status: 500 });
  }
}
