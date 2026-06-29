import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildLeadRecommendation } from "@/lib/ai-ops";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { inquiryId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const inquiryId = body.inquiryId?.trim();
  if (!inquiryId) {
    return NextResponse.json({ error: "inquiryId wajib diisi." }, { status: 422 });
  }

  const today = new Date();
  const [inquiry, tours] = await Promise.all([
    prisma.inquiry.findUnique({ where: { id: inquiryId } }),
    prisma.tour.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ tripDate: null }, { tripDate: { gte: today } }],
      },
      orderBy: [{ tripDate: "asc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        country: true,
        cityHighlight: true,
        price: true,
        promoPrice: true,
        seatsLeft: true,
        tripDate: true,
        duration: true,
      },
    }),
  ]);

  if (!inquiry) {
    return NextResponse.json({ error: "Lead tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    recommendation: buildLeadRecommendation(inquiry, tours),
  });
}
