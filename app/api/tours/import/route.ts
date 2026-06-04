/* POST /api/tours/import — buat banyak tour sekaligus (mis. arsip trip selesai).
   Body: { tours: [{ title, country, tripDate?, duration?, heroImg?, price? }, ...] } */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";

interface ImportRow {
  title?: string;
  country?: string;
  tripDate?: string;
  duration?: string;
  heroImg?: string;
  price?: number;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkPermission(session, "tour_create")))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat tour" }, { status: 403 });

  const body = await req.json();
  const rows: ImportRow[] = Array.isArray(body?.tours) ? body.tours : [];

  const data = rows
    .filter((r) => r.title?.trim() && r.country?.trim())
    .map((r) => {
      const d = r.tripDate ? new Date(r.tripDate) : null;
      return {
        title: r.title!.trim(),
        country: r.country!.trim(),
        price: typeof r.price === "number" && r.price > 0 ? r.price : 0,
        status: "ACTIVE" as const,
        tripDate: d && !isNaN(d.getTime()) ? d : null,
        duration: r.duration?.trim() || null,
        heroImg: r.heroImg?.trim() || null,
      };
    });

  if (data.length === 0)
    return NextResponse.json({ error: "Tidak ada baris valid (judul & negara wajib diisi)" }, { status: 400 });

  const result = await prisma.tour.createMany({ data });

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "CREATE", resource: "TOUR",
    detail: `Import massal ${result.count} tour`,
  });

  revalidatePublicContent();
  return NextResponse.json({ created: result.count }, { status: 201 });
}
