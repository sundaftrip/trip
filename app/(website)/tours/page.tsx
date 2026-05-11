export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import TourCard from "@/components/website/TourCard";
import { getContinent, CONTINENT_ORDER, normalizeCountry } from "@/lib/continents";

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string; continent?: string }>;
}) {
  const params = await searchParams;

  // Build DB filter
  const where: Record<string, unknown> = { status: { in: ["ACTIVE", "FULL"] } };
  if (params.category) where.category = params.category;
  if (params.country) where.country = params.country;

  const [tours, allTours, categories] = await Promise.all([
    prisma.tour.findMany({ where, orderBy: { tripDate: "asc" } }),
    // Need all countries for continent mapping
    prisma.tour.findMany({
      where: { status: { in: ["ACTIVE", "FULL"] } },
      select: { country: true },
      distinct: ["country"],
    }),
    prisma.tour.findMany({
      distinct: ["category"],
      select: { category: true },
      where: { status: { in: ["ACTIVE", "FULL"] } },
    }),
  ]);

  // Build continent → countries map, normalizing country names for consistent grouping
  const continentCountries: Record<string, string[]> = {};
  allTours.forEach(({ country }) => {
    const canonical = normalizeCountry(country);
    const continent = getContinent(canonical);
    if (!continentCountries[continent]) continentCountries[continent] = [];
    if (!continentCountries[continent].includes(canonical)) continentCountries[continent].push(canonical);
  });

  const availableContinents = CONTINENT_ORDER.filter((c) => continentCountries[c]?.length > 0);

  // If continent filter is active but no country, filter by all countries in that continent
  let filteredTours = tours;
  if (params.continent && !params.country) {
    const countriesInContinent = continentCountries[params.continent] ?? [];
    filteredTours = tours.filter((t) => countriesInContinent.includes(normalizeCountry(t.country)));
  }

  // Sort: active & future first, expired/sold-out last
  const now = new Date();
  const sorted = [...filteredTours].sort((a, b) => {
    const aDown = a.status === "FULL" || (!!a.tripDate && a.tripDate < now);
    const bDown = b.status === "FULL" || (!!b.tripDate && b.tripDate < now);
    if (aDown === bDown) return 0;
    return aDown ? 1 : -1;
  });

  // Build filter URLs
  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = { ...params, ...overrides };
    const q = new URLSearchParams();
    if (p.category) q.set("category", p.category);
    if (p.continent) q.set("continent", p.continent);
    if (p.country) q.set("country", p.country);
    return `/tours${q.toString() ? `?${q}` : ""}`;
  };

  const activeContinent = params.continent ?? (params.country ? getContinent(params.country) : undefined);
  const countriesForActiveContinent = activeContinent ? (continentCountries[activeContinent] ?? []) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Paket Tour</h1>
          <p className="text-gray-500 dark:text-gray-400">Temukan paket perjalanan yang sesuai untuk Anda</p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <a href={buildUrl({ category: undefined })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${!params.category ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}>
              Semua Kategori
            </a>
            {categories.map(({ category }) => (
              <a key={category} href={buildUrl({ category })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${params.category === category ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400"}`}>
                {category}
              </a>
            ))}
          </div>
        )}

        {/* Continent Filter */}
        {availableContinents.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <a href={buildUrl({ continent: undefined, country: undefined })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${!activeContinent ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400"}`}>
              🌍 Semua Tujuan
            </a>
            {availableContinents.map((continent) => (
              <a key={continent} href={buildUrl({ continent, country: undefined })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeContinent === continent ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400"}`}>
                {continent}
              </a>
            ))}
          </div>
        )}

        {/* Country Filter (shown when continent is selected and has multiple countries) */}
        {activeContinent && countriesForActiveContinent.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6 pl-2 border-l-2 border-gray-200 dark:border-gray-700 ml-1">
            <a href={buildUrl({ continent: activeContinent, country: undefined })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${!params.country ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-400"}`}>
              Semua {activeContinent}
            </a>
            {countriesForActiveContinent.map((country) => (
              <a key={country} href={buildUrl({ continent: activeContinent, country })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${params.country === country ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-400"}`}>
                {country}
              </a>
            ))}
          </div>
        )}

        {!activeContinent && availableContinents.length === 0 && <div className="mb-6" />}
        {activeContinent && countriesForActiveContinent.length <= 1 && <div className="mb-6" />}

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
