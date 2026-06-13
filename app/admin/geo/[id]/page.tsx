import { notFound } from "next/navigation";

import GeoPageForm from "@/components/admin/GeoPageForm";
import { GEO_FALLBACKS } from "@/lib/geo-pages";
import { prisma } from "@/lib/prisma";

export default async function EditGeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.geoPage.findUnique({ where: { id } });
  if (!page) notFound();
  const serialized = JSON.parse(JSON.stringify(page));
  const fallback = GEO_FALLBACKS[page.routePath];
  const formPage = fallback
    ? {
        ...fallback,
        ...serialized,
        sections: serialized.sections ?? fallback.sections,
        faqs: serialized.faqs ?? fallback.faqs,
        destination: serialized.content ?? fallback.destination,
      }
    : { ...serialized, destination: serialized.content ?? undefined };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit GEO</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{page.routePath}</p>
      </div>
      <GeoPageForm page={formPage} />
    </div>
  );
}
