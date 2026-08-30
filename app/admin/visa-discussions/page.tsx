export const dynamic = "force-dynamic";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { visaDiscussionTableAvailable } from "@/lib/visa-discussions";
import VisaDiscussionRow from "./VisaDiscussionRow";
import styles from "@/components/admin/AdminWorkspace.module.css";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  PUBLISHED: "Tampil",
  REJECTED: "Ditolak",
};

type QueueView = "all" | "pending" | "reports";

export default async function AdminVisaDiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const session = await auth();
  const canView = await checkPermission(session, "visa_discussion_view");
  if (!canView) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Diskusi Visa</h1>
        <p className="mt-3 text-sm text-gray-500">
          Akun ini tidak memiliki izin untuk melihat antrean moderasi.
        </p>
      </div>
    );
  }

  const canModerate = await checkPermission(session, "visa_discussion_moderate");
  if (!(await visaDiscussionTableAvailable())) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Diskusi Visa</h1>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tabel diskusi belum diaktifkan. Halaman publik tetap berada dalam mode aman tanpa menerima kiriman.
        </div>
      </div>
    );
  }

  const requestedView = (await searchParams).view;
  const view: QueueView = requestedView === "pending" || requestedView === "reports"
    ? requestedView
    : "all";
  const where = view === "pending"
    ? { status: "PENDING" as const }
    : view === "reports"
      ? { reports: { some: { status: "OPEN" as const } } }
      : {};
  const [items, pendingCount, openReportCount] = await Promise.all([
    prisma.visaDiscussion.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      include: {
        reports: {
          ...(view === "reports" ? { where: { status: "OPEN" as const } } : {}),
          orderBy: { createdAt: "desc" },
          take: 25,
          select: {
            id: true,
            reason: true,
            details: true,
            status: true,
            createdAt: true,
          },
        },
        _count: { select: { reports: true } },
      },
    }),
    prisma.visaDiscussion.count({ where: { status: "PENDING" } }),
    prisma.visaDiscussionReport.count({ where: { status: "OPEN" } }),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="text-gray-900 dark:text-white">Diskusi Visa</h1>
          <p className="text-sm text-gray-500">
            {items.length} kiriman · {pendingCount} menunggu tinjauan
          </p>
        </div>
      </div>

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter antrean diskusi visa">
        {[
          { value: "all", label: "Semua", count: null },
          { value: "pending", label: "Menunggu", count: pendingCount },
          { value: "reports", label: "Laporan terbuka", count: openReportCount },
        ].map((filter) => {
          const active = view === filter.value;
          const href = filter.value === "all" ? "/admin/visa-discussions" : `?view=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {filter.label}{filter.count === null ? "" : ` (${filter.count})`}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <MessageSquareText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Belum ada diskusi visa dari pengunjung.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 font-semibold">Penulis</th>
                <th className="px-4 py-3 font-semibold">Konteks</th>
                <th className="px-4 py-3 font-semibold">Isi</th>
                <th className="px-4 py-3 font-semibold">Masuk</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <VisaDiscussionRow
                  key={item.id}
                  item={{
                    id: item.id,
                    parentId: item.parentId,
                    authorName: item.authorName,
                    countryName: item.countryName,
                    topic: item.topic,
                    caseContext: item.caseContext,
                    title: item.title,
                    message: item.message,
                    sourceUrl: item.sourceUrl,
                    status: item.status,
                    isAdminReply: item.isAdminReply,
                    isLocked: item.isLocked,
                    reportCount: item._count.reports,
                    reports: item.reports.map((report) => ({
                      ...report,
                      createdAt: report.createdAt.toISOString(),
                    })),
                    createdAt: item.createdAt.toISOString(),
                  }}
                  statusLabel={STATUS_LABEL}
                  canModerate={canModerate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
