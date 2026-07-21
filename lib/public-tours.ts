import type { Prisma } from "@prisma/client";

/**
 * Dua produk ini sudah dipublikasikan oleh facade lama walaupun status database
 * masih DRAFT. Allowlist menjaga URL live tetap bekerja selama status datanya
 * dimigrasikan ke ACTIVE, tanpa membuka draft lain secara tidak sengaja.
 */
export const LEGACY_PUBLIC_TOUR_SLUGS = [
  "central-asia-4-tan",
  "russia-aurora",
] as const;

export function publicTourVisibilityWhere(): Prisma.TourWhereInput {
  return {
    OR: [
      { status: { in: ["ACTIVE", "FULL"] } },
      { slug: { in: [...LEGACY_PUBLIC_TOUR_SLUGS] } },
    ],
  };
}

export function isPublicTourVisible(tour: { slug?: string | null; status?: string | null }) {
  return tour.status === "ACTIVE"
    || tour.status === "FULL"
    || LEGACY_PUBLIC_TOUR_SLUGS.includes(tour.slug as (typeof LEGACY_PUBLIC_TOUR_SLUGS)[number]);
}
