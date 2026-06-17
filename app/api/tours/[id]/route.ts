import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { pickInput, badNumber, normalizeTourPaymentPlanInput, TOUR_INPUT_FIELDS, VALID_TOUR_STATUSES } from "@/lib/api-input";
import { apiError } from "@/lib/api-error";
import { MAX_PINNED_TOURS } from "@/lib/tour-order";
import type { Prisma } from "@prisma/client";

async function pinnedLimitReached(excludeId: string) {
  const count = await prisma.tour.count({ where: { pinned: true, id: { not: excludeId } } });
  return count >= MAX_PINNED_TOURS;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tour);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const permKey = "status" in body && Object.keys(body).length === 1 ? "tour_status" : "tour_edit";
  if (!await checkPermission(session, permKey))
    return NextResponse.json({ error: "Tidak memiliki izin" }, { status: 403 });

  // Whitelist field — hanya kolom Tour yang sah yang diteruskan ke Prisma
  const data = pickInput(body, TOUR_INPUT_FIELDS);

  // Validasi ringan (update parsial — hanya field yang dikirim yang dicek)
  if (badNumber(data.price) || badNumber(data.promoPrice) || badNumber(data.priceLandTour) || badNumber(data.seatsLeft))
    return NextResponse.json({ error: "Harga/kursi harus berupa angka dan tidak boleh negatif." }, { status: 422 });
  if (data.status !== undefined && !VALID_TOUR_STATUSES.includes(data.status as (typeof VALID_TOUR_STATUSES)[number]))
    return NextResponse.json({ error: "Status tour tidak valid." }, { status: 422 });
  if (data.pinned !== undefined && typeof data.pinned !== "boolean")
    return NextResponse.json({ error: "Pin tour harus bernilai benar/salah." }, { status: 422 });
  if (data.pinned === true && await pinnedLimitReached(id))
    return NextResponse.json({ error: `Maksimal ${MAX_PINNED_TOURS} tour bisa dipin. Unpin salah satu tour dulu.` }, { status: 422 });
  if ("paymentPlan" in data) {
    const paymentPlan = normalizeTourPaymentPlanInput(data.paymentPlan);
    if (!paymentPlan.ok) return NextResponse.json({ error: paymentPlan.error }, { status: 422 });
    data.paymentPlan = paymentPlan.value;
  }

  try {
    const tour = await prisma.tour.update({
      where: { id },
      data: data as unknown as Prisma.TourUncheckedUpdateInput,
    });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "UPDATE", resource: "TOUR",
      resourceId: tour.id, resourceName: tour.title,
      detail: "status" in body && Object.keys(body).length === 1 ? `Status → ${body.status}` : undefined,
    });

    revalidatePublicContent();
    return NextResponse.json(tour);
  } catch (err) {
    return apiError(err, { duplicate: "Slug tour sudah dipakai." });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await checkPermission(session, "tour_delete"))
    return NextResponse.json({ error: "Tidak memiliki izin untuk menghapus tour" }, { status: 403 });

  const { id } = await params;
  try {
    const tour = await prisma.tour.findUnique({ where: { id }, select: { title: true } });
    await prisma.tour.delete({ where: { id } });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "DELETE", resource: "TOUR",
      resourceId: id, resourceName: tour?.title,
    });

    revalidatePublicContent();
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err);
  }
}
