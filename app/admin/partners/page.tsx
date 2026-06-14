export const dynamic = "force-dynamic";

import Link from "next/link";
import { Edit, ExternalLink, Plus, PowerOff, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildDashboardLink, buildReferralLink, PARTNER_TYPE_LABEL } from "@/lib/referrals";
import { archivePartnerAction } from "./actions";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const partners = await prisma.referralPartner.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      campaigns: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { leads: true, activityLogs: true, disputes: true } },
      commissions: true,
    },
  });

  const totalLeads = partners.reduce((sum, p) => sum + p._count.leads, 0);
  const pendingCommission = partners
    .flatMap((p) => p.commissions)
    .filter((c) => c.commissionStatus === "PENDING")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Partner</h1>
          <p className="text-sm text-gray-500">Kelola partner, short link, lead referral, dan akses dashboard.</p>
        </div>
        <Link href="/admin/partners/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
          <Plus size={16} />
          Tambah Partner
        </Link>
      </div>

      {sp.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total partner</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{partners.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total referral leads</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{totalLeads}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Pending commission</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(pendingCommission)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 font-bold">Partner</th>
                <th className="px-4 py-3 font-bold">Referral</th>
                <th className="px-4 py-3 font-bold">Campaign</th>
                <th className="px-4 py-3 font-bold">Performance</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Users className="mx-auto mb-3 opacity-40" size={36} />
                    Belum ada partner referral.
                  </td>
                </tr>
              ) : partners.map((partner) => {
                const campaign = partner.campaigns[0];
                return (
                  <tr key={partner.id} className="align-top hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{partner.partnerName}</p>
                      <p className="text-xs text-gray-500">{PARTNER_TYPE_LABEL[partner.partnerType] ?? partner.partnerType}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-mono font-bold text-gray-900 dark:text-white">{partner.referralCode}</p>
                      <a href={buildReferralLink(partner.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-xs text-blue-600 hover:underline">
                        /{partner.slug} <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{campaign?.campaignName ?? "-"}</p>
                      <p className="text-xs text-gray-500">{campaign?.packageName ?? "-"} · {campaign?.discountLabel ?? "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-300">
                      <p>{partner._count.activityLogs} events</p>
                      <p>{partner._count.leads} leads</p>
                      <p>{partner._count.disputes} disputes</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        partner.status === "ACTIVE"
                          ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={buildDashboardLink(partner.slug, partner.dashboardToken)}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka dashboard partner"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <ExternalLink size={15} />
                        </a>
                        <Link href={`/admin/partners/${partner.id}`} className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600" title="Edit">
                          <Edit size={15} />
                        </Link>
                        {partner.status === "ACTIVE" && (
                          <form action={archivePartnerAction}>
                            <input type="hidden" name="id" value={partner.id} />
                            <button type="submit" className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600" title="Nonaktifkan">
                              <PowerOff size={15} />
                            </button>
                          </form>
                        )}
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
