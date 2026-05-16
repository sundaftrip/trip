export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import TourCard from "@/components/website/TourCard";
import { getContinent, CONTINENT_ORDER, normalizeCountry } from "@/lib/continents";

async function getSiteTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    const v = row?.value ?? "classic";
    return v === "console" ? "atlas" : v;
  } catch { return "classic"; }
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string; continent?: string }>;
}) {
  const [params, theme] = await Promise.all([searchParams, getSiteTheme()]);

  const where: Record<string, unknown> = { status: { in: ["ACTIVE", "FULL"] } };
  if (params.category) where.category = params.category;
  if (params.country)  where.country  = params.country;

  const [tours, allTours, categories] = await Promise.all([
    prisma.tour.findMany({ where, orderBy: { tripDate: "asc" } }),
    prisma.tour.findMany({ where: { status: { in: ["ACTIVE", "FULL"] } }, select: { country: true }, distinct: ["country"] }),
    prisma.tour.findMany({ distinct: ["category"], select: { category: true }, where: { status: { in: ["ACTIVE", "FULL"] } } }),
  ]);

  const continentCountries: Record<string, string[]> = {};
  allTours.forEach(({ country }) => {
    const canonical = normalizeCountry(country);
    const continent = getContinent(canonical);
    if (!continentCountries[continent]) continentCountries[continent] = [];
    if (!continentCountries[continent].includes(canonical)) continentCountries[continent].push(canonical);
  });

  const availableContinents = CONTINENT_ORDER.filter((c) => continentCountries[c]?.length > 0);

  let filteredTours = tours;
  if (params.continent && !params.country) {
    const countriesInContinent = continentCountries[params.continent] ?? [];
    filteredTours = tours.filter((t) => countriesInContinent.includes(normalizeCountry(t.country)));
  }

  const now = new Date();
  const sorted = [...filteredTours].sort((a, b) => {
    const aDown = a.status === "FULL" || (!!a.tripDate && a.tripDate < now);
    const bDown = b.status === "FULL" || (!!b.tripDate && b.tripDate < now);
    if (aDown === bDown) return 0;
    return aDown ? 1 : -1;
  });

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = { ...params, ...overrides };
    const q = new URLSearchParams();
    if (p.category)  q.set("category",  p.category);
    if (p.continent) q.set("continent", p.continent);
    if (p.country)   q.set("country",   p.country);
    return `/tours${q.toString() ? `?${q}` : ""}`;
  };

  const activeContinent         = params.continent ?? (params.country ? getContinent(params.country) : undefined);
  const countriesForActive      = activeContinent ? (continentCountries[activeContinent] ?? []) : [];

  /* ─── theme helpers ─── */
  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas;

  const pageBg = isKawaii   ? "var(--kw-bg)"
               : isTropical ? "var(--tr-bg)"
               : isPixel    ? "var(--px-bg)"
               : isGlobe    ? "var(--gl-bg)"
               : isMap      ? "var(--mp-bg)"
               : isAtlas    ? "var(--at-bg)"
               : undefined;

  const pageGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isMap ? {
    backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)",
    backgroundSize: "28px 28px",
  } : isAtlas ? {
    backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)",
    backgroundSize: "32px 32px",
  } : {};

  const headColor = isKawaii   ? "var(--kw-text)"
                  : isTropical ? "var(--tr-text)"
                  : isPixel    ? "var(--px-text)"
                  : isGlobe    ? "var(--gl-text)"
                  : isMap      ? "var(--mp-text)"
                  : isAtlas    ? "var(--at-text)"
                  : undefined;

  const subColor = isKawaii   ? "var(--kw-subtext)"
                 : isTropical ? "var(--tr-subtext)"
                 : isPixel    ? "var(--px-subtext)"
                 : isGlobe    ? "var(--gl-subtext)"
                 : isMap      ? "var(--mp-subtext)"
                 : isAtlas    ? "var(--at-subtext)"
                 : undefined;

  /* pill builders for filter chips */
  function pillActive(extra?: string) {
    if (isKawaii)   return { className: "kw-pill font-black", style: { background: "var(--kw-border)", color: "#fff", ...(extra ? { transform: extra } : {}) } };
    if (isTropical) return { className: "tr-pill font-black", style: { background: "var(--site-accent)", color: "#fff" } };
    if (isPixel)    return { className: "px-pill font-black", style: { background: "var(--site-accent)", color: "#fff" } };
    if (isGlobe)    return { className: "gl-pill font-black", style: { background: "var(--gl-border)", color: "#fff", borderColor: "transparent" } };
    if (isMap)      return { className: "mp-pill font-black", style: { background: "var(--mp-accent)", color: "var(--mp-on-accent)", borderColor: "var(--mp-border)" } };
    if (isAtlas)    return { className: "at-pill font-semibold", style: { background: "var(--at-text)", color: "var(--at-bg)" } };
    return { className: "px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white", style: {} };
  }
  function pillInactive() {
    if (isKawaii)   return { className: "kw-pill font-black hover:opacity-80 transition-opacity", style: { background: "var(--kw-card)", color: "var(--kw-text)" } };
    if (isTropical) return { className: "tr-pill font-black hover:opacity-80 transition-opacity", style: { background: "var(--tr-card)", color: "var(--tr-text)" } };
    if (isPixel)    return { className: "px-pill hover:opacity-80 transition-opacity", style: { background: "var(--px-card)", color: "var(--px-text)" } };
    if (isGlobe)    return { className: "gl-pill font-black hover:opacity-80 transition-opacity", style: { background: "var(--gl-card)", color: "var(--gl-text)" } };
    if (isMap)      return { className: "mp-pill font-black hover:opacity-80 transition-opacity", style: { background: "var(--mp-card)", color: "var(--mp-text)", borderColor: "var(--mp-border)" } };
    if (isAtlas)    return { className: "at-pill hover:opacity-80 transition-opacity", style: { color: "var(--at-text)" } };
    return { className: "px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400", style: {} };
  }

  const wrapperStyle = pageBg ? { background: pageBg, ...pageGrid } : undefined;

  return (
    <div className={`min-h-screen pt-24 ${!isOutlined ? "bg-gray-50 dark:bg-gray-950" : ""}`} style={wrapperStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Heading */}
        <div className="mb-10">
          {isOutlined ? (
            <>
              {isKawaii   && <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-peach)", color: "var(--kw-text)" }}>✈ Semua Paket</span>}
              {isTropical && <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-mint)", color: "var(--tr-text)" }}>🌍 Semua Paket</span>}
              {isPixel    && <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>► SEMUA PAKET</span>}
              {isGlobe    && <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>🌍 Semua Paket</span>}
              {isMap      && <span className="mp-pill mb-3 inline-flex" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>Semua Paket</span>}
              {isAtlas    && <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Semua Paket</span>}
              <h1 className={`text-4xl font-black mt-3 mb-2 ${isPixel ? "font-mono" : ""}`} style={{ color: headColor, fontFamily: isPixel ? "monospace" : undefined }}>
                {isPixel ? "PAKET TOUR" : "Paket Tour"}
              </h1>
              <p className="text-sm" style={{ color: subColor, fontFamily: isPixel ? "monospace" : undefined }}>
                Temukan paket perjalanan yang sesuai untuk Anda
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Paket Tour</h1>
              <p className="text-gray-500 dark:text-gray-400">Temukan paket perjalanan yang sesuai untuk Anda</p>
            </>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <a href={buildUrl({ category: undefined })} {...(!params.category ? pillActive() : pillInactive())}>
              Semua Kategori
            </a>
            {categories.map(({ category }) => (
              <a key={category} href={buildUrl({ category })} {...(params.category === category ? pillActive() : pillInactive())}>
                {category}
              </a>
            ))}
          </div>
        )}

        {/* Continent Filter */}
        {availableContinents.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <a href={buildUrl({ continent: undefined, country: undefined })} {...(!activeContinent ? pillActive() : pillInactive())}>
              🌍 Semua Tujuan
            </a>
            {availableContinents.map((continent) => (
              <a key={continent} href={buildUrl({ continent, country: undefined })} {...(activeContinent === continent ? pillActive() : pillInactive())}>
                {continent}
              </a>
            ))}
          </div>
        )}

        {/* Country sub-filter */}
        {activeContinent && countriesForActive.length > 1 && (
          <div className={`flex flex-wrap gap-2 mb-6 pl-2 ml-1 ${isOutlined ? "border-l-2" : "border-l-2 border-gray-200 dark:border-gray-700"}`}
            style={isOutlined ? { borderColor: isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isAtlas ? "var(--at-border)" : "var(--px-border)" } : undefined}>
            <a href={buildUrl({ continent: activeContinent, country: undefined })} {...(!params.country ? pillActive() : pillInactive())}>
              Semua {activeContinent}
            </a>
            {countriesForActive.map((country) => (
              <a key={country} href={buildUrl({ continent: activeContinent, country })} {...(params.country === country ? pillActive() : pillInactive())}>
                {country}
              </a>
            ))}
          </div>
        )}

        {!activeContinent && availableContinents.length === 0 && <div className="mb-6" />}
        {activeContinent && countriesForActive.length <= 1 && <div className="mb-6" />}

        {sorted.length === 0 ? (
          <div className="text-center py-24" style={{ color: subColor ?? undefined }}>
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">Tidak ada tour yang tersedia</p>
            <a href="/tours" className="text-sm mt-2 block" style={{ color: isOutlined ? headColor : undefined }}>Lihat semua tour</a>
          </div>
        ) : (
          <>
            <p className={`text-sm mb-5 ${isOutlined ? "" : "text-gray-500 dark:text-gray-400"}`} style={{ color: subColor ?? undefined }}>
              {sorted.length} paket ditemukan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((tour) => <TourCard key={tour.id} tour={tour} theme={theme} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
