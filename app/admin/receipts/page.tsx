import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Printer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function ReceiptsPage() {
  const receipts = await prisma.receipt.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{receipts.length} receipt</p>
        </div>
        <Link href="/admin/receipts/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
          <Plus size={16} /> Buat Receipt
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">No. Receipt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Pelanggan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Tour</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Tanggal</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  Belum ada receipt. <Link href="/admin/receipts/new" className="text-blue-600">Buat sekarang</Link>
                </td></tr>
              )}
              {receipts.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-white">{r.receiptNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{r.customerName}</p>
                    <p className="text-xs text-gray-400">{r.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[180px] truncate">{r.tourTitle}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(r.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : r.status === "DP" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/receipts/${r.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <Link href={`/admin/receipts/${r.id}/print`} className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition" title="Print PDF">
                        <Printer size={15} />
                      </Link>
                      <DeleteButton id={r.id} endpoint="/api/receipts" label="receipt" />
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
