import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

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

  let body: { token?: string; image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const token = String(body.token ?? "");
  const image = String(body.image ?? "");
  if (!token || !image) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  const tour = await prisma.tour.findUnique({
    where: { expenseToken: token },
    select: { id: true },
  });
  if (!tour) {
    return NextResponse.json({ error: "Link tidak valid." }, { status: 403 });
  }

  try {
    const url = await uploadImage(image, "sundaftrip/field-expense");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Field expense upload error:", err);
    return NextResponse.json({ error: "Gagal mengunggah foto." }, { status: 500 });
  }
}
