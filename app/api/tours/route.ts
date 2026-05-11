import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const country = searchParams.get("country");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (country) where.country = country;

  const tours = await prisma.tour.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(tours);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "tour_create"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat tour" }, { status: 403 });

  const body = await req.json();
  const tour = await prisma.tour.create({ data: body });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "CREATE", resource: "TOUR",
    resourceId: tour.id, resourceName: tour.title,
  });

  return NextResponse.json(tour, { status: 201 });
}
