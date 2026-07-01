export const revalidate = 300;

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import ContactSection from "@/components/website/ContactSection";

const CONTACT_TITLE = "Kontak Sundaf Trip";
const CONTACT_DESC =
  "Hubungi WhatsApp, email, atau kantor Sundaf Trip untuk konsultasi tour Rusia, Asia Tengah, aurora, custom trip, dan layanan visa.";

export const metadata: Metadata = {
  title: "Kontak",
  description: CONTACT_DESC,
  alternates: { canonical: "https://sundaftrip.com/contact" },
  openGraph: {
    title: `${CONTACT_TITLE} · Sundaf Trip`,
    description: CONTACT_DESC,
    url: "https://sundaftrip.com/contact",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: CONTACT_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${CONTACT_TITLE} · Sundaf Trip`,
    description: CONTACT_DESC,
  },
};

type PublicTheme = "classic" | "tropical" | "kawaii" | "pixel" | "globe" | "map" | "atlas" | "fumayo";

const getData = unstable_cache(
  async () => {
    const [texts, companyRows] = await Promise.all([
      prisma.siteText.findMany(),
      prisma.companyInfo.findMany(),
    ]);

    const textMap: Record<string, { id?: string; en?: string }> = {};
    texts.forEach((row) => {
      textMap[row.key] = {
        id: row.valueId ?? undefined,
        en: row.valueEn ?? undefined,
      };
    });

    const company: Record<string, string> = {};
    companyRows.forEach((row) => {
      company[row.key] = row.value;
    });

    return { texts: textMap, company };
  },
  ["contact-page-data"],
  { revalidate: 300, tags: ["footer-data", "home-data", "site-colors"] },
);

function normalizeTheme(value?: string): PublicTheme {
  const theme = value === "console" ? "atlas" : value;
  if (
    theme === "tropical" ||
    theme === "kawaii" ||
    theme === "pixel" ||
    theme === "globe" ||
    theme === "map" ||
    theme === "atlas" ||
    theme === "fumayo"
  ) {
    return theme;
  }
  return "classic";
}

function pageSurface(theme: PublicTheme): { className: string; style?: CSSProperties } {
  if (theme === "atlas") return { className: "at-grid-bg", style: { backgroundColor: "var(--at-bg)" } };
  if (theme === "map") {
    return {
      className: "",
      style: {
        background: "var(--mp-bg)",
        backgroundImage:
          "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)",
        backgroundSize: "28px 28px",
      },
    };
  }
  if (theme === "pixel") {
    return {
      className: "",
      style: {
        background: "var(--px-bg)",
        backgroundImage:
          "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
        backgroundSize: "24px 24px",
      },
    };
  }
  if (theme === "globe") return { className: "", style: { background: "var(--gl-bg)" } };
  if (theme === "kawaii") return { className: "", style: { background: "var(--kw-bg)" } };
  if (theme === "tropical") return { className: "", style: { background: "var(--tr-bg)" } };
  if (theme === "fumayo") return { className: "fb-page" };
  return { className: "bg-white dark:bg-black" };
}

export default async function ContactPage() {
  const { texts, company } = await getData();
  const theme = normalizeTheme(company["site_theme"]);
  const surface = pageSurface(theme);

  return (
    <div className={`min-h-screen pt-24${surface.className ? ` ${surface.className}` : ""}`} style={surface.style}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: CONTACT_TITLE, url: "/contact" },
        ]}
      />
      <section className="px-4 pt-12 sm:px-6 lg:px-8" aria-labelledby="contact-page-title">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: "var(--site-accent,#00ADB5)" }}>
            Kontak resmi
          </p>
          <h1 id="contact-page-title" className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-6xl" style={{ color: "var(--site-heading,#222831)" }}>
            Hubungi Sundaf Trip
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            Konsultasi paket tour, custom trip, dokumen visa, dan kebutuhan perjalanan lain lewat kanal resmi Sundaf Trip.
          </p>
        </div>
      </section>
      <ContactSection texts={texts} company={company} theme={theme} />
    </div>
  );
}
