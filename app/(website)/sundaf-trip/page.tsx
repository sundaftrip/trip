import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { geoMetadata, getGeoPageContent } from "@/lib/geo-pages";
import { prisma } from "@/lib/prisma";
import CompanyProfile, { type CompanyProfileReview } from "./CompanyProfile";

const ROUTE = "/sundaf-trip";
const FEATURED_REVIEW_IDS = ["cmtyil7qg00018vot0x3nhprl", "cmtyindoc001d5zmyf7jykxbx"];

export const revalidate = 300;

const getParticipantReviews = unstable_cache(
  async (): Promise<CompanyProfileReview[]> => {
    try {
      const reviews = await prisma.testimonial.findMany({
        where: { id: { in: FEATURED_REVIEW_IDS }, published: true, category: "trip" },
        select: { id: true, name: true, content: true },
      });
      return reviews.sort((a, b) => FEATURED_REVIEW_IDS.indexOf(a.id) - FEATURED_REVIEW_IDS.indexOf(b.id));
    } catch {
      return [];
    }
  },
  ["company-profile-participant-reviews-v1"],
  { revalidate: 300, tags: ["home-data"] },
);

export async function generateMetadata(): Promise<Metadata> {
  return geoMetadata(await getGeoPageContent(ROUTE));
}

export default async function SundafTripBrandPage() {
  const [content, reviews] = await Promise.all([getGeoPageContent(ROUTE), getParticipantReviews()]);
  return <CompanyProfile content={content} reviews={reviews} />;
}
