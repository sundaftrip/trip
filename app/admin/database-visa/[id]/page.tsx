import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CountryVisaForm from "@/components/admin/CountryVisaForm";
import { FlagIcon } from "@/lib/flag-icon";

export default async function EditCountryVisaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await prisma.countryVisa.findUnique({
    where: { id },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!entry) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FlagIcon flag={entry.flag} rounded label={entry.name} width={36} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit {entry.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{entry.en}</p>
        </div>
      </div>
      <CountryVisaForm
        entry={{
          id: entry.id,
          sortOrder: entry.sortOrder,
          flag: entry.flag,
          name: entry.name,
          en: entry.en,
          region: entry.region,
          visa: entry.visa,
          stay: entry.stay,
          cost: entry.cost,
          notes: entry.notes,
          variants: entry.variants.map((v) => ({
            id: v.id,
            name: v.name,
            priceIDR: v.priceIDR,
            processingTime: v.processingTime ?? "",
            notes: v.notes ?? "",
          })),
          eligibility: Array.isArray(entry.eligibility) ? entry.eligibility : [],
          documents: Array.isArray(entry.documents)
            ? (entry.documents as Array<{ name?: string; hint?: string }>).map((d) => ({
                name: d?.name ?? "",
                hint: d?.hint ?? "",
              }))
            : [],
          faqs: Array.isArray(entry.faqs)
            ? (entry.faqs as Array<{ question?: string; answer?: string }>).map((f) => ({
                question: f?.question ?? "",
                answer: f?.answer ?? "",
              }))
            : [],
        }}
      />
    </div>
  );
}
