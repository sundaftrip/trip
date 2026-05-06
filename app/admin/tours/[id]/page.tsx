import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TourForm from "@/components/admin/TourForm";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Tour</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tour.title}</p>
      </div>
      <TourForm tour={{
        ...tour,
        promoPrice: tour.promoPrice ?? null,
        priceLandTour: tour.priceLandTour ?? null,
        tripDate: tour.tripDate?.toISOString(),
        itinerary: (tour.itinerary as { day: number; title: string; description: string }[]) ?? [],
        addOns: (tour.addOns as { name: string; price: number }[]) ?? [],
        hotel: undefined,
      }} />
    </div>
  );
}
