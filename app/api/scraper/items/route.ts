import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "scraper_view"))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (platform) where.sourcePlatform = platform;

  const items = await prisma.scrapedContent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { blog: { select: { id: true, title: true, published: true } } },
    take: 100,
  });

  return NextResponse.json(items);
}
