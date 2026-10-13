import { tourContentChange } from "@/lib/indexnow-content";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermissions } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { pickInput, badNumber, normalizeTourInput, normalizeTourPaymentPlanInput, TOUR_INPUT_FIELDS, VALID_TOUR_STATUSES } from "@/lib/api-input";
import { apiError } from "@/lib/api-error";
import { MAX_PINNED_TOURS } from "@/lib/tour-order";
import type { Prisma } from "@prisma/client";
import slugify from "slugify";
import { uniqueTourSlug } from "@/lib/tour-slug";

const PUBLIC_TOUR_STATUSES = ["ACTIVE", "FULL"] as const;

// Keep the API response independent from the database model. In particular,
// expenseToken is a finance capability URL and must never leave this route.
const TOUR_READ_SELECT = {
  id: true,
  title: true,
  slug: true,
  country: true,
  cityHighlight: true,
  price: true,
  promoPrice: true,
  priceLandTour: true,
  seatsLeft: true,
  status: true,
  pinned: true,
  tripDate: true,
  duration: true,
  itinerary: true,
  inclusions: true,
  exclusions: true,
  gallery: true,
  hotel: true,
  visaInfo: true,
  heroImg: true,
  badge: true,
  notes: true,
  description: true,
  addOns: true,
  paymentPlan: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.TourSelect;

async function hasPersistedAuthenticatedSession() {
  try {
    const userId = (await auth())?.user?.id;
    if (!userId) return false;

    return Boolean(await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    }));
  } catch {
    // Authentication and user lookup failures degrade to the public view.
    return false;
  }
}

async function pinnedLimitReached() {
  const count = await prisma.tour.count({ where: { pinned: true } });
  return count >= MAX_PINNED_TOURS;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const country = searchParams.get("country");

  if (status && !VALID_TOUR_STATUSES.includes(status as (typeof VALID_TOUR_STATUSES)[number])) {
    return NextResponse.json({ error: "Status tour tidak valid." }, { status: 400 });
  }

  const authenticated = await hasPersistedAuthenticatedSession();
  if (
    !authenticated
    && status
    && !PUBLIC_TOUR_STATUSES.includes(status as (typeof PUBLIC_TOUR_STATUSES)[number])
  ) {
    return NextResponse.json([]);
  }

  const where: Prisma.TourWhereInput = {};
  if (status) {
    where.status = status as (typeof VALID_TOUR_STATUSES)[number];
  } else if (!authenticated) {
    where.status = { in: [...PUBLIC_TOUR_STATUSES] };
  }
  if (country) where.country = country;

  const tours = await prisma.tour.findMany({
    where,
    select: TOUR_READ_SELECT,
    orderBy: { createdAt: "desc" },
  });
  const response = NextResponse.json(tours);
  if (authenticated) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Whitelist field — hanya kolom Tour yang sah yang diteruskan ke Prisma
  const picked = pickInput(body, TOUR_INPUT_FIELDS);

  // Validasi ringan
  if (typeof picked.title !== "string" || !picked.title.trim())
    return NextResponse.json({ error: "Judul tour wajib diisi." }, { status: 422 });
  if (typeof picked.country !== "string" || !picked.country.trim())
    return NextResponse.json({ error: "Negara wajib diisi." }, { status: 422 });
  if (badNumber(picked.price) || badNumber(picked.promoPrice) || badNumber(picked.priceLandTour) || badNumber(picked.seatsLeft))
    return NextResponse.json({ error: "Harga/kursi harus berupa angka dan tidak boleh negatif." }, { status: 422 });
  if (picked.status !== undefined && !VALID_TOUR_STATUSES.includes(picked.status as (typeof VALID_TOUR_STATUSES)[number]))
    return NextResponse.json({ error: "Status tour tidak valid." }, { status: 422 });
  picked.status ??= "DRAFT";
  const requiredPermissions = picked.status === "DRAFT"
    ? ["tour_create"]
    : ["tour_create", "tour_status"];
  if (!await checkPermissions(session, requiredPermissions))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat tour dengan status tersebut" }, { status: 403 });
  if (picked.pinned !== undefined && typeof picked.pinned !== "boolean")
    return NextResponse.json({ error: "Pin tour harus bernilai benar/salah." }, { status: 422 });
  if (picked.pinned === true && await pinnedLimitReached())
    return NextResponse.json({ error: `Maksimal ${MAX_PINNED_TOURS} tour bisa dipin. Unpin salah satu tour dulu.` }, { status: 422 });
  if ("paymentPlan" in picked) {
    const paymentPlan = normalizeTourPaymentPlanInput(picked.paymentPlan);
    if (!paymentPlan.ok) return NextResponse.json({ error: paymentPlan.error }, { status: 422 });
    picked.paymentPlan = paymentPlan.value;
  }
  const normalized = normalizeTourInput(picked);
  if (!normalized.ok) return NextResponse.json({ error: normalized.error }, { status: 422 });
  const data = normalized.value;
  if (typeof data.price !== "number") data.price = 0;

  // Slug dikelola server: pakai slug templat bila ada, selain itu dari judul.
  const requestedSlug = typeof data.slug === "string"
    ? slugify(data.slug, { lower: true, strict: true })
    : "";
  data.slug = requestedSlug || await uniqueTourSlug(data.title as string);

  try {
    const tour = await prisma.tour.create({ data: data as unknown as Prisma.TourUncheckedCreateInput });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "CREATE", resource: "TOUR",
      resourceId: tour.id, resourceName: tour.title,
      detail: `Status ${tour.status === "DRAFT" ? "Draft" : tour.status === "ACTIVE" ? "Aktif" : tour.status === "FULL" ? "Penuh" : "Batal"}`,
    });

    await revalidatePublicContent(tourContentChange(null, tour));
    return NextResponse.json(tour, { status: 201 });
  } catch (err) {
    return apiError(err, { duplicate: "Slug tour sudah dipakai." });
  }
}
