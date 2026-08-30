import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermissions } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";
import { revalidatePublicContent } from "@/lib/revalidate";
import { pickInput, badNumber, normalizeTourPaymentPlanInput, TOUR_INPUT_FIELDS, VALID_TOUR_STATUSES } from "@/lib/api-input";
import { apiError } from "@/lib/api-error";
import { MAX_PINNED_TOURS } from "@/lib/tour-order";
import type { Prisma } from "@prisma/client";
import slugify from "slugify";
import { getTourVisaCountries } from "@/lib/tour-visa-data";
import { prepareTourVisaWrite, tourVisaReadDto } from "@/lib/tour-visa-publishing";

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
  const response = NextResponse.json(tours.map((tour) => tourVisaReadDto(tour, authenticated)));
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
  data.status ??= "DRAFT";
  const requiredPermissions = data.status === "DRAFT"
    ? ["tour_create"]
    : ["tour_create", "tour_status"];
  if (!await checkPermissions(session, requiredPermissions))
    return NextResponse.json({ error: "Tidak memiliki izin untuk membuat tour dengan status tersebut" }, { status: 403 });
  if (data.pinned !== undefined && typeof data.pinned !== "boolean")
    return NextResponse.json({ error: "Pin tour harus bernilai benar/salah." }, { status: 422 });
  if (data.pinned === true && await pinnedLimitReached())
    return NextResponse.json({ error: `Maksimal ${MAX_PINNED_TOURS} tour bisa dipin. Unpin salah satu tour dulu.` }, { status: 422 });
  if ("paymentPlan" in data) {
    const paymentPlan = normalizeTourPaymentPlanInput(data.paymentPlan);
    if (!paymentPlan.ok) return NextResponse.json({ error: paymentPlan.error }, { status: 422 });
    data.paymentPlan = paymentPlan.value;
  }

  if (!data.slug) data.slug = await uniqueTourSlug(data.title);

  try {
    const visaWrite = prepareTourVisaWrite({ ...data, ...("visaPlan" in body ? { visaPlan: body.visaPlan } : {}), visaReviewConfirmed: body.visaReviewConfirmed, visaReviewFingerprint: body.visaReviewFingerprint }, null, await getTourVisaCountries());
    if (!visaWrite.ok) return NextResponse.json({ error: visaWrite.error }, { status: 422 });
    data.itinerary = visaWrite.itinerary;
    const tour = await prisma.tour.create({ data: data as unknown as Prisma.TourUncheckedCreateInput });

    await logActivity({
      userId: session.user.id!, userName: session.user.name ?? session.user.email ?? "-",
      userRole: session.user.role, action: "CREATE", resource: "TOUR",
      resourceId: tour.id, resourceName: tour.title,
    });

    revalidatePublicContent();
    return NextResponse.json(tourVisaReadDto(tour, true), { status: 201 });
  } catch (err) {
    return apiError(err, { duplicate: "Slug tour sudah dipakai." });
  }
}
