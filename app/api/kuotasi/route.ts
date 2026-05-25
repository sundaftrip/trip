import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { listQuotations } from "@/lib/kuotasi/data";
import { COUNTRY_CURRENCY } from "@/lib/kuotasi/calc";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_view")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const rows = await listQuotations();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "kuotasi_create")))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  const body = await req.json();
  const country = body.country || "Rusia";
  const preset = COUNTRY_CURRENCY[country];
  const durationDays = Math.max(1, Math.min(60, Number(body.durationDays) || 7));

  const q = await prisma.quotation.create({
    data: {
      title: body.title || `Kuotasi ${country}`,
      country,
      durationDays,
      currency: body.currency || preset?.currency || "USD",
      kursForeign: Number(body.kursForeign ?? preset?.defaultRate ?? 1),
      marginPct: Number(body.marginPct ?? 10),
      roundIdrTo: Number(body.roundIdrTo ?? 100000),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      notes: body.notes || null,
      // Seed days kosong sebanyak durationDays — supaya editor langsung punya skeleton.
      days: {
        create: Array.from({ length: durationDays }, (_, i) => ({
          dayIndex: i + 1,
          title: "",
          narrativeHtml: "",
        })),
      },
    },
    include: { days: true },
  });

  await logActivity({
    userId: session.user.id!,
    userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role,
    action: "CREATE",
    resource: "KUOTASI",
    resourceId: q.id,
    resourceName: q.title,
  });

  return NextResponse.json(q, { status: 201 });
}
