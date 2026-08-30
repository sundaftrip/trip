import GeoPageForm from "@/components/admin/GeoPageForm";
import { GEO_FALLBACKS } from "@/lib/geo-pages";
import { GEO_CMS_ROUTES, isSupportedGeoRoute } from "@/lib/geo-cms-routes";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewGeoPage({ searchParams }: { searchParams: Promise<{ routePath?: string }> }) {
  const { routePath } = await searchParams;
  const supported = typeof routePath === "string" && isSupportedGeoRoute(routePath);
  if (!supported) return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pilih halaman GEO</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Editor hanya tersedia untuk halaman yang sudah terhubung ke CMS. Menyimpan konten tidak membuat URL baru.</p>
      </div>
      {routePath && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">Alamat yang diminta belum terhubung ke CMS. Pilih salah satu halaman di bawah.</p>}
      <form action="/admin/geo/new" method="get" className="space-y-4">
        <label htmlFor="geo-route-choice" className="label">Halaman website</label>
        <select id="geo-route-choice" name="routePath" className="input" required defaultValue="">
          <option value="" disabled>Pilih halaman</option>
          {GEO_CMS_ROUTES.map((route) => <option key={route.routePath} value={route.routePath}>{route.label} ({route.routePath})</option>)}
        </select>
        <button type="submit" className="inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Buka editor</button>
      </form>
    </div>
  );
  const existing = await prisma.geoPage.findUnique({ where: { routePath }, select: { id: true } });
  if (existing) redirect(`/admin/geo/${existing.id}`);
  const fallback = GEO_FALLBACKS[routePath];
  const canPublish = await checkPermission(await auth(), "geo_publish");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Konten CMS</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Siapkan perubahan untuk halaman yang sudah tersedia. Konten bawaan tetap tampil sampai konten CMS diaktifkan.
        </p>
      </div>
      <GeoPageForm page={fallback} canPublish={canPublish} />
    </div>
  );
}
