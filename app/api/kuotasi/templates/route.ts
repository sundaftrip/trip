import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { listTemplates } from "@/lib/kuotasi/data";
import type { CostCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_view")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const rows = await listTemplates({ country, category });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_edit")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body: {
    category: CostCategory;
    country: string;
    city?: string | null;
    label: string;
    currency?: string;
    valueForeign?: number | null;
    valueIdr?: number | null;
    perPax?: boolean;
    notes?: string | null;
  } = await req.json();

  const tpl = await prisma.costComponentTemplate.create({
    data: {
      category: body.category,
      country: body.country,
      city: body.city ?? null,
      label: body.label,
      currency: body.currency ?? "IDR",
      valueForeign: body.valueForeign ?? null,
      valueIdr: body.valueIdr ?? null,
      perPax: body.perPax ?? true,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(tpl, { status: 201 });
}
