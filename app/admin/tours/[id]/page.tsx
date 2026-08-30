import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TourForm, { type TourData } from "@/components/admin/TourForm";
import { getTourVisaEditorCountries } from "@/lib/tour-visa-data";
import { readTourItinerary, readTourVisaPlan } from "@/lib/tour-visa-plan";

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
  const [tour, countries] = await Promise.all([prisma.tour.findUnique({ where: { id } }), getTourVisaEditorCountries()]);
  if (!tour) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Tour</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tour.title}</p>
      </div>
      <TourForm countries={countries} returnHref={returnHref} tour={{
        id: tour.id,
        slug: tour.slug ?? undefined,
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
        hotel: tour.hotel as TourData["hotel"],
        heroImg: tour.heroImg ?? undefined,
        badge: tour.badge ?? undefined,
        notes: tour.notes ?? undefined,
        description: tour.description ?? undefined,
        visaInfo: tour.visaInfo ?? undefined,
        itinerary: readTourItinerary(tour.itinerary),
        visaPlan: readTourVisaPlan(tour.itinerary),
        addOns: (tour.addOns as { name: string; price: number }[]) ?? [],
        paymentPlan: tour.paymentPlan as TourData["paymentPlan"],
      }} />
    </div>
  );
}
