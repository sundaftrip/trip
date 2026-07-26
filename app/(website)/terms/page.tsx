export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { defaultOpenGraphImages, defaultTwitterImages } from "@/lib/site-metadata";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import supportStyles from "@/components/website/clean/SupportPages.module.css";

const siteUrl = process.env.NEXTAUTH_URL || "https://sundaftrip.com";
const LEGAL_ENTITY_STATEMENT =
  "This website is owned and operated by CV Sundaf Holiday Group, operating under the Sundaf Trip brand.";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan layanan Sundaf Trip untuk pemesanan tour, pembayaran, pembatalan, perubahan jadwal, visa, dan tanggung jawab perjalanan.",
  alternates: { canonical: `${siteUrl}/terms` },
  openGraph: {
    title: "Syarat & Ketentuan Sundaf Trip",
    description:
      "Syarat dan ketentuan layanan Sundaf Trip untuk pemesanan tour, pembayaran, pembatalan, perubahan jadwal, visa, dan tanggung jawab perjalanan.",
    url: `${siteUrl}/terms`,
    type: "website",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    images: defaultOpenGraphImages("Syarat & Ketentuan Sundaf Trip"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Syarat & Ketentuan Sundaf Trip",
    description:
      "Syarat dan ketentuan layanan Sundaf Trip untuk pemesanan tour, pembayaran, pembatalan, perubahan jadwal, visa, dan tanggung jawab perjalanan.",
    images: defaultTwitterImages(),
  },
};

async function getSiteTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    const v = row?.value ?? "classic";
    return v === "console" ? "atlas" : v;
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
  const isAtlas    = theme === "atlas";
  const isFumayo   = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isFumayo;

  const pageBg  = isFumayo ? "var(--fb-bg)" : isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : isAtlas ? "var(--at-bg)" : undefined;
  const headClr = isFumayo ? "var(--fb-text)" : isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : isAtlas ? "var(--at-text)" : undefined;
  const subClr  = isFumayo ? "var(--fb-subtext)" : isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : isAtlas ? "var(--at-subtext)" : undefined;
  const cardBg  = isFumayo ? "var(--fb-card)" : isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : isAtlas ? "var(--at-card)" : undefined;
  const bdrClr  = isFumayo ? "var(--fb-border)" : isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : isAtlas ? "var(--at-border)" : undefined;

  const pixelGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isMap ? {
    backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)",
    backgroundSize: "28px 28px",
  } : isFumayo ? {
    backgroundImage: "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)",
    backgroundSize: "26px 26px",
    fontFamily: "var(--fb-font)",
  } : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pixelGrid } : undefined;

  /* ── lang toggle pill style ── */
  function activePill() {
    if (isAtlas)    return `${supportStyles.languageLink} ${supportStyles.languageLinkActive}`;
    if (isKawaii)   return "kw-pill font-black";
    if (isTropical) return "tr-pill font-black";
    if (isPixel)    return "px-pill font-black";
    if (isGlobe)    return "gl-pill font-black";
    if (isMap)      return "mp-pill font-black";
    return "px-3 py-1.5 text-sm rounded-full font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900";
  }
  function inactivePill() {
    if (isAtlas)    return supportStyles.languageLink;
    if (isKawaii)   return "kw-pill font-black opacity-50 hover:opacity-80";
    if (isTropical) return "tr-pill font-black opacity-50 hover:opacity-80";
    if (isPixel)    return "px-pill opacity-50 hover:opacity-80";
    if (isGlobe)    return "gl-pill font-black opacity-50 hover:opacity-80";
    if (isMap)      return "mp-pill font-black opacity-50 hover:opacity-80";
    return "px-3 py-1.5 text-sm rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";
  }

  return (
    <div className={`${isAtlas ? supportStyles.atlasPage : "pt-24"} min-h-screen ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`} style={wrapperStyle}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Syarat & Ketentuan", url: "/terms" },
        ]}
      />
      <div className={isAtlas ? supportStyles.termsShell : "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"}>

        {isOutlined ? (
          <>
            {isAtlas    && <span className="at-pill mb-4 inline-flex">Legal</span>}
            {isKawaii   && <span className="kw-pill mb-4 inline-flex" style={{ background: "var(--kw-blush)", color: "var(--kw-text)" }}>♡ Legal</span>}
            {isTropical && <span className="tr-pill mb-4 inline-flex" style={{ background: "var(--tr-grape)", color: "var(--tr-text)" }}>📋 Legal</span>}
            {isPixel    && <span className="px-pill mb-4 inline-flex" style={{ background: "var(--px-purple)", color: "#ffffff" }}>► LEGAL</span>}
            {isGlobe    && <span className="gl-pill mb-4 inline-flex" style={{ background: "var(--gl-coral)", color: "var(--gl-on-coral)", borderColor: "transparent" }}>📋 Legal</span>}
            {isMap      && <span className="mp-pill mb-4 inline-flex" style={{ background: "var(--mp-land)", color: "var(--mp-text)", borderColor: "var(--mp-border)" }}>Legal</span>}
            <h1 className={`${isAtlas ? supportStyles.title : "text-3xl"} font-black mt-3 mb-2`} style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
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

        <div
          className={`${isAtlas ? supportStyles.softSurface : ""} mb-8 ${isOutlined ? "border-2 p-4" : "rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60"}`}
          style={isOutlined ? { background: cardBg, borderColor: bdrClr, color: subClr } : undefined}>
          <p className="text-sm leading-relaxed">{LEGAL_ENTITY_STATEMENT}</p>
        </div>

        {/* Language toggle, only shown when English content exists */}
        {hasEn && (
          <nav className={isAtlas ? supportStyles.languageNav : "flex gap-2 mb-8"} aria-label="Bahasa dokumen">
            <Link href="/terms" className={lang === "id" ? activePill() : inactivePill()}
              aria-current={lang === "id" ? "page" : undefined}
              style={lang === "id" && isOutlined && !isAtlas ? { background: headClr, color: cardBg ?? "#fff" } : undefined}>
              Indonesia
            </Link>
            <Link href="/terms?lang=en" className={lang === "en" ? activePill() : inactivePill()}
              aria-current={lang === "en" ? "page" : undefined}
              style={lang === "en" && isOutlined && !isAtlas ? { background: headClr, color: cardBg ?? "#fff" } : undefined}>
              English
            </Link>
          </nav>
        )}

        {body ? (
          isGlobe ? (
            <div className="gl-card p-8 prose dark:prose-invert max-w-none"
              style={{ background: cardBg, color: headClr }}>
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          ) : isAtlas ? (
            <article className={supportStyles.proseCard} lang={lang}>
              <div className={supportStyles.proseContent} dangerouslySetInnerHTML={{ __html: body }} />
            </article>
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
          ) : isAtlas ? (
            <div className={`${supportStyles.softSurface} p-8 text-center`} style={{ color: subClr }}>
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
