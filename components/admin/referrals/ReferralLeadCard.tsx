"use client";

import { useState } from "react";
import { Save } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

type LeadCardData = {
  id: string;
  customerLabel: string;
  whatsappLabel: string;
  createdAtLabel: string;
  packageName: string;
  partnerLabel: string;
  referralCode: string;
  leadStatus: string;
  bookingStatus: string;
  paymentStatus: string;
  transactionValue: number;
  adminNotes: string;
  commissionAmount: number;
  commissionStatus: string;
  commissionLabel: string;
  hasCommission: boolean;
};

interface Props {
  lead: LeadCardData;
  leadStatusOptions: Option[];
  bookingStatusOptions: Option[];
  paymentStatusOptions: Option[];
  commissionStatusOptions: Option[];
  action: (formData: FormData) => void | Promise<void>;
}

function isCommissionDue(paymentStatus: string) {
  return paymentStatus === "DP_PAID" || paymentStatus === "FULLY_PAID";
}

export default function ReferralLeadCard({
  lead,
  leadStatusOptions,
  bookingStatusOptions,
  paymentStatusOptions,
  commissionStatusOptions,
  action,
}: Props) {
  const [paymentStatus, setPaymentStatus] = useState(lead.paymentStatus);
  const showCommissionForm = isCommissionDue(paymentStatus) || lead.hasCommission;

  return (
    <form action={action} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <input type="hidden" name="id" value={lead.id} />
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr_auto] lg:items-start">
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{lead.customerLabel}</p>
          <p className="text-xs text-gray-500">{lead.whatsappLabel} · {lead.createdAtLabel}</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{lead.packageName}</p>
          <p className="text-xs text-gray-500">{lead.partnerLabel} · {lead.referralCode}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs font-bold text-gray-500">Lead</span>
            <select name="leadStatus" defaultValue={lead.leadStatus} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900">
              {leadStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-gray-500">Booking</span>
            <select name="bookingStatus" defaultValue={lead.bookingStatus} className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900">
              {bookingStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-gray-500">Payment</span>
            <select
              name="paymentStatus"
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-gray-500">Transaction value</span>
            <input name="transactionValue" type="number" min="0" step="1" defaultValue={lead.transactionValue} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          </label>

          {showCommissionForm ? (
            <div className="md:col-span-4 rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/30">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-black text-teal-800 dark:text-teal-200">Form Komisi Setelah DP</p>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Saat ini: {lead.commissionLabel}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">Nominal komisi mitra</span>
                  <input name="commissionAmount" type="number" min="0" step="1" defaultValue={lead.commissionAmount} className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm dark:border-teal-700 dark:bg-gray-900" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">Status komisi</span>
                  <select name="commissionStatus" defaultValue={lead.commissionStatus} className="w-full rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm dark:border-teal-700 dark:bg-gray-900">
                    {commissionStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : (
            <>
              <input type="hidden" name="commissionAmount" value="0" />
              <input type="hidden" name="commissionStatus" value="PENDING" />
              <div className="md:col-span-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                Form komisi akan muncul ketika Payment dipilih DP Paid atau Fully Paid.
              </div>
            </>
          )}

          <label className="space-y-1 md:col-span-4">
            <span className="text-xs font-bold text-gray-500">Admin notes</span>
            <textarea name="adminNotes" rows={2} defaultValue={lead.adminNotes} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" />
          </label>
        </div>

        <div className="text-right">
          <p className="mb-3 text-xs text-gray-500">{lead.commissionLabel}</p>
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
            <Save size={15} />
            Update
          </button>
        </div>
      </div>
    </form>
  );
}
