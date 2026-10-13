import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { apiError } from "@/lib/api-error";
import { HOME_TEXT_FIELDS, HOME_TEXT_KEYS } from "@/lib/home-text-fields";

export async function GET() {
  const texts = await prisma.siteText.findMany({ where: { key: { in: [...HOME_TEXT_KEYS] } } });
  const result: Record<string, { id?: string; en?: string }> = {};
  texts.forEach((t) => { result[t.key] = { id: t.valueId ?? undefined, en: t.valueEn ?? undefined }; });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "text_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk mengedit teks" }, { status: 403 });

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Format teks tidak valid." }, { status: 400 });

  const updates: { key: string; valueId: string }[] = [];
  for (const [key, raw] of Object.entries(body)) {
    const field = HOME_TEXT_FIELDS.find((item) => item.key === key);
    if (!field) return NextResponse.json({ error: `Teks "${key}" tidak bisa diubah dari CMS.` }, { status: 400 });
    const value = typeof raw === "string" ? raw : (raw && typeof raw === "object" ? (raw as { id?: unknown }).id : undefined);
    if (typeof value !== "string") return NextResponse.json({ error: `Isi "${field.label}" tidak valid.` }, { status: 422 });
    const trimmed = value.trim();
    if (trimmed.length > field.maxLength)
      return NextResponse.json({ error: `"${field.label}" maksimal ${field.maxLength} karakter.` }, { status: 422 });
    if (field.kind === "image" && trimmed && !/^https:\/\//.test(trimmed))
      return NextResponse.json({ error: "Foto beranda harus berupa link https." }, { status: 422 });
    updates.push({ key, valueId: trimmed });
  }
  if (updates.length === 0) return NextResponse.json({ error: "Tidak ada perubahan untuk disimpan." }, { status: 400 });

  try {
    await Promise.all(updates.map(({ key, valueId }) =>
      prisma.siteText.upsert({
        where: { key },
        update: { valueId },
        create: { key, valueId },
      }),
    ));

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "TEXTS",
      detail: "Update teks beranda",
    });

    await revalidatePublicContent({ paths: ["/"] });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
