export const dynamic = "force-dynamic";

import { ExternalLink, MessageSquareWarning } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DISPUTE_STATUS_LABEL } from "@/lib/referrals";
import { formatDate } from "@/lib/utils";
import { updateDisputeAction } from "./actions";

export default async function AdminDisputesPage() {
  const disputes = await prisma.referralDispute.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { partner: true },
  });

  const openCount = disputes.filter((d) => d.status === "OPEN" || d.status === "REVIEWING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Disputes</h1>
        <p className="text-sm text-gray-500">{openCount} laporan perlu review.</p>
      </div>

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <MessageSquareWarning size={38} className="mx-auto mb-3 opacity-40" />
            Belum ada dispute.
          </div>
        ) : disputes.map((dispute) => (
          <div key={dispute.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_auto] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{dispute.partner.partnerName}</p>
                <h2 className="mt-1 text-lg font-black text-gray-900 dark:text-white">{dispute.customerHint}</h2>
                <p className="text-sm text-gray-500">{dispute.packageName || "-"} · {dispute.approximateDate || "tanggal tidak diisi"}</p>
                <p className="mt-2 text-xs text-gray-400">Masuk {formatDate(dispute.createdAt)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <p className="whitespace-pre-wrap">{dispute.note}</p>
                {dispute.screenshotUrl && (
                  <a href={dispute.screenshotUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:underline">
                    Buka screenshot <ExternalLink size={13} />
                  </a>
                )}
              </div>
              <form action={updateDisputeAction} className="space-y-3">
                <input type="hidden" name="id" value={dispute.id} />
                <select name="status" defaultValue={dispute.status} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                  {Object.entries(DISPUTE_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button type="submit" className="w-full rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
                  Update
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
