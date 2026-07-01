import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import VisaDatabase from "./VisaDatabase";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

// ISR: database visa jarang berubah — edit dari admin tampil maksimal 5 menit.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Info Visa Paspor Indonesia dan Jasa Urus Visa",
  description:
    "Database persyaratan visa 88 negara dan layanan jasa urus visa untuk pemegang paspor Indonesia, dikurasi dari sumber resmi oleh Sundaf Trip.",
  alternates: { canonical: "https://sundaftrip.com/visa" },
};

export default async function VisaPage() {
  // Hanya ambil 9 field yang dirender VisaDatabase (index). Field kaya
  // per-negara (eligibility[], documents Json, faqs Json) cuma dipakai di
  // halaman detail /visa/[slug] — kalau ikut ditarik untuk 88 negara, HTML
  // index membengkak ratusan KB & berat di mobile. select = payload ramping.
  const visaEntries = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      flag: true,
      name: true,
      en: true,
      region: true,
      visa: true,
      stay: true,
      cost: true,
      officialFee: true,
      servicePrice: true,
      notes: true,
      conditions: true,
      sourceUrl: true,
      lastVerifiedAt: true,
    },
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Visa Paspor Indonesia
        </h1>

        <VisaDatabase
          entries={visaEntries.map((entry) => ({
            ...entry,
            lastVerifiedAt: entry.lastVerifiedAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}
