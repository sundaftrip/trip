import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const country = searchParams.get("country");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (country) where.country = country;

  const tours = await prisma.tour.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tours);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tour = await prisma.tour.create({ data: body });
  return NextResponse.json(tour, { status: 201 });
}
