export const dynamic = "force-dynamic";

import { Inbox, Save } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_STATUS_LABEL,
  COMMISSION_STATUS_LABEL,
  LEAD_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/referrals";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createReferralLeadAction, updateReferralLeadAction } from "./actions";

export default async function AdminReferralLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const [leads, partners, campaigns] = await Promise.all([
    prisma.referralLead.findMany({
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

  const booked = leads.filter((l) => l.leadStatus === "BOOKED" || l.bookingStatus === "BOOKED").length;
  const paid = leads.filter((l) => l.paymentStatus === "FULLY_PAID" || l.leadStatus === "FULLY_PAID").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Leads</h1>
        <p className="text-sm text-gray-500">Catat lead dari WhatsApp, update booking, payment, dan komisi.</p>
      </div>

      {sp.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Total leads</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{leads.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500">Booked</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{booked}</p>
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
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.partner.partnerName} · {c.campaignName}</option>
            ))}
          </select>
          <select name="partnerId" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
            <option value="">Partner manual</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.partnerName} · {p.referralCode}</option>)}
          </select>
          <input name="packageName" placeholder="Package name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <input name="referralCode" placeholder="Referral code manual" className="rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase dark:border-gray-600 dark:bg-gray-900" />
          <input name="transactionValue" type="number" min="0" step="1" placeholder="Transaction value" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          <input name="commissionAmount" type="number" min="0" step="1" placeholder="Commission amount" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
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
            Belum ada referral lead.
          </div>
        ) : leads.map((lead) => (
          <form key={lead.id} action={updateReferralLeadAction} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <input type="hidden" name="id" value={lead.id} />
            <div className="grid gap-4 lg:grid-cols-[1fr_2fr_auto] lg:items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{lead.customerName || lead.customerAlias || "Customer"}</p>
                <p className="text-xs text-gray-500">{lead.whatsappMasked || "-"} · {formatDate(lead.createdAt)}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{lead.packageName}</p>
                <p className="text-xs text-gray-500">{lead.partner?.partnerName ?? "Tanpa partner"} · {lead.referralCode ?? "-"}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Lead</span>
                  <select name="leadStatus" defaultValue={lead.leadStatus} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900">
                    {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Booking</span>
                  <select name="bookingStatus" defaultValue={lead.bookingStatus} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900">
                    {Object.entries(BOOKING_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Payment</span>
                  <select name="paymentStatus" defaultValue={lead.paymentStatus} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900">
                    {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-500">Commission</span>
                  <select name="commissionStatus" defaultValue={lead.commission?.commissionStatus ?? lead.commissionStatus} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900">
                    {Object.entries(COMMISSION_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-bold text-gray-500">Transaction value</span>
                  <input name="transactionValue" type="number" min="0" step="1" defaultValue={lead.transactionValue} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-xs font-bold text-gray-500">Commission amount</span>
                  <input name="commissionAmount" type="number" min="0" step="1" defaultValue={lead.commission?.commissionAmount ?? lead.commissionAmount} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
                </label>
                <label className="space-y-1 md:col-span-4">
                  <span className="text-xs font-bold text-gray-500">Admin notes</span>
                  <textarea name="adminNotes" rows={2} defaultValue={lead.adminNotes ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
                </label>
              </div>

              <div className="text-right">
                <p className="mb-3 text-xs text-gray-500">{formatCurrency(lead.commission?.commissionAmount ?? lead.commissionAmount)}</p>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
                  <Save size={15} />
                  Update
                </button>
              </div>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
