export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";

async function getSiteTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    return row?.value ?? "classic";
  } catch { return "classic"; }
}

export default async function TermsPage() {
  const [tc, theme] = await Promise.all([
    prisma.termsCondition.findFirst().catch(() => null),
    getSiteTheme(),
  ]);

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap;

  const pageBg = isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : undefined;
  const headClr = isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : undefined;
  const subClr  = isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : undefined;
  const cardBg  = isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : undefined;
  const bdrClr  = isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : undefined;

  const pixelGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isMap ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" } : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pixelGrid } : undefined;

  return (
    <div className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`} style={wrapperStyle}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {isOutlined ? (
          <>
            {isKawaii   && <span className="kw-pill mb-4 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>♡ Legal</span>}
            {isTropical && <span className="tr-pill mb-4 inline-flex" style={{ background: "var(--tr-grape)", color: "var(--tr-text)" }}>📋 Legal</span>}
            {isPixel    && <span className="px-pill mb-4 inline-flex" style={{ background: "var(--px-purple)", color: "#ffffff" }}>► LEGAL</span>}
            {isGlobe    && <span className="gl-pill mb-4 inline-flex" style={{ background: "var(--gl-coral)", color: "var(--gl-on-coral)", borderColor: "transparent" }}>📋 Legal</span>}
            <h1 className="text-3xl font-black mt-3 mb-2" style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
              {isPixel ? "SYARAT & KETENTUAN" : "Syarat & Ketentuan"}
            </h1>
            <p className="text-sm mb-10" style={{ color: subClr, fontFamily: isPixel ? "monospace" : undefined }}>CV Sundaf Holiday Group</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Syarat &amp; Ketentuan</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-10">CV Sundaf Holiday Group</p>
          </>
        )}

        {tc?.bodyId ? (
          isGlobe ? (
            <div className="gl-card p-8 prose dark:prose-invert max-w-none"
              style={{ background: cardBg, color: headClr }}>
              <div dangerouslySetInnerHTML={{ __html: tc.bodyId }} />
            </div>
          ) : isOutlined ? (
            <div className={`border-2 p-8 prose max-w-none ${isPixel ? "font-mono" : ""}`}
              style={{ background: cardBg, borderColor: bdrClr, color: headClr,
                       boxShadow: `4px 4px 0 0 ${bdrClr}` }}>
              <div dangerouslySetInnerHTML={{ __html: tc.bodyId }} />
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: tc.bodyId }} />
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
