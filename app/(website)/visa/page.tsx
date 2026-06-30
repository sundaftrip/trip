import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HelpCircle, ArrowRight, BadgeCheck, Globe2, ShieldCheck } from "lucide-react";
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

const SERVICE_LINKS = [
  {
    href: "/jasa-urus-visa-eropa",
    title: "Jasa Urus Visa Eropa",
    description: "Schengen dan Eropa non-Schengen: dokumen, itinerary, formulir, dan appointment.",
    icon: Globe2,
  },
  {
    href: "/jasa-urus-visa-amerika-canada",
    title: "Visa Amerika & Canada",
    description: "DS-160, visitor visa/eTA Canada, biometrik, interview brief, dan review profil perjalanan.",
    icon: BadgeCheck,
  },
  {
    href: "/jasa-urus-visa-terpercaya",
    title: "Jasa Visa Terpercaya",
    description: "Pendampingan transparan tanpa janji approval palsu atau klaim pasti lolos.",
    icon: ShieldCheck,
  },
  {
    href: "/visa/asuransi-visa-protection",
    title: "Asuransi Visa Protection",
    description: "Screening polis terpisah untuk bantu kurangi risiko biaya saat visa ditolak.",
    icon: ShieldCheck,
  },
] as const;

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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          {SERVICE_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-3 rounded-xl px-4 py-4 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <span
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "color-mix(in srgb, var(--site-accent,#2d6a4f) 16%, transparent)",
                    color: "var(--site-accent-ink,#2d6a4f)",
                  }}
                >
                  <Icon size={18} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </span>
                  <span className="block text-xs leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </span>
                </span>
                <ArrowRight size={15} className="shrink-0 mt-1 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            );
          })}
        </div>

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
