import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import DeleteButton from "@/components/admin/DeleteButton";
import { GEO_FALLBACKS } from "@/lib/geo-pages";
import { prisma } from "@/lib/prisma";
import { GEO_CMS_ROUTES, getGeoCmsDisplayState, isSupportedGeoRoute } from "@/lib/geo-cms-routes";

export default async function GeoAdminPage() {
  const saved = await prisma.geoPage.findMany({ orderBy: [{ order: "asc" }, { updatedAt: "desc" }] });
  const savedByRoute = new Map(saved.map((page) => [page.routePath, page]));
  const fallbackRows = GEO_CMS_ROUTES.map(({ routePath }) => {
    const fallback = GEO_FALLBACKS[routePath];
    const saved = savedByRoute.get(routePath);
    return { fallback, saved, state: getGeoCmsDisplayState(routePath, saved?.published) };
  });
  const customRows = saved.filter((page) => !isSupportedGeoRoute(page.routePath));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GEO</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola ringkasan dan FAQ pada halaman yang sudah terhubung ke CMS.
          </p>
        </div>
        <Link
          href="/admin/geo/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus size={16} /> Pilih Halaman
        </Link>
      </div>

      <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
        Pada halaman yang terhubung, konten CMS tampil pada bagian yang didukung; informasi bawaan tertentu tetap digunakan. Saat konten CMS dinonaktifkan atau dihapus, URL tetap dapat dibuka dengan konten bawaan. Halaman baru memerlukan sambungan website terlebih dahulu.
      </p>
      {customRows.length > 0 && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Ada {customRows.length} catatan lama yang belum terhubung. Catatan tetap tersimpan, tetapi tidak ditandai aktif di website dan tidak memiliki tautan pratinjau CMS.
        </p>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Halaman</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Route</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fallbackRows.map(({ fallback, saved, state }) => (
                <tr key={fallback.routePath} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{saved?.title ?? fallback.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{saved ? "Konten CMS tersimpan" : "Belum ada perubahan CMS"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{fallback.routePath}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${saved?.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                      {state.label}
                    </span>
                    <p className="mt-2 max-w-xs text-xs text-gray-500 dark:text-gray-400">{state.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {state.publicHref && <Link href={state.publicHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-blue-600 dark:text-blue-400">Lihat website</Link>}
                      {saved ? (
                        <>
                          <Link href={`/admin/geo/${saved.id}`} aria-label={`Edit konten ${saved.title}`} className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                            <Pencil size={15} />
                          </Link>
                          <DeleteButton id={saved.id} endpoint="/api/geo-pages" label="konten CMS (website kembali ke konten bawaan)" />
                        </>
                      ) : (
                        <Link
                          href={`/admin/geo/new?routePath=${encodeURIComponent(fallback.routePath)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
                        >
                          Edit konten bawaan
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {customRows.map((page) => (
                <tr key={page.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{page.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Catatan lama, belum terhubung</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{page.routePath}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      {getGeoCmsDisplayState(page.routePath, page.published).label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/geo/${page.id}`} aria-label={`Lihat catatan ${page.title}`} className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton id={page.id} endpoint="/api/geo-pages" label="halaman GEO" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
