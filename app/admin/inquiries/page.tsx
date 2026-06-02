export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Inbox } from "lucide-react";
import InquiryRow from "./InquiryRow";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  CLOSED: "Selesai",
};

export default async function InquiriesPage() {
  const items = await prisma.inquiry.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const newCount = items.filter((i) => i.status === "NEW").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-sm">
          <Inbox size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Lead Masuk</h1>
          <p className="text-sm text-gray-500">
            {items.length} total · {newCount} belum dihubungi
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Belum ada lead masuk dari formulir konsultasi.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Tujuan / Waktu</th>
                <th className="px-4 py-3 font-semibold">Pesan</th>
                <th className="px-4 py-3 font-semibold">Masuk</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((i) => (
                <InquiryRow
                  key={i.id}
                  inquiry={{
                    id: i.id,
                    name: i.name,
                    whatsapp: i.whatsapp,
                    email: i.email,
                    destination: i.destination,
                    travelDate: i.travelDate,
                    message: i.message,
                    source: i.source,
                    status: i.status,
                    createdAt: i.createdAt.toISOString(),
                  }}
                  statusLabel={STATUS_LABEL}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
