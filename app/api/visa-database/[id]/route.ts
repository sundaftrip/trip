import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/revalidate";

type VariantInput = {
  id?: string;
  sortOrder?: number;
  name?: string;
  priceIDR?: number | null;
  processingTime?: string | null;
  notes?: string | null;
};

type DocInput = { name?: string; hint?: string };
type FaqInput = { question?: string; answer?: string };

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
  eligibility?: string[];
  documents?: DocInput[];
  faqs?: FaqInput[];
  variants?: VariantInput[];
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
    eligibility: Array.isArray(body.eligibility)
      ? body.eligibility.map((s) => (s ?? "").toString().trim()).filter(Boolean)
      : [],
    documents: Array.isArray(body.documents)
      ? body.documents
          .map((d) => ({
            name: (d?.name ?? "").toString().trim(),
            hint: (d?.hint ?? "").toString().trim() || undefined,
          }))
          .filter((d) => d.name.length > 0)
      : [],
    faqs: Array.isArray(body.faqs)
      ? body.faqs
          .map((f) => ({
            question: (f?.question ?? "").toString().trim(),
            answer: (f?.answer ?? "").toString().trim(),
          }))
          .filter((f) => f.question.length > 0 && f.answer.length > 0)
      : [],
  };
}

function normalizeVariants(raw: VariantInput[] | undefined) {
  if (!Array.isArray(raw)) return null; // null = jangan sentuh variant
  return raw
    .filter((v) => (v.name ?? "").trim().length > 0)
    .map((v, i) => {
      const priceNum =
        typeof v.priceIDR === "number" && Number.isFinite(v.priceIDR) && v.priceIDR >= 0
          ? Math.round(v.priceIDR)
          : null;
      return {
        sortOrder: typeof v.sortOrder === "number" ? v.sortOrder : i,
        name: (v.name ?? "").toString().trim(),
        priceIDR: priceNum,
        processingTime: ((v.processingTime ?? "") as string).toString().trim() || null,
        notes: ((v.notes ?? "") as string).toString().trim() || null,
      };
    });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await prisma.countryVisa.findUnique({
    where: { id },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
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
  const variantData = normalizeVariants(body.variants);

  // Atomic: update country + replace variants (delete-then-create) dalam 1 transaksi.
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.countryVisa.update({ where: { id }, data });
    if (variantData !== null) {
      await tx.visaVariant.deleteMany({ where: { countryVisaId: id } });
      if (variantData.length > 0) {
        await tx.visaVariant.createMany({
          data: variantData.map((v) => ({ ...v, countryVisaId: id })),
        });
      }
    }
    return tx.countryVisa.findUnique({
      where: { id: updated.id },
      include: { variants: { orderBy: { sortOrder: "asc" } } },
    });
  });

  revalidatePublicContent(); // /visa & /visa/[slug] kini ISR — segarkan langsung
  return NextResponse.json(result);
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
