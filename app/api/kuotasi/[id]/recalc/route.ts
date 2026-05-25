import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { recalcPricing } from "@/lib/kuotasi/data";
import { DEFAULT_PAX_TIERS } from "@/lib/kuotasi/calc";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_edit")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const { id } = await params;
  let paxList: number[] = [...DEFAULT_PAX_TIERS];
  try {
    const body = await req.json();
    if (Array.isArray(body?.paxList) && body.paxList.length > 0) {
      paxList = body.paxList.map((n: number) => Math.max(1, Math.round(Number(n)))).sort((a: number, b: number) => a - b);
    }
  } catch {
    // tidak ada body → pakai default
  }

  const pricings = await recalcPricing(id, paxList);
  return NextResponse.json({ ok: true, pricings });
}
