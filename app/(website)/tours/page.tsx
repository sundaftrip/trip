export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import TourCard from "@/components/website/TourCard";

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = { status: { in: ["ACTIVE", "FULL"] } };
  if (params.category) where.category = params.category;
  if (params.country) where.country = params.country;

  const [tours, categories] = await Promise.all([
    prisma.tour.findMany({ where, orderBy: { tripDate: "asc" } }),
    prisma.tour.findMany({ distinct: ["category"], select: { category: true }, where: { status: { in: ["ACTIVE", "FULL"] } } }),
  ]);

  // Sort: active & future first, expired/sold-out last
  const now = new Date();
  const sorted = [...tours].sort((a, b) => {
    const aDown = a.status === "FULL" || (!!a.tripDate && a.tripDate < now);
    const bDown = b.status === "FULL" || (!!b.tripDate && b.tripDate < now);
    if (aDown === bDown) return 0;
    return aDown ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Paket Tour</h1>
          <p className="text-gray-500 dark:text-gray-400">Temukan paket perjalanan yang sesuai untuk Anda</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <a href="/tours" className={`px-4 py-2 rounded-full text-sm font-medium transition ${!params.category ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}>
            Semua
          </a>
          {categories.map(({ category }) => (
            <a key={category} href={`/tours?category=${encodeURIComponent(category)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${params.category === category ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}>
              {category}
            </a>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">Tidak ada tour yang tersedia</p>
            <a href="/tours" className="text-blue-600 text-sm mt-2 block">Lihat semua tour</a>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{sorted.length} paket ditemukan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
