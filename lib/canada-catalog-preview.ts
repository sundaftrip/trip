import type { Prisma } from "@prisma/client";
import {
  CANADA_ROCKIES_SLUG,
  CANADA_ROCKIES_TOUR,
} from "@/data/catalog/canada-rockies-april-2027";

export const CANADA_ROCKIES_PREVIEW_ID = "preview-canada-rockies-april-2027";

/**
 * Deployed Vercel targets can render this read-only catalog record even when
 * the production database has not been upserted yet. If the database later
 * contains the same slug, the catalog page keeps the database record and skips
 * this fallback to avoid duplicates.
 */
export function getCanadaRockiesPreviewTour(
  requestedId?: string,
): Prisma.TourGetPayload<Record<string, never>> | null {
  if (!["preview", "production"].includes(process.env.VERCEL_ENV ?? "")) return null;
  if (
    requestedId
    && requestedId !== CANADA_ROCKIES_SLUG
    && requestedId !== CANADA_ROCKIES_PREVIEW_ID
  ) {
    return null;
  }

  const catalogTimestamp = new Date("2026-08-25T00:00:00.000Z");
  return {
    ...CANADA_ROCKIES_TOUR,
    id: CANADA_ROCKIES_PREVIEW_ID,
    status: "ACTIVE",
    itinerary: [...CANADA_ROCKIES_TOUR.itinerary],
    inclusions: [...CANADA_ROCKIES_TOUR.inclusions],
    exclusions: [...CANADA_ROCKIES_TOUR.exclusions],
    gallery: [...CANADA_ROCKIES_TOUR.gallery],
    hotel: { ...CANADA_ROCKIES_TOUR.hotel },
    addOns: [...CANADA_ROCKIES_TOUR.addOns],
    paymentPlan: { ...CANADA_ROCKIES_TOUR.paymentPlan },
    createdAt: catalogTimestamp,
    updatedAt: catalogTimestamp,
    expenseToken: null,
  };
}
