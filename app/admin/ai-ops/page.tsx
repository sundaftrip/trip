export const dynamic = "force-dynamic";

import AiOpsDesk from "@/components/admin/AiOpsDesk";
import {
  buildLeadRecommendation,
  buildOpsStats,
  formatDateLabel,
} from "@/lib/ai-ops";
import { prisma } from "@/lib/prisma";

function priceLabel(price: number, promoPrice: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(promoPrice ?? price);
}

const priorityRank = {
  hot: 0,
  stale: 1,
  warm: 2,
  normal: 3,
};

export default async function AiOpsPage() {
  const today = new Date();
  const [inquiries, activeTours, unpaidReceiptCount] = await Promise.all([
    prisma.inquiry.findMany({
      take: 40,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.tour.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ tripDate: null }, { tripDate: { gte: today } }],
      },
      orderBy: [{ tripDate: "asc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        country: true,
        cityHighlight: true,
        price: true,
        promoPrice: true,
        seatsLeft: true,
        tripDate: true,
        duration: true,
      },
    }),
    prisma.receipt.count({
      where: { status: { not: "PAID" } },
    }),
  ]);

  const recommendations = inquiries
    .map((inquiry) => buildLeadRecommendation(inquiry, activeTours))
    .sort((a, b) => {
      const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
      if (byPriority !== 0) return byPriority;
      return b.ageHours - a.ageHours;
    });

  const tours = activeTours.slice(0, 8).map((tour) => ({
    id: tour.id,
    title: tour.title,
    href: `/tours/${tour.slug || tour.id}`,
    tripDateLabel: formatDateLabel(tour.tripDate),
    priceLabel: priceLabel(tour.price, tour.promoPrice),
    seatsLabel: tour.seatsLeft > 0 ? `${tour.seatsLeft} seat tersedia` : "Tanya ketersediaan",
  }));

  return (
    <AiOpsDesk
      recommendations={recommendations}
      stats={buildOpsStats(recommendations)}
      tours={tours}
      unpaidReceiptCount={unpaidReceiptCount}
    />
  );
}
