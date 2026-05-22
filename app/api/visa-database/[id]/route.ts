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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await prisma.countryVisa.findUnique({ where: { id } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as VisaInput;
  const data = pickInput(body);
  if (!data.name || !data.visa) {
    return NextResponse.json({ error: "Nama negara & jenis visa wajib diisi." }, { status: 400 });
  }

  const entry = await prisma.countryVisa.update({ where: { id }, data });
  return NextResponse.json(entry);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.countryVisa.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
