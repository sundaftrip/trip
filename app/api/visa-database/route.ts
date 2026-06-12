import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type VisaInput = {
  sortOrder?: number;
  flag?: string;
  name?: string;
  en?: string;
  region?: string;
  visa?: string;
  stay?: string;
  cost?: string;
  notes?: string;
};

function pickInput(body: VisaInput) {
  return {
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    flag: (body.flag ?? "").toString(),
    name: (body.name ?? "").toString(),
    en: (body.en ?? "").toString(),
    region: (body.region ?? "").toString(),
    visa: (body.visa ?? "").toString(),
    stay: (body.stay ?? "").toString(),
    cost: (body.cost ?? "").toString(),
    notes: (body.notes ?? "").toString(),
  };
}

export async function GET() {
  const items = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(items, {
    // Data publik — boleh di-cache CDN. Alur admin tidak membaca lewat
    // endpoint ini (halaman admin pakai Prisma langsung / route [id]).
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as VisaInput;
  const data = pickInput(body);
  if (!data.name || !data.visa) {
    return NextResponse.json({ error: "Nama negara & jenis visa wajib diisi." }, { status: 400 });
  }

  const entry = await prisma.countryVisa.create({ data });
  return NextResponse.json(entry, { status: 201 });
}
