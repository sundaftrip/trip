import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileCheck, HelpCircle, ArrowRight } from "lucide-react";
import VisaDatabase from "./VisaDatabase";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Info Visa Paspor Indonesia",
  description:
    "Database persyaratan visa 88 negara untuk pemegang paspor Indonesia — dikurasi dari sumber resmi oleh Sundaf Trip.",
  alternates: { canonical: "https://sundaftrip.com/visa" },
};

export default async function VisaPage() {
  const visaEntries = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Info Visa", url: "/visa" },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck size={20} style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Info Visa
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Visa Paspor Indonesia
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xl leading-relaxed">
          Cek persyaratan visa untuk pemegang paspor Indonesia di 88 negara.
        </p>

        <Link
          href="/visa/faq"
          className="group inline-flex items-center gap-3 mb-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
        >
          <span
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "color-mix(in srgb, var(--site-accent-ink,#2d6a4f) 12%, transparent)",
              color: "var(--site-accent-ink,#2d6a4f)",
            }}
          >
            <HelpCircle size={17} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              FAQ Teknis Visa Schengen
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Cerai, anak di bawah 18, apostille Spanyol, sponsor pasangan, rekening kecil
            </span>
          </span>
          <ArrowRight
            size={16}
            className="shrink-0 text-gray-400 group-hover:translate-x-0.5 transition-transform"
          />
        </Link>

        <VisaDatabase entries={visaEntries} />
      </div>
    </div>
  );
}
