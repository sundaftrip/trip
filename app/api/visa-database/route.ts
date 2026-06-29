import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/revalidate";

type VisaInput = {
  sortOrder?: number;
  flag?: string;
  name?: string;
  en?: string;
  region?: string;
  visa?: string;
  stay?: string;
  cost?: string;
  officialFee?: string | null;
  servicePrice?: string | null;
  notes?: string;
  conditions?: string[];
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
};

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pickInput(body: VisaInput) {
  const lastVerifiedAt = (body.lastVerifiedAt ?? "").toString().trim();
  return {
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    flag: (body.flag ?? "").toString(),
    name: (body.name ?? "").toString(),
    en: (body.en ?? "").toString(),
    region: (body.region ?? "").toString(),
    visa: (body.visa ?? "").toString(),
    stay: (body.stay ?? "").toString(),
    cost: (body.cost ?? "").toString(),
    officialFee: ((body.officialFee ?? "") as string).toString().trim() || null,
    servicePrice: ((body.servicePrice ?? "") as string).toString().trim() || null,
    notes: (body.notes ?? "").toString(),
    conditions: Array.isArray(body.conditions)
      ? body.conditions.map((s) => (s ?? "").toString().trim()).filter(Boolean)
      : [],
    sourceUrl: ((body.sourceUrl ?? "") as string).toString().trim() || null,
    lastVerifiedAt: parseDate(lastVerifiedAt),
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
  revalidatePublicContent(); // /visa & /visa/[slug] kini ISR — segarkan langsung
  return NextResponse.json(entry, { status: 201 });
}
