import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function ToursPage() {
  const allTours = await prisma.tour.findMany({ orderBy: { createdAt: "desc" } });

  // Urutkan: upcoming (terdekat duluan) → past (terbaru lewat duluan) → tanpa tanggal
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = allTours
    .filter((t) => t.tripDate && new Date(t.tripDate) >= now)
    .sort((a, b) => new Date(a.tripDate!).getTime() - new Date(b.tripDate!).getTime());

  const past = allTours
    .filter((t) => t.tripDate && new Date(t.tripDate) < now)
    .sort((a, b) => new Date(b.tripDate!).getTime() - new Date(a.tripDate!).getTime());

  const noDate = allTours.filter((t) => !t.tripDate);

  const tours = [...upcoming, ...past, ...noDate];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tour</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tours.length} tour tersedia</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tours/import"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition"
          >
            <Upload size={16} /> Import Massal
          </Link>
          <Link
            href="/admin/tours/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus size={16} /> Tambah Tour
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Negara</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Harga</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Seat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Tgl Keberangkatan</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tours.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Belum ada tour.{" "}
                    <Link href="/admin/tours/new" className="text-blue-600">Tambah sekarang</Link>
                  </td>
                </tr>
              )}
              {tours.map((tour) => (
                <tr key={tour.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{tour.title}</p>
                    {tour.badge && <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">{tour.badge}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tour.country}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {formatCurrency(tour.promoPrice ?? tour.price)}
                    {tour.promoPrice && (
                      <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(tour.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tour.seatsLeft}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      tour.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      tour.status === "FULL" ? "bg-red-100 text-red-700" :
                      tour.status === "CANCELLED" ? "bg-gray-100 text-gray-500" :
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {tour.tripDate ? formatDate(tour.tripDate) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                      >
                        <Pencil size={15} />
                      </Link>
                      <DeleteButton id={tour.id} endpoint="/api/tours" label="tour" />
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
