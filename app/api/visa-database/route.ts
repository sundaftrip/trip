import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/revalidate";
import { parseVisaServiceInput, visaServiceCreateData, VisaServiceInputError } from "@/lib/visa-service-input";

export async function GET() {
  const items = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { variants: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  return NextResponse.json(items, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = visaServiceCreateData(parseVisaServiceInput(await req.json(), "create"));
    // Prisma's nested create commits the country and all variants together.
    const entry = await prisma.countryVisa.create({
      data,
      include: { variants: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    });
    revalidatePublicContent();
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof VisaServiceInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan layanan visa. Coba lagi." }, { status: 500 });
  }
}
