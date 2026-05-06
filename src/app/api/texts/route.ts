import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const texts = await prisma.siteText.findMany();
  const result: Record<string, { id?: string; en?: string }> = {};
  texts.forEach((t) => {
    result[t.key] = { id: t.valueId ?? undefined, en: t.valueEn ?? undefined };
  });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({ success: true });
}
