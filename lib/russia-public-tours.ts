import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { publicTourVisibilityWhere } from "./public-tours";

// Both Russia landing pages read the same catalog and CMS invalidation tag.
export const getRussiaPublicTours = unstable_cache(
  () => prisma.tour.findMany({
    where: {
      AND: [publicTourVisibilityWhere(), { status: "ACTIVE", tripDate: { gt: new Date() } }],
    },
    select: {
      id: true, slug: true, title: true, country: true, cityHighlight: true,
      price: true, promoPrice: true, seatsLeft: true, tripDate: true,
      duration: true, badge: true, status: true, addOns: true, hotel: true, exclusions: true,
    },
  }),
  ["russia-guide-tours-v2"],
  { revalidate: 300, tags: ["home-data"] },
);
