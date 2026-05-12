export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

async function getSiteTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    return row?.value ?? "classic";
  } catch { return "classic"; }
}

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const [params, tc, theme] = await Promise.all([
    searchParams,
    prisma.termsCondition.findFirst().catch(() => null),
    getSiteTheme(),
  ]);

  const lang   = params.lang === "en" ? "en" : "id";
  const body   = lang === "en" ? (tc?.bodyEn ?? tc?.bodyId) : tc?.bodyId;
  const hasEn  = !!tc?.bodyEn;

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap;

  const pageBg  = isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : undefined;
  const headClr = isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : undefined;
  const subClr  = isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : undefined;
  const cardBg  = isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : undefined;
  const bdrClr  = isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : undefined;

  const pixelGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isMap ? {
    backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)",
    backgroundSize: "28px 28px",
  } : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pixelGrid } : undefined;

  /* ── lang toggle pill style ── */
  function activePill() {
    if (isKawaii)   return "kw-pill font-black";
    if (isTropical) return "tr-pill font-black";
    if (isPixel)    return "px-pill font-black";
    if (isGlobe)    return "gl-pill font-black";
    if (isMap)      return "mp-pill font-black";
    return "px-3 py-1.5 text-sm rounded-full font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900";
  }
  function inactivePill() {
    if (isKawaii)   return "kw-pill font-black opacity-50 hover:opacity-80";
    if (isTropical) return "tr-pill font-black opacity-50 hover:opacity-80";
    if (isPixel)    return "px-pill opacity-50 hover:opacity-80";
    if (isGlobe)    return "gl-pill font-black opacity-50 hover:opacity-80";
    if (isMap)      return "mp-pill font-black opacity-50 hover:opacity-80";
    return "px-3 py-1.5 text-sm rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";
  }

  return (
    <div className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`} style={wrapperStyle}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {isOutlined ? (
          <>
            {isKawaii   && <span className="kw-pill mb-4 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>♡ Legal</span>}
            {isTropical && <span className="tr-pill mb-4 inline-flex" style={{ background: "var(--tr-grape)", color: "var(--tr-text)" }}>📋 Legal</span>}
            {isPixel    && <span className="px-pill mb-4 inline-flex" style={{ background: "var(--px-purple)", color: "#ffffff" }}>► LEGAL</span>}
            {isGlobe    && <span className="gl-pill mb-4 inline-flex" style={{ background: "var(--gl-coral)", color: "var(--gl-on-coral)", borderColor: "transparent" }}>📋 Legal</span>}
            {isMap      && <span className="mp-pill mb-4 inline-flex" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>Legal</span>}
            <h1 className="text-3xl font-black mt-3 mb-2" style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
              {isPixel ? "SYARAT & KETENTUAN" : "Syarat & Ketentuan"}
            </h1>
            <p className="text-sm mb-6" style={{ color: subClr, fontFamily: isPixel ? "monospace" : undefined }}>CV Sundaf Holiday Group</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Syarat &amp; Ketentuan</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">CV Sundaf Holiday Group</p>
          </>
        )}

        {/* Language toggle — only shown when English content exists */}
        {hasEn && (
          <div className="flex gap-2 mb-8">
            <a href="/terms" className={lang === "id" ? activePill() : inactivePill()}
              style={lang === "id" && isOutlined ? { background: headClr, color: cardBg ?? "#fff" } : undefined}>
              Indonesia
            </a>
            <a href="/terms?lang=en" className={lang === "en" ? activePill() : inactivePill()}
              style={lang === "en" && isOutlined ? { background: headClr, color: cardBg ?? "#fff" } : undefined}>
              English
            </a>
          </div>
        )}

        {body ? (
          isGlobe ? (
            <div className="gl-card p-8 prose dark:prose-invert max-w-none"
              style={{ background: cardBg, color: headClr }}>
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          ) : isOutlined ? (
            <div className={`border-2 p-8 prose max-w-none ${isPixel ? "font-mono" : ""}`}
              style={{ background: cardBg, borderColor: bdrClr, color: headClr, boxShadow: `4px 4px 0 0 ${bdrClr}` }}>
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
          )
        ) : (
          isGlobe ? (
            <div className="gl-card p-8 text-center" style={{ background: cardBg, color: subClr }}>
              <p>Syarat &amp; Ketentuan akan segera tersedia.</p>
            </div>
          ) : isOutlined ? (
            <div className="border-2 p-8 text-center" style={{ borderColor: bdrClr, background: cardBg, color: subClr }}>
              <p>Syarat &amp; Ketentuan akan segera tersedia.</p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center text-gray-400">
              <p>Syarat &amp; Ketentuan akan segera tersedia.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
