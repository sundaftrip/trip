import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TourForm, { type TourData } from "@/components/admin/TourForm";

type EditTourSearchParams = {
  returnTo?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function safeReturnHref(value?: string | string[]) {
  const returnTo = firstParam(value);
  if (returnTo === "/admin/tours" || returnTo.startsWith("/admin/tours?")) return returnTo;
  return "/admin/tours";
}

export default async function EditTourPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<EditTourSearchParams>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const returnHref = safeReturnHref(sp.returnTo);
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Tour</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tour.title}</p>
      </div>
      <TourForm returnHref={returnHref} tour={{
        id: tour.id,
        title: tour.title,
        country: tour.country,
        cityHighlight: tour.cityHighlight ?? undefined,
        price: tour.price,
        promoPrice: tour.promoPrice ?? null,
        priceLandTour: tour.priceLandTour ?? null,
        seatsLeft: tour.seatsLeft,
        status: tour.status,
        pinned: tour.pinned,
        tripDate: tour.tripDate?.toISOString(),
        duration: tour.duration ?? undefined,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        gallery: tour.gallery,
        heroImg: tour.heroImg ?? undefined,
        badge: tour.badge ?? undefined,
        notes: tour.notes ?? undefined,
        description: tour.description ?? undefined,
        visaInfo: tour.visaInfo ?? undefined,
        itinerary: (tour.itinerary as { day: number; title: string; description: string }[]) ?? [],
        addOns: (tour.addOns as { name: string; price: number }[]) ?? [],
        paymentPlan: tour.paymentPlan as TourData["paymentPlan"],
      }} />
    </div>
  );
}
