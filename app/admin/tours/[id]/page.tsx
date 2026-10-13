import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TourForm, { type TourData } from "@/components/admin/TourForm";
import { can, requireAdminModule } from "@/lib/admin-access";
import { adminTourVisibility } from "@/lib/admin-tour-checks";
import { canonicalTourPath } from "@/lib/seo-routes";
import { formatDate } from "@/lib/utils";

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
  const viewer = await requireAdminModule("tours");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const returnHref = safeReturnHref(sp.returnTo);
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) notFound();
  const visibility = adminTourVisibility(tour);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Tour</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tour.title} · {visibility.label} · terakhir diubah {formatDate(tour.updatedAt)}
        </p>
      </div>
      <TourForm
        returnHref={returnHref}
        canChangeStatus={can(viewer, "tour_status")}
        canPin={can(viewer, "tour_edit")}
        publicHref={visibility.visible ? canonicalTourPath(tour) : null}
        tour={{
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
          itinerary: Array.isArray(tour.itinerary) ? tour.itinerary as unknown as TourData["itinerary"] : [],
          addOns: Array.isArray(tour.addOns) ? tour.addOns as unknown as TourData["addOns"] : [],
          paymentPlan: tour.paymentPlan as TourData["paymentPlan"],
        }}
      />
    </div>
  );
}
