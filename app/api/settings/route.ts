import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export async function GET() {
  const items = await prisma.companyInfo.findMany();
  const result: Record<string, string> = {};
  items.forEach((i) => { result[i.key] = i.value; });
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body: Record<string, string> = await req.json();
  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.companyInfo.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  revalidateTag("site-colors");
  return NextResponse.json({ success: true });
}
