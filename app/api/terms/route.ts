import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const terms = await prisma.termsCondition.findFirst();
  return NextResponse.json(terms ?? { bodyId: "", bodyEn: "" });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bodyId, bodyEn } = await req.json();
  const existing = await prisma.termsCondition.findFirst();

  const terms = existing
    ? await prisma.termsCondition.update({ where: { id: existing.id }, data: { bodyId, bodyEn } })
    : await prisma.termsCondition.create({ data: { bodyId, bodyEn } });

  return NextResponse.json(terms);
}
