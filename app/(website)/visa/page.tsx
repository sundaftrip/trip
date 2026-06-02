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
    "Database persyaratan visa 88 negara untuk pemegang paspor Indonesia, dikurasi dari sumber resmi oleh Sundaf Trip.",
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
          className="group flex items-center gap-3 mb-10 rounded-xl px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
          style={{
            background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 12%, transparent)",
            border: "1.5px solid color-mix(in srgb, var(--site-accent,#2d6a4f) 55%, transparent)",
          }}
        >
          <span
            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 22%, transparent)",
              color: "var(--site-accent-ink,#2d6a4f)",
            }}
          >
            <HelpCircle size={18} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-gray-900 dark:text-white">
              FAQ Teknis Visa Schengen
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Cerai, anak di bawah 18, apostille Spanyol, sponsor pasangan, rekening kecil
            </span>
          </span>
          <span
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full"
            style={{
              background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 22%, transparent)",
              color: "var(--site-accent-ink,#2d6a4f)",
            }}
          >
            Buka
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        <VisaDatabase entries={visaEntries} />
      </div>
    </div>
  );
}
