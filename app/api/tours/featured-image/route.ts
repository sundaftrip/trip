import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tour = await prisma.tour.findFirst({
      where: { status: "ACTIVE", heroImg: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { heroImg: true },
    });
    return NextResponse.json({ image: tour?.heroImg ?? null });
  } catch {
    return NextResponse.json({ image: null });
  }
}
