import Link from "next/link";
import { Pencil, Plus, Sparkles } from "lucide-react";

import DeleteButton from "@/components/admin/DeleteButton";
import { GEO_FALLBACKS } from "@/lib/geo-pages";
import { prisma } from "@/lib/prisma";

export default async function GeoAdminPage() {
  const saved = await prisma.geoPage.findMany({ orderBy: [{ order: "asc" }, { updatedAt: "desc" }] });
  const savedByRoute = new Map(saved.map((page) => [page.routePath, page]));
  const fallbackRows = Object.values(GEO_FALLBACKS).map((fallback) => ({
    fallback,
    saved: savedByRoute.get(fallback.routePath),
  }));
  const customRows = saved.filter((page) => !GEO_FALLBACKS[page.routePath]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GEO</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Channel khusus untuk jawaban singkat, FAQ, dan landing page yang mudah dibaca AI.
          </p>
        </div>
        <Link
          href="/admin/geo/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus size={16} /> Tambah GEO
        </Link>
      </div>

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
              {fallbackRows.map(({ fallback, saved }) => (
                <tr key={fallback.routePath} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{saved?.title ?? fallback.title}</p>
                    <p className="text-xs text-gray-400">{saved ? "Editable dari CMS" : "Fallback source code"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{fallback.routePath}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${saved?.published ?? true ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                      {saved ? (saved.published ? "Published" : "Draft") : "Fallback aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {saved ? (
                        <>
                          <Link href={`/admin/geo/${saved.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                            <Pencil size={15} />
                          </Link>
                          <DeleteButton id={saved.id} endpoint="/api/geo-pages" label="halaman GEO" />
                        </>
                      ) : (
                        <Link
                          href={`/admin/geo/new?routePath=${encodeURIComponent(fallback.routePath)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
                        >
                          <Sparkles size={13} /> Buat dari fallback
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
                    <p className="text-xs text-gray-400">Custom GEO page</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{page.routePath}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${page.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                      {page.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/geo/${page.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
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

