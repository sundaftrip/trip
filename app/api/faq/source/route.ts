import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { GENERAL_FAQ_SOURCE_KEY } from "@/lib/faq-cms";
import { revalidatePublicContent } from "@/lib/revalidate";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "text_edit")) return NextResponse.json({ error: "Tidak memiliki izin mengelola FAQ" }, { status: 403 });
  try {
    const row = await prisma.companyInfo.findUnique({ where: { key: GENERAL_FAQ_SOURCE_KEY } });
    return NextResponse.json({ source: row?.value === "cms" ? "cms" : "default" }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Gagal memuat sumber FAQ" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "text_edit")) return NextResponse.json({ error: "Tidak memiliki izin mengelola FAQ" }, { status: 403 });
  try {
    const { source } = await req.json();
    if (source !== "cms" && source !== "default") return NextResponse.json({ error: "Sumber FAQ tidak valid" }, { status: 400 });
    await prisma.companyInfo.upsert({ where: { key: GENERAL_FAQ_SOURCE_KEY }, create: { key: GENERAL_FAQ_SOURCE_KEY, value: source }, update: { value: source } });
    revalidatePublicContent();
    return NextResponse.json({ source });
  } catch {
    return NextResponse.json({ error: "Sumber FAQ belum tersimpan. Coba lagi." }, { status: 500 });
  }
}
