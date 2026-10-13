import { tourContentChange } from "@/lib/indexnow-content";
/* POST /api/tours/import — buat banyak tour sekaligus.
   Body: { status?: "DRAFT" | "ACTIVE", tours: [{ title, country, tripDate?, duration?, heroImg?, price? }, ...] }
   Default DRAFT (tidak tampil). ACTIVE butuh izin ubah status, sama seperti form tour. */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermissions } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { uniqueTourSlug } from "@/lib/tour-slug";

const MAX_IMPORT_ROWS = 200;

interface ImportRow {
  title?: unknown;
  country?: unknown;
  tripDate?: unknown;
  duration?: unknown;
  heroImg?: unknown;
  price?: unknown;
}

function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const status = body?.status === "ACTIVE" ? "ACTIVE" : "DRAFT";
  const requiredPermissions = status === "ACTIVE" ? ["tour_create", "tour_status"] : ["tour_create"];
  if (!(await checkPermissions(session, requiredPermissions)))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat tour dengan status tersebut" }, { status: 403 });

  const rows: ImportRow[] = Array.isArray(body?.tours) ? body.tours : [];
  if (rows.length > MAX_IMPORT_ROWS)
    return NextResponse.json({ error: `Maksimal ${MAX_IMPORT_ROWS} baris sekali import.` }, { status: 422 });

  const valid = rows
    .map((row) => ({
      title: text(row.title, 200),
      country: text(row.country, 120),
      tripDate: text(row.tripDate, 40),
      duration: text(row.duration, 80),
      heroImg: text(row.heroImg, 500),
      price: Number(row.price),
    }))
    .filter((row) => row.title && row.country);

  if (valid.length === 0)
    return NextResponse.json({ error: "Tidak ada baris valid (judul & negara wajib diisi)" }, { status: 400 });

  // Dibuat satu per satu supaya setiap slug unik terhadap baris sebelumnya.
  const created = [];
  for (const row of valid) {
    const date = row.tripDate ? new Date(row.tripDate) : null;
    const slug = await uniqueTourSlug(row.title);
    created.push(await prisma.tour.create({
      data: {
        title: row.title,
        slug,
        country: row.country,
        price: Number.isFinite(row.price) && row.price > 0 ? Math.round(row.price) : 0,
        status,
        tripDate: date && Number.isFinite(date.getTime()) ? date : null,
        duration: row.duration || null,
        heroImg: row.heroImg.startsWith("https://") ? row.heroImg : null,
      },
    }));
  }

  await logActivity({
    userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
    userRole: session.user.role, action: "CREATE", resource: "TOUR",
    detail: `Import ${created.length} tour (${status === "ACTIVE" ? "Aktif" : "Draft"})`,
  });

  const paths = [...new Set(created.flatMap((tour) => tourContentChange(null, tour).paths))];
  if (paths.length) await revalidatePublicContent({ paths });
  return NextResponse.json({ created: created.length }, { status: 201 });
}
