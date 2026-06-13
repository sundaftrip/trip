import GeoPageForm from "@/components/admin/GeoPageForm";
import { GEO_FALLBACKS } from "@/lib/geo-pages";

export default async function NewGeoPage({ searchParams }: { searchParams: Promise<{ routePath?: string }> }) {
  const { routePath } = await searchParams;
  const fallback = routePath ? GEO_FALLBACKS[routePath] : undefined;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah GEO</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Buat halaman/jawaban GEO yang bisa diedit dari CMS.
        </p>
      </div>
      <GeoPageForm page={fallback} />
    </div>
  );
}

