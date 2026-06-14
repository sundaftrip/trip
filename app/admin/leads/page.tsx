export const dynamic = "force-dynamic";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_STATUS_LABEL,
  COMMISSION_STATUS_LABEL,
  LEAD_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/referrals";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createReferralLeadAction, updateReferralLeadAction } from "./actions";
import ReferralLeadCard from "@/components/admin/referrals/ReferralLeadCard";

export default async function AdminReferralLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; partnerId?: string }>;
}) {
  const sp = await searchParams;
  const partnerId = sp.partnerId?.trim() ?? "";
  const [leads, partners, campaigns] = await Promise.all([
    prisma.referralLead.findMany({
      where: partnerId ? { partnerId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { partner: true, campaign: true, commission: true },
    }),
    prisma.referralPartner.findMany({ where: { status: "ACTIVE" }, orderBy: { partnerName: "asc" } }),
    prisma.referralCampaign.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { partner: true },
    }),
  ]);

  const selectedPartner = partners.find((partner) => partner.id === partnerId);
  const booked = leads.filter((lead) => lead.leadStatus === "BOOKED" || lead.bookingStatus === "BOOKED").length;
  const dpPaid = leads.filter((lead) => lead.paymentStatus === "DP_PAID").length;
  const paid = leads.filter((lead) => lead.paymentStatus === "FULLY_PAID" || lead.leadStatus === "FULLY_PAID").length;
  const leadStatusOptions = Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => ({ value, label }));
  const bookingStatusOptions = Object.entries(BOOKING_STATUS_LABEL).map(([value, label]) => ({ value, label }));
  const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => ({ value, label }));
  const commissionStatusOptions = Object.entries(COMMISSION_STATUS_LABEL).map(([value, label]) => ({ value, label }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Leads</h1>
          <p className="text-sm text-gray-500">
            {selectedPartner
              ? `Catat DP dan komisi untuk ${selectedPartner.partnerName}.`
              : "Catat lead dari WhatsApp, update booking, payment, dan komisi saat DP."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/admin/partners" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            Partner
          </Link>
          <form action="/admin/leads" className="flex flex-wrap items-center gap-2">
            <select name="partnerId" defaultValue={partnerId} className="min-w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200">
              <option value="">Semua partner</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.partnerName}</option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
              Filter
            </button>
            {partnerId && (
              <Link href="/admin/leads" className="rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                Reset
              </Link>
            )}
          </form>
        </div>
      </div>

      {sp.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total leads</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{leads.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Booked</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{booked}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Sudah DP</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{dpPaid}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Fully paid</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{paid}</p>
        </div>
      </div>

      <form action={createReferralLeadAction} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Tambah Lead Manual</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <input name="customerName" placeholder="Customer name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <input name="whatsappNumber" placeholder="WhatsApp number" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <select name="campaignId" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
            <option value="">Pilih campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.partner.partnerName} · {campaign.campaignName}</option>
            ))}
          </select>
          <select name="partnerId" defaultValue={partnerId} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
            <option value="">Partner manual</option>
            {partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.partnerName} · {partner.referralCode}</option>)}
          </select>
          <input name="packageName" placeholder="Package name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <input name="referralCode" placeholder="Referral code manual" className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase dark:border-gray-600 dark:bg-gray-900" />
          <select name="paymentStatus" defaultValue="UNPAID" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
            {paymentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input name="transactionValue" type="number" min="0" step="1" placeholder="Transaction value" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <input name="commissionAmount" type="number" min="0" step="1" placeholder="Komisi jika sudah DP" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <input name="sourceUrl" placeholder="Source URL" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <textarea name="adminNotes" placeholder="Admin notes" rows={3} className="md:col-span-3 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
          Simpan Lead
        </button>
      </form>

      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Inbox size={38} className="mx-auto mb-3 opacity-40" />
            {partnerId ? "Belum ada referral lead untuk partner ini." : "Belum ada referral lead."}
          </div>
        ) : leads.map((lead) => {
          const commissionAmount = lead.commission?.commissionAmount ?? lead.commissionAmount;
          const commissionStatus = lead.commission?.commissionStatus ?? lead.commissionStatus;

          return (
            <ReferralLeadCard
              key={lead.id}
              action={updateReferralLeadAction}
              lead={{
                id: lead.id,
                customerLabel: lead.customerName || lead.customerAlias || "Customer",
                whatsappLabel: lead.whatsappMasked || "-",
                createdAtLabel: formatDate(lead.createdAt),
                packageName: lead.packageName,
                partnerLabel: lead.partner?.partnerName ?? "Tanpa partner",
                referralCode: lead.referralCode ?? "-",
                leadStatus: lead.leadStatus,
                bookingStatus: lead.bookingStatus,
                paymentStatus: lead.paymentStatus,
                transactionValue: lead.transactionValue,
                adminNotes: lead.adminNotes ?? "",
                commissionAmount,
                commissionStatus,
                commissionLabel: formatCurrency(commissionAmount),
                hasCommission: Boolean(lead.commission),
              }}
              leadStatusOptions={leadStatusOptions}
              bookingStatusOptions={bookingStatusOptions}
              paymentStatusOptions={paymentStatusOptions}
              commissionStatusOptions={commissionStatusOptions}
            />
          );
        })}
      </div>
    </div>
  );
}
