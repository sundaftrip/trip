export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Inbox } from "lucide-react";
import InquiryRow from "./InquiryRow";
import styles from "@/components/admin/AdminWorkspace.module.css";

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
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="text-gray-900 dark:text-white">Lead Masuk</h1>
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
        <div className={styles.tablePanel}>
          <div className="overflow-x-auto">
          <table aria-label="Lead masuk" className="w-full min-w-[840px] text-sm">
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
        </div>
      )}
    </div>
  );
}
