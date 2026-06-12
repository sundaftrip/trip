import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { apiError } from "@/lib/api-error";

export async function GET() {
  const terms = await prisma.termsCondition.findFirst();
  return NextResponse.json(terms ?? { bodyId: "", bodyEn: "" });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Syarat & Ketentuan = teks website — pakai izin "text_edit" (lihat lib/permission-keys.ts)
  if (!await checkPermission(session, "text_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk mengubah Syarat & Ketentuan" }, { status: 403 });

  let body: { bodyId?: unknown; bodyEn?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const bodyId = typeof body.bodyId === "string" ? body.bodyId : "";
  const bodyEn = typeof body.bodyEn === "string" ? body.bodyEn : "";

  try {
    const existing = await prisma.termsCondition.findFirst();

    const terms = existing
      ? await prisma.termsCondition.update({ where: { id: existing.id }, data: { bodyId, bodyEn } })
      : await prisma.termsCondition.create({ data: { bodyId, bodyEn } });

    return NextResponse.json(terms);
  } catch (err) {
    return apiError(err);
  }
}
