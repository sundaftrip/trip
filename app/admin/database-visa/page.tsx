import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Globe2, Info } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import ScrapeVisaButton from "@/components/admin/ScrapeVisaButton";
import { FlagIcon } from "@/lib/flag-icon";

export const dynamic = "force-dynamic";

const VISA_LABEL: Record<string, string> = {
  bebas: "Bebas Visa",
  voa: "Visa on Arrival",
  evisa: "E-Visa",
  wajib: "Visa Wajib",
};

const VISA_BADGE: Record<string, string> = {
  bebas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  voa: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  evisa: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  wajib: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export default async function VisaDatabasePage() {
  const entries = await prisma.countryVisa.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Globe2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Database Visa</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {entries.length} negara tampil di halaman publik /visa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScrapeVisaButton />
          <Link
            href="/admin/database-visa/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <Plus size={16} /> Tambah Negara
          </Link>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>
          Kolom <b>Biaya</b> bisa kamu isi dengan harga IDR-mu sendiri
          (mis. <code className="bg-blue-100 dark:bg-blue-800/40 px-1 rounded">Rp 950.000</code>).
          Kosongkan kalau gratis — di halaman publik tampil &quot;Gratis&quot; warna hijau.
          Tombol <b>Scraping Visa</b> mengecek pembaruan dari Wikipedia tanpa pernah menyentuh kolom Biaya.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Negara</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Wilayah</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Visa</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Tinggal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Biaya</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Belum ada negara.{" "}
                    <Link href="/admin/database-visa/new" className="text-blue-600">
                      Tambah sekarang
                    </Link>
                  </td>
                </tr>
              )}
              {entries.map((c) => {
                const costEmpty = !c.cost.trim();
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <FlagIcon flag={c.flag} rounded label={c.name} width={24} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.en}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.region}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${VISA_BADGE[c.visa] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {VISA_LABEL[c.visa] ?? c.visa}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.stay}</td>
                    <td
                      className={`px-4 py-3 ${
                        costEmpty || c.cost === "Gratis"
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {costEmpty ? "Gratis" : c.cost}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/database-visa/${c.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                        >
                          <Pencil size={15} />
                        </Link>
                        <DeleteButton id={c.id} endpoint="/api/visa-database" label="negara" />
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
