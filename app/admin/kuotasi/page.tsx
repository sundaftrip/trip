import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, Calculator } from "lucide-react";
import { listQuotations } from "@/lib/kuotasi/data";
import { rupiahShort, fmtDateShort, STATUS_LABEL, STATUS_TONE } from "@/lib/kuotasi/format";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function KuotasiListPage() {
  const rows = await listQuotations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator size={22} className="text-orange-600" /> Kuotasi
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {rows.length} kuotasi · multi-negara, kalkulasi otomatis, itinerary tergenerate
          </p>
        </div>
        <Link
          href="/admin/kuotasi/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition"
          style={{ backgroundColor: "#FE8032" }}
        >
          <Plus size={16} /> Buat Kuotasi
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Destinasi</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Durasi</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">PAX × Selling</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Diperbarui</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Belum ada kuotasi.{" "}
                    <Link href="/admin/kuotasi/new" className="text-orange-600 underline">Buat sekarang</Link>
                  </td>
                </tr>
              )}
              {rows.map((q) => {
                const tiers = q.pricings.slice(0, 3);
                return (
                  <tr key={q.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                    <td className="px-4 py-3">
                      <Link href={`/admin/kuotasi/${q.id}`} className="font-medium text-gray-900 dark:text-white hover:text-orange-600">
                        {q.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {q.country} <span className="text-xs text-gray-400">· {q.currency}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{q.durationDays} hari</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {tiers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {tiers.map((t) => (
                            <span key={t.paxCount} className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
                              {t.paxCount}p · {rupiahShort(t.sellingIdr)}
                            </span>
                          ))}
                          {q.pricings.length > 3 && <span className="text-xs text-gray-400">+{q.pricings.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">belum dihitung</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_TONE[q.status]}`}>
                        {STATUS_LABEL[q.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{fmtDateShort(q.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/api/kuotasi/${q.id}/pdf`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition"
                          title="Preview PDF"
                        >
                          <FileText size={15} />
                        </Link>
                        <Link
                          href={`/admin/kuotasi/${q.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <DeleteButton id={q.id} endpoint="/api/kuotasi" label="kuotasi" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
