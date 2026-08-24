import TourForm, { type TourData } from "@/components/admin/TourForm";
import { CANADA_ROCKIES_TOUR } from "@/data/catalog/canada-rockies-april-2027";

type NewTourSearchParams = {
  template?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function canadaRockiesTemplate(): TourData {
  return {
    ...CANADA_ROCKIES_TOUR,
    status: "ACTIVE",
    tripDate: CANADA_ROCKIES_TOUR.tripDate.toISOString(),
    inclusions: [...CANADA_ROCKIES_TOUR.inclusions],
    exclusions: [...CANADA_ROCKIES_TOUR.exclusions],
    gallery: [...CANADA_ROCKIES_TOUR.gallery],
    hotel: { ...CANADA_ROCKIES_TOUR.hotel },
    itinerary: CANADA_ROCKIES_TOUR.itinerary.map((item) => ({ ...item })),
    addOns: CANADA_ROCKIES_TOUR.addOns.map((item) => ({ ...item })),
    paymentPlan: { ...CANADA_ROCKIES_TOUR.paymentPlan, steps: [] },
  };
}

export default async function NewTourPage({
  searchParams,
}: {
  searchParams: Promise<NewTourSearchParams>;
}) {
  const template = firstParam((await searchParams).template);
  const initialTour = template === "canada-rockies-april-2027"
    ? canadaRockiesTemplate()
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Tour</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Buat paket tour baru</p>
      </div>
      <TourForm tour={initialTour} />
    </div>
  );
}
