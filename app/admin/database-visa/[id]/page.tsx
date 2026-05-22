import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CountryVisaForm from "@/components/admin/CountryVisaForm";

export default async function EditCountryVisaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await prisma.countryVisa.findUnique({ where: { id } });
  if (!entry) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit {entry.flag} {entry.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.en}</p>
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
        }}
      />
    </div>
  );
}
