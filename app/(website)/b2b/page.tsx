import type { Metadata } from "next";
import B2BLandTour, { type B2BLanguage } from "@/components/website/B2BLandTour";

export const metadata: Metadata = {
  title: "Sundaf Trip Group - Travel Operations & Supplier Relations",
  description:
    "Sundaf Trip Group is the corporate-facing identity of Sundaf Trip for B2B travel operations, supplier relations, and group travel coordination.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

function parseLanguage(value: string | string[] | undefined): B2BLanguage {
  const lang = Array.isArray(value) ? value[0] : value;
  return lang === "en" || lang === "ru" ? lang : "id";
}

export default async function B2BPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <B2BLandTour language={parseLanguage(params.lang)} showLanguageSwitcher />;
}
