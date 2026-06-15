"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Filter,
  RotateCcw,
  Save,
  Users,
  WalletCards,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type LabelMap = Record<string, string>;

export type CommissionPartner = {
  id: string;
  partnerName: string;
  referralCode: string;
  status: string;
  commissionType: string;
  commissionValue: number;
};

export type CommissionRow = {
  id: string;
  partnerId: string;
  partnerName: string;
  referralCode: string;
  commissionType: string;
  commissionAmount: number;
  commissionStatus: string;
  estimatedPayoutDate: string;
  paidDate: string;
  createdAt: string;
  lead: {
    id: string;
    customerName: string;
    customerAlias: string;
    whatsappMasked: string;
    packageName: string;
    transactionValue: number;
    leadStatus: string;
    bookingStatus: string;
    paymentStatus: string;
    commissionAmount: number;
    commissionStatus: string;
    adminNotes: string;
    createdAt: string;
  };
};

type Notice = {
  type: "success" | "error" | "pending";
  message: string;
};

type RowPatch = Omit<Partial<CommissionRow>, "lead"> & {
  lead?: Partial<CommissionRow["lead"]>;
};

type Props = {
  partners: CommissionPartner[];
  commissions: CommissionRow[];
  selectedPartnerId: string;
  labels: {
    commissionTypes: LabelMap;
    commissionStatuses: LabelMap;
    leadStatuses: LabelMap;
    bookingStatuses: LabelMap;
    paymentStatuses: LabelMap;
  };
};

function calculateCommission(type: string, value: number, transactionValue: number) {
  if (type === "PERCENTAGE") return Math.round(transactionValue * (value / 100));
  return Math.round(value);
}

function numberValue(value: string | number) {
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function statusClass(status: string) {
  if (status === "PAID" || status === "FULLY_PAID") return "bg-teal-100 text-teal-700";
  if (status === "APPROVED" || status === "BOOKED" || status === "DP_PAID") return "bg-blue-100 text-blue-700";
  if (status === "REJECTED" || status === "CANCELLED" || status === "REFUNDED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function CommissionWorkbench({
  partners: initialPartners,
  commissions: initialCommissions,
  selectedPartnerId: initialSelectedPartnerId,
  labels,
}: Props) {
  const [partners, setPartners] = useState(initialPartners);
  const [rows, setRows] = useState(initialCommissions);
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialSelectedPartnerId);
  const [ruleDirty, setRuleDirty] = useState(false);
  const [ruleSaving, setRuleSaving] = useState(false);
  const [ruleNotice, setRuleNotice] = useState<Notice | null>(null);
  const [simulationValue, setSimulationValue] = useState(31_000_000);
  const [dirtyRows, setDirtyRows] = useState<Record<string, boolean>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [rowNotices, setRowNotices] = useState<Record<string, Notice>>({});

  const selectedPartner = partners.find((partner) => partner.id === selectedPartnerId) ?? null;
  const visibleRows = useMemo(
    () => rows.filter((row) => !selectedPartnerId || row.partnerId === selectedPartnerId),
    [rows, selectedPartnerId],
  );

  const totals = useMemo(() => {
    return visibleRows.reduce(
      (acc, row) => {
        acc.total += row.commissionAmount;
        if (row.commissionStatus === "PENDING") acc.pending += row.commissionAmount;
        if (row.commissionStatus === "APPROVED") acc.approved += row.commissionAmount;
        if (row.commissionStatus === "PAID") acc.paid += row.commissionAmount;
        return acc;
      },
      { pending: 0, approved: 0, paid: 0, total: 0 },
    );
  }, [visibleRows]);

  function applyFilter() {
    const target = selectedPartnerId
      ? `/admin/commissions?partnerId=${encodeURIComponent(selectedPartnerId)}`
      : "/admin/commissions";
    window.location.assign(target);
  }

  function resetFilter() {
    window.location.assign("/admin/commissions");
  }

  function updatePartnerDraft(patch: Partial<CommissionPartner>) {
    if (!selectedPartner) return;
    setPartners((current) =>
      current.map((partner) => (partner.id === selectedPartner.id ? { ...partner, ...patch } : partner)),
    );
    setRuleDirty(true);
    setRuleNotice({ type: "pending", message: "Ada perubahan aturan komisi yang belum disimpan." });
  }

  async function savePartnerRule() {
    if (!selectedPartner) return;
    setRuleSaving(true);
    setRuleNotice(null);

    const response = await fetch(`/api/referrals/partners/${selectedPartner.id}/commission`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commissionType: selectedPartner.commissionType,
        commissionValue: selectedPartner.commissionValue,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setRuleSaving(false);

    if (!response.ok) {
      setRuleNotice({ type: "error", message: data.error ?? "Gagal menyimpan aturan komisi." });
      return;
    }

    setPartners((current) =>
      current.map((partner) => (partner.id === selectedPartner.id ? { ...partner, ...data.partner } : partner)),
    );
    setRuleDirty(false);
    setRuleNotice({ type: "success", message: "Aturan komisi tersimpan." });
  }

  function updateRow(id: string, patch: RowPatch) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        const { lead, ...rowPatch } = patch;
        return {
          ...row,
          ...rowPatch,
          lead: { ...row.lead, ...(lead ?? {}) },
        };
      }),
    );
    setDirtyRows((current) => ({ ...current, [id]: true }));
    setRowNotices((current) => ({
      ...current,
      [id]: { type: "pending", message: "Perubahan belum disimpan." },
    }));
  }

  function applyRuleToRow(row: CommissionRow) {
    const partner = partners.find((item) => item.id === row.partnerId);
    if (!partner) return;
    updateRow(row.id, {
      commissionType: partner.commissionType,
      commissionAmount: calculateCommission(partner.commissionType, partner.commissionValue, row.lead.transactionValue),
    });
  }

  async function saveRow(row: CommissionRow) {
    setSavingRows((current) => ({ ...current, [row.id]: true }));
    setRowNotices((current) => {
      const next = { ...current };
      delete next[row.id];
      return next;
    });

    const response = await fetch(`/api/referrals/commissions/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commissionType: row.commissionType,
        commissionAmount: row.commissionAmount,
        commissionStatus: row.commissionStatus,
        estimatedPayoutDate: row.estimatedPayoutDate,
        paidDate: row.paidDate,
        transactionValue: row.lead.transactionValue,
        leadStatus: row.lead.leadStatus,
        bookingStatus: row.lead.bookingStatus,
        paymentStatus: row.lead.paymentStatus,
        adminNotes: row.lead.adminNotes,
      }),
    });
    const data = await response.json().catch(() => ({}));

    setSavingRows((current) => ({ ...current, [row.id]: false }));

    if (!response.ok) {
      setRowNotices((current) => ({
        ...current,
        [row.id]: { type: "error", message: data.error ?? "Gagal menyimpan komisi." },
      }));
      return;
    }

    setRows((current) =>
      current.map((item) =>
        item.id === row.id
          ? {
              ...item,
              ...data.commission,
              lead: { ...item.lead, ...(data.commission?.lead ?? {}) },
            }
          : item,
      ),
    );
    setDirtyRows((current) => ({ ...current, [row.id]: false }));
    setRowNotices((current) => ({
      ...current,
      [row.id]: { type: "success", message: "Komisi tersimpan." },
    }));
  }

  const rulePreview = selectedPartner
    ? calculateCommission(selectedPartner.commissionType, selectedPartner.commissionValue, simulationValue)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Commissions</h1>
          <p className="text-sm text-gray-500">
            Edit aturan komisi partner, audit payout, dan sinkronkan status lead dari satu layar.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/admin/partners"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <Users size={16} />
            Partner
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPartnerId}
              onChange={(event) => {
                setSelectedPartnerId(event.target.value);
                setRuleDirty(false);
                setRuleNotice(null);
              }}
              className="min-w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="">Semua partner</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.partnerName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={applyFilter}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950"
            >
              <Filter size={15} />
              Filter
            </button>
            {selectedPartnerId && (
              <button
                type="button"
                onClick={resetFilter}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RotateCcw size={15} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Pending", totals.pending],
          ["Approved", totals.approved],
          ["Paid", totals.paid],
          ["Total Ledger", totals.total],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(Number(value))}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Aturan Komisi Partner</p>
            <h2 className="mt-1 text-xl font-black text-gray-900 dark:text-white">
              {selectedPartner ? selectedPartner.partnerName : "Pilih partner untuk edit aturan"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Aturan ini dipakai untuk hitung komisi lead berikutnya dan bisa dipakai ulang untuk kalkulasi ledger.
            </p>
          </div>
          {selectedPartner && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
              {selectedPartner.referralCode} · {selectedPartner.status}
            </span>
          )}
        </div>

        {selectedPartner ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Commission type</span>
              <select
                value={selectedPartner.commissionType}
                onChange={(event) => updatePartnerDraft({ commissionType: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                {Object.entries(labels.commissionTypes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {selectedPartner.commissionType === "PERCENTAGE" ? "Commission value (%)" : "Commission value (Rp)"}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={selectedPartner.commissionValue}
                onChange={(event) => updatePartnerDraft({ commissionValue: numberValue(event.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </label>
            <button
              type="button"
              onClick={savePartnerRule}
              disabled={ruleSaving}
              className={cn(
                "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
                ruleNotice?.type === "success" && !ruleDirty
                  ? "bg-teal-600 hover:bg-teal-700"
                  : ruleDirty
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-gray-950 hover:bg-gray-800",
              )}
            >
              {ruleNotice?.type === "success" && !ruleDirty ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {ruleSaving ? "Menyimpan..." : ruleNotice?.type === "success" && !ruleDirty ? "Tersimpan" : "Simpan Aturan"}
            </button>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900 lg:col-span-3">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Simulasi nilai transaksi</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={simulationValue}
                    onChange={(event) => setSimulationValue(numberValue(event.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-950"
                  />
                </label>
                <div className="rounded-lg border border-teal-200 bg-white px-4 py-3 dark:border-teal-800 dark:bg-gray-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Estimasi komisi</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(rulePreview)}</p>
                </div>
              </div>
            </div>

            {ruleNotice && (
              <p
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-semibold lg:col-span-3",
                  ruleNotice.type === "error" ? "text-red-600" : ruleNotice.type === "pending" ? "text-amber-600" : "text-teal-600",
                )}
              >
                {ruleNotice.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                {ruleNotice.message}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm font-semibold text-gray-500">
            Pilih partner di filter untuk mengubah aturan komisi, lalu simpan dari layar ini.
          </div>
        )}
      </section>

      <div className="space-y-4">
        {visibleRows.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <WalletCards size={38} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">{selectedPartnerId ? "Belum ada ledger komisi untuk partner ini." : "Belum ada ledger komisi."}</p>
            {selectedPartnerId && (
              <Link
                href={`/admin/leads?partnerId=${selectedPartnerId}`}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Buka Lead Partner
              </Link>
            )}
          </div>
        ) : (
          visibleRows.map((row) => {
            const rowNotice = rowNotices[row.id];
            const isDirty = dirtyRows[row.id];
            const isSaving = savingRows[row.id];
            return (
              <section
                key={row.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_2.4fr_auto] lg:items-start">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {row.lead.customerName || row.lead.customerAlias || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {row.lead.whatsappMasked || "-"} · {formatDate(row.createdAt)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{row.lead.packageName}</p>
                    <p className="text-xs text-gray-500">
                      {row.partnerName} · {row.referralCode}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusClass(row.commissionStatus))}>
                        {labels.commissionStatuses[row.commissionStatus] ?? row.commissionStatus}
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusClass(row.lead.paymentStatus))}>
                        {labels.paymentStatuses[row.lead.paymentStatus] ?? row.lead.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Lead</span>
                      <select
                        value={row.lead.leadStatus}
                        onChange={(event) => updateRow(row.id, { lead: { leadStatus: event.target.value } })}
                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900"
                      >
                        {Object.entries(labels.leadStatuses).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Booking</span>
                      <select
                        value={row.lead.bookingStatus}
                        onChange={(event) => updateRow(row.id, { lead: { bookingStatus: event.target.value } })}
                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900"
                      >
                        {Object.entries(labels.bookingStatuses).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Payment</span>
                      <select
                        value={row.lead.paymentStatus}
                        onChange={(event) => updateRow(row.id, { lead: { paymentStatus: event.target.value } })}
                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900"
                      >
                        {Object.entries(labels.paymentStatuses).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Komisi</span>
                      <select
                        value={row.commissionStatus}
                        onChange={(event) =>
                          updateRow(row.id, {
                            commissionStatus: event.target.value,
                            lead: { commissionStatus: event.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900"
                      >
                        {Object.entries(labels.commissionStatuses).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-bold text-gray-500">Transaction value</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.lead.transactionValue}
                        onChange={(event) => updateRow(row.id, { lead: { transactionValue: numberValue(event.target.value) } })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Type</span>
                      <select
                        value={row.commissionType}
                        onChange={(event) => updateRow(row.id, { commissionType: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-2 py-2 text-xs dark:border-gray-600 dark:bg-gray-900"
                      >
                        {Object.entries(labels.commissionTypes).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Commission amount</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.commissionAmount}
                        onChange={(event) =>
                          updateRow(row.id, {
                            commissionAmount: numberValue(event.target.value),
                            lead: { commissionAmount: numberValue(event.target.value) },
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-bold text-gray-500">Estimated payout</span>
                      <input
                        type="date"
                        value={row.estimatedPayoutDate}
                        onChange={(event) => updateRow(row.id, { estimatedPayoutDate: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-bold text-gray-500">Paid date</span>
                      <input
                        type="date"
                        value={row.paidDate}
                        onChange={(event) => updateRow(row.id, { paidDate: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-4">
                      <span className="text-xs font-bold text-gray-500">Admin notes</span>
                      <textarea
                        rows={2}
                        value={row.lead.adminNotes}
                        onChange={(event) => updateRow(row.id, { lead: { adminNotes: event.target.value } })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                      />
                    </label>
                  </div>

                  <div className="space-y-2 text-right">
                    <p className="text-xs text-gray-500">Payout</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(row.commissionAmount)}</p>
                    <button
                      type="button"
                      onClick={() => applyRuleToRow(row)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200"
                    >
                      <Calculator size={14} />
                      Hitung Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => saveRow(row)}
                      disabled={isSaving}
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
                        rowNotice?.type === "success" && !isDirty
                          ? "bg-teal-600 hover:bg-teal-700"
                          : isDirty
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-gray-950 hover:bg-gray-800",
                      )}
                    >
                      {rowNotice?.type === "success" && !isDirty ? <CheckCircle2 size={15} /> : <Save size={15} />}
                      {isSaving ? "Menyimpan..." : rowNotice?.type === "success" && !isDirty ? "Tersimpan" : "Simpan"}
                    </button>
                    {rowNotice && (
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          rowNotice.type === "error"
                            ? "text-red-600"
                            : rowNotice.type === "pending"
                              ? "text-amber-600"
                              : "text-teal-600",
                        )}
                      >
                        {rowNotice.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
