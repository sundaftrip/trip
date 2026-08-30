import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/revalidate";
import { parseVisaServiceInput, visaServiceUpdateData, VisaServiceInputError } from "@/lib/visa-service-input";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await prisma.countryVisa.findUnique({
    where: { id },
    include: { variants: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const input = parseVisaServiceInput(await req.json(), "update");
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.countryVisa.findUnique({
        where: { id }, select: { id: true, variants: { select: { id: true } } },
      });
      if (!existing) return null;
      // Verify ownership before writing anything. Retained IDs are updated in
      // place so references from catalog visa plans do not break on every edit.
      const data = visaServiceUpdateData(input, existing.variants.map((variant) => variant.id));
      return tx.countryVisa.update({
        where: { id }, data,
        include: { variants: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
      });
    });
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    revalidatePublicContent();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof VisaServiceInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan layanan visa. Muat ulang data dan coba lagi." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // VisaVariant otomatis ke-cascade lewat onDelete: Cascade di schema.
  await prisma.countryVisa.delete({ where: { id } });
  revalidatePublicContent();
  return NextResponse.json({ success: true });
}
