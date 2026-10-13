import { redirect } from "next/navigation";
import TourForm, { type TourData } from "@/components/admin/TourForm";
import { CANADA_ROCKIES_TOUR } from "@/data/catalog/canada-rockies-april-2027";
import { can, requireAdminModule } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

type NewTourSearchParams = {
  template?: string | string[];
  from?: string | string[];
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

/** Salinan tour sebagai draft baru: isi sama, tanpa ID/slug/pin. */
async function duplicateTemplate(id: string): Promise<{ tour: TourData; sourceTitle: string } | null> {
  const source = await prisma.tour.findUnique({ where: { id } });
  if (!source) return null;
  return {
    sourceTitle: source.title,
    tour: {
      title: `${source.title} (salinan)`,
      country: source.country,
      cityHighlight: source.cityHighlight ?? undefined,
      price: source.price,
      promoPrice: source.promoPrice ?? null,
      priceLandTour: source.priceLandTour ?? null,
      seatsLeft: source.seatsLeft,
      status: "DRAFT",
      pinned: false,
      tripDate: source.tripDate?.toISOString(),
      duration: source.duration ?? undefined,
      inclusions: source.inclusions,
      exclusions: source.exclusions,
      gallery: source.gallery,
      hotel: source.hotel as TourData["hotel"],
      heroImg: source.heroImg ?? undefined,
      badge: source.badge ?? undefined,
      notes: source.notes ?? undefined,
      description: source.description ?? undefined,
      visaInfo: source.visaInfo ?? undefined,
      itinerary: Array.isArray(source.itinerary) ? source.itinerary as unknown as TourData["itinerary"] : [],
      addOns: Array.isArray(source.addOns) ? source.addOns as unknown as TourData["addOns"] : [],
      paymentPlan: source.paymentPlan as TourData["paymentPlan"],
    },
  };
}

export default async function NewTourPage({
  searchParams,
}: {
  searchParams: Promise<NewTourSearchParams>;
}) {
  const viewer = await requireAdminModule("tours");
  if (!can(viewer, "tour_create")) redirect("/admin/tours");

  const sp = await searchParams;
  const template = firstParam(sp.template);
  const fromId = firstParam(sp.from);
  const duplicate = fromId ? await duplicateTemplate(fromId) : null;
  const initialTour = duplicate?.tour
    ?? (template === "canada-rockies-april-2027" ? canadaRockiesTemplate() : undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{duplicate ? "Duplikat Tour" : "Tambah Tour"}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Simpan sebagai Draft dulu bila data belum lengkap. Draft tidak tampil di website.
        </p>
      </div>
      <TourForm
        tour={initialTour}
        canChangeStatus={can(viewer, "tour_status")}
        canPin={can(viewer, "tour_edit")}
        draftScope={duplicate ? `from-${fromId}` : template || undefined}
        notice={duplicate
          ? `Salinan dari "${duplicate.sourceTitle}". Ganti judul, tanggal berangkat, kursi, dan harga, lalu cek skema pembayaran sebelum mengaktifkan.`
          : undefined}
      />
    </div>
  );
}
