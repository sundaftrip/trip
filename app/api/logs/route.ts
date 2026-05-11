import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 50;
  const resource = searchParams.get("resource");
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = {};
  if (resource) where.resource = resource;
  if (action) where.action = action;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}

export async function DELETE() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.activityLog.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
  });

  return NextResponse.json({ success: true });
}
