import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { pickInput, badNumber, TOUR_INPUT_FIELDS, VALID_TOUR_STATUSES } from "@/lib/api-input";
import { apiError } from "@/lib/api-error";
import { MAX_PINNED_TOURS } from "@/lib/tour-order";
import type { Prisma } from "@prisma/client";
import slugify from "slugify";

/** Slug URL rapi & unik dari judul tour (mis. "Russia Aurora" → "russia-aurora"). */
async function uniqueTourSlug(title: string): Promise<string> {
  const base = slugify(title || "tour", { lower: true, strict: true }) || "tour";
  let s = base;
  let i = 2;
  while (await prisma.tour.findUnique({ where: { slug: s } })) s = `${base}-${i++}`;
  return s;
}

async function pinnedLimitReached() {
  const count = await prisma.tour.count({ where: { pinned: true } });
  return count >= MAX_PINNED_TOURS;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const country = searchParams.get("country");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (country) where.country = country;

  const tours = await prisma.tour.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(tours);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "tour_create"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat tour" }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Whitelist field — hanya kolom Tour yang sah yang diteruskan ke Prisma
  const data = pickInput(body, TOUR_INPUT_FIELDS);

  // Validasi ringan
  if (typeof data.title !== "string" || !data.title.trim())
    return NextResponse.json({ error: "Judul tour wajib diisi." }, { status: 422 });
  if (typeof data.country !== "string" || !data.country.trim())
    return NextResponse.json({ error: "Negara wajib diisi." }, { status: 422 });
  if (badNumber(data.price) || badNumber(data.promoPrice) || badNumber(data.priceLandTour) || badNumber(data.seatsLeft))
    return NextResponse.json({ error: "Harga/kursi harus berupa angka dan tidak boleh negatif." }, { status: 422 });
  if (data.status !== undefined && !VALID_TOUR_STATUSES.includes(data.status as (typeof VALID_TOUR_STATUSES)[number]))
    return NextResponse.json({ error: "Status tour tidak valid." }, { status: 422 });
  if (data.pinned !== undefined && typeof data.pinned !== "boolean")
    return NextResponse.json({ error: "Pin tour harus bernilai benar/salah." }, { status: 422 });
  if (data.pinned === true && await pinnedLimitReached())
    return NextResponse.json({ error: `Maksimal ${MAX_PINNED_TOURS} tour bisa dipin. Unpin salah satu tour dulu.` }, { status: 422 });

  if (!data.slug) data.slug = await uniqueTourSlug(data.title);

  try {
    const tour = await prisma.tour.create({ data: data as unknown as Prisma.TourUncheckedCreateInput });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "CREATE", resource: "TOUR",
      resourceId: tour.id, resourceName: tour.title,
    });

    revalidatePublicContent();
    return NextResponse.json(tour, { status: 201 });
  } catch (err) {
    return apiError(err, { duplicate: "Slug tour sudah dipakai." });
  }
}
