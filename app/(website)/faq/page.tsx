export const revalidate = 300;

import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import FaqExplorer from "./FaqExplorer";
import { FAQ_BOTTOM_CTA, FAQ_SECTIONS, faqAnswerText } from "@/lib/faq-content";
import { prisma } from "@/lib/prisma";
import { toWaNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "FAQ Sundaf Trip | Tour, Visa, Pembayaran, Refund & Keberangkatan",
  },
  description:
    "Temukan jawaban seputar paket tour Sundaf Trip, bantuan visa, pembayaran, deposit, refund, keamanan perjalanan, tour leader, private trip, dan keberangkatan grup.",
  alternates: { canonical: "https://sundaftrip.com/faq" },
};

async function getChromeData() {
  try {
    const [themeRow, companyRows] = await Promise.all([
      prisma.companyInfo.findFirst({ where: { key: "site_theme" } }),
      prisma.companyInfo.findMany({ where: { key: { in: ["company_whatsapp"] } } }),
    ]);
    const company: Record<string, string> = {};
    companyRows.forEach((row) => {
      company[row.key] = row.value;
    });
    const rawTheme = themeRow?.value ?? "classic";
    const theme = rawTheme === "console" ? "atlas" : rawTheme;
    return { theme, company };
  } catch {
    return { theme: "classic", company: {} };
  }
}

export default async function FaqPage() {
  const { theme, company } = await getChromeData();

  const isKawaii = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel = theme === "pixel";
  const isGlobe = theme === "globe";
  const isMap = theme === "map";
  const isAtlas = theme === "atlas";
  const isFumayo = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isFumayo;

  const pfx = isKawaii
    ? "kw"
    : isTropical
      ? "tr"
      : isPixel
        ? "px"
        : isGlobe
          ? "gl"
          : isMap
            ? "mp"
            : isAtlas
              ? "at"
              : isFumayo
                ? "fb"
                : "";

  const pageBg = isFumayo
    ? "var(--fb-bg)"
    : isAtlas
      ? "var(--at-bg)"
      : isTropical
        ? "var(--tr-bg)"
        : isKawaii
          ? "var(--kw-bg)"
          : isPixel
            ? "var(--px-bg)"
            : undefined;
  const headClr = isFumayo
    ? "var(--fb-text)"
    : isAtlas
      ? "var(--at-text)"
      : isTropical
        ? "var(--tr-text)"
        : isKawaii
          ? "var(--kw-text)"
          : isPixel
            ? "var(--px-text)"
            : undefined;
  const subClr = isFumayo
    ? "var(--fb-subtext)"
    : isAtlas
      ? "var(--at-subtext)"
      : isTropical
        ? "var(--tr-subtext)"
        : isKawaii
          ? "var(--kw-subtext)"
          : isPixel
            ? "var(--px-subtext)"
            : undefined;
  const cardBg = isFumayo
    ? "var(--fb-card)"
    : isAtlas
      ? "var(--at-card)"
      : isTropical
        ? "var(--tr-card)"
        : isKawaii
          ? "var(--kw-card)"
          : isPixel
            ? "var(--px-card)"
            : undefined;
  const bdrClr = isFumayo
    ? "var(--fb-border)"
    : isAtlas
      ? "var(--at-border)"
      : isTropical
        ? "var(--tr-border)"
        : isKawaii
          ? "var(--kw-border)"
          : isPixel
            ? "var(--px-border)"
            : undefined;

  const pixelGrid = isAtlas
    ? {
        backgroundImage:
          "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)",
        backgroundSize: "32px 32px",
      }
    : isPixel
      ? {
          backgroundImage:
            "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
          backgroundSize: "24px 24px",
        }
      : isFumayo
        ? {
            backgroundImage:
              "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)",
            backgroundSize: "26px 26px",
          }
        : {};

  const wrapperStyle = pageBg
    ? { backgroundColor: pageBg, ...pixelGrid, ...(isFumayo ? { fontFamily: "var(--fb-font)" } : {}) }
    : undefined;

  const whatsapp = toWaNumber(company["company_whatsapp"]);
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Halo, saya ingin konsultasi sebelum booking dengan Sundaf Trip.")}`
    : "/#contact";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://sundaftrip.com/faq#faqpage",
    inLanguage: "id-ID",
    mainEntity: FAQ_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faqAnswerText(item),
        },
      })),
    ),
  };

  return (
    <div
      className={`min-h-screen pt-24 ${!isOutlined ? "bg-gray-50 dark:bg-slate-950" : ""}`}
      style={wrapperStyle}
    >
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "FAQ", url: "/faq" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          {isOutlined ? (
            <span
              className={`${pfx}-pill mb-4 inline-flex text-xs font-black uppercase tracking-widest`}
              style={{ color: subClr }}
            >
              FAQ Sundaf Trip
            </span>
          ) : (
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              FAQ Sundaf Trip
            </span>
          )}

          <h1
            className={`mb-5 text-4xl font-black leading-tight tracking-normal sm:text-5xl ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
            style={isOutlined ? { color: headClr } : undefined}
          >
            FAQ Sundaf Trip
          </h1>

          <p
            className={`max-w-3xl text-base leading-relaxed sm:text-lg ${!isOutlined ? "text-gray-600 dark:text-gray-300" : ""}`}
            style={isOutlined ? { color: subClr } : undefined}
          >
            Jawaban seputar paket tour luar negeri, bantuan visa, pembayaran,
            deposit tour, refund tour, keamanan perjalanan, trip aurora, private
            trip, corporate trip, dan keberangkatan grup sebelum Anda booking.
          </p>
        </header>

        <FaqExplorer
          sections={FAQ_SECTIONS}
          bottomCta={FAQ_BOTTOM_CTA}
          whatsappHref={whatsappHref}
          theme={{ isOutlined, pfx, headClr, subClr, cardBg, bdrClr }}
        />
      </main>
    </div>
  );
}
