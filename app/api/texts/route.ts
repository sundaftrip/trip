import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

export async function GET() {
  const texts = await prisma.siteText.findMany();
  const result: Record<string, { id?: string; en?: string }> = {};
  texts.forEach((t) => { result[t.key] = { id: t.valueId ?? undefined, en: t.valueEn ?? undefined }; });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "text_edit"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk mengedit teks" }, { status: 403 });

  const body: Record<string, { id?: string; en?: string }> = await req.json();
  await Promise.all(
    Object.entries(body).map(([key, val]) =>
      prisma.siteText.upsert({
        where: { key },
        update: { valueId: val.id, valueEn: val.en },
        create: { key, valueId: val.id, valueEn: val.en },
      })
    )
  );

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "UPDATE", resource: "TEXTS",
    detail: `Update ${Object.keys(body).join(", ")}`,
  });

  return NextResponse.json({ success: true });
}
