export const dynamic = "force-dynamic";

import { WalletCards } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { COMMISSION_STATUS_LABEL, COMMISSION_TYPE_LABEL } from "@/lib/referrals";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateCommissionAction } from "./actions";

function dateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function AdminCommissionsPage() {
  const commissions = await prisma.referralCommission.findMany({
    orderBy: [{ commissionStatus: "asc" }, { createdAt: "desc" }],
    include: { partner: true, lead: true },
  });

  const pending = commissions.filter((c) => c.commissionStatus === "PENDING").reduce((sum, c) => sum + c.commissionAmount, 0);
  const approved = commissions.filter((c) => c.commissionStatus === "APPROVED").reduce((sum, c) => sum + c.commissionAmount, 0);
  const paid = commissions.filter((c) => c.commissionStatus === "PAID").reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Commissions</h1>
        <p className="text-sm text-gray-500">Review, approve, dan tandai komisi partner yang sudah dibayar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(pending)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(approved)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(paid)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {commissions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <WalletCards size={38} className="mx-auto mb-3 opacity-40" />
            Belum ada komisi.
          </div>
        ) : commissions.map((commission) => (
          <form key={commission.id} action={updateCommissionAction} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <input type="hidden" name="id" value={commission.id} />
            <div className="grid gap-4 lg:grid-cols-[1fr_2fr_auto] lg:items-end">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{commission.partner.partnerName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{commission.lead.customerAlias || commission.lead.customerName || "Customer"}</p>
                <p className="text-xs text-gray-500">{commission.lead.packageName} · {formatDate(commission.createdAt)}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Type</span>
                  <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900">
                    {COMMISSION_TYPE_LABEL[commission.commissionType] ?? commission.commissionType}
                  </p>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Amount</span>
                  <input name="commissionAmount" type="number" min="0" step="1" defaultValue={commission.commissionAmount} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Status</span>
                  <select name="commissionStatus" defaultValue={commission.commissionStatus} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
                    {Object.entries(COMMISSION_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Estimated payout</span>
                  <input name="estimatedPayoutDate" type="date" defaultValue={dateValue(commission.estimatedPayoutDate)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-bold text-gray-500">Paid date</span>
                  <input name="paidDate" type="date" defaultValue={dateValue(commission.paidDate)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
                </label>
                <div className="md:col-span-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900">
                  Transaction: {formatCurrency(commission.lead.transactionValue)}
                </div>
              </div>
              <button type="submit" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
                Update
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
