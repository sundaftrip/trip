import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { FileCheck } from "lucide-react";
import VisaDatabase from "./VisaDatabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Info Visa Paspor Indonesia",
  description:
    "Database persyaratan visa 88 negara untuk pemegang paspor Indonesia — dikurasi dari sumber resmi oleh Sundaf Trip.",
};

export default async function VisaPage() {
  const visaEntries = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950">
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
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
          Cek persyaratan visa untuk pemegang paspor Indonesia di 88 negara.
        </p>

        <VisaDatabase entries={visaEntries} />
      </div>
    </div>
  );
}
