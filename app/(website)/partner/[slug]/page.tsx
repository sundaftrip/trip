export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BadgePercent,
  Banknote,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  MessageCircle,
  Ticket,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import CopyButton from "@/components/website/CopyButton";
import {
  buildReferralLink,
  COMMISSION_STATUS_LABEL,
  DISPUTE_STATUS_LABEL,
  formatPercent,
  LEAD_STATUS_LABEL,
  logReferralEvent,
  PARTNER_TYPE_LABEL,
} from "@/lib/referrals";
import { formatCurrency, formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string; sent?: string }>;
};

export const metadata: Metadata = {
  title: "Partner Dashboard | Sundaf Trip",
  robots: { index: false, follow: false },
};

async function createDispute(formData: FormData) {
  "use server";

  const partnerId = String(formData.get("partnerId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const token = String(formData.get("token") ?? "");
  const customerHint = String(formData.get("customerHint") ?? "").trim().slice(0, 160);
  const packageName = String(formData.get("packageName") ?? "").trim().slice(0, 160);
  const approximateDate = String(formData.get("approximateDate") ?? "").trim().slice(0, 120);
  const note = String(formData.get("note") ?? "").trim().slice(0, 1500);
  const screenshotUrl = String(formData.get("screenshotUrl") ?? "").trim().slice(0, 500);

  const partner = await prisma.referralPartner.findFirst({
    where: { id: partnerId, slug, dashboardToken: token, status: "ACTIVE" },
    select: { id: true },
  });

  if (!partner || !customerHint || !note) redirect(`/partner/${slug}?token=${encodeURIComponent(token)}&sent=0`);

  const dispute = await prisma.referralDispute.create({
    data: {
      partnerId: partner.id,
      customerHint,
      packageName: packageName || null,
      approximateDate: approximateDate || null,
      note,
      screenshotUrl: screenshotUrl || null,
      status: "OPEN",
    },
  });

  await logReferralEvent({
    eventType: "dispute_created",
    eventLabel: customerHint,
    partnerId: partner.id,
    metadata: { disputeId: dispute.id, packageName, approximateDate },
  });

  redirect(`/partner/${slug}?token=${encodeURIComponent(token)}&sent=1`);
}

function statCard(label: string, value: string | number, Icon: typeof Users, note?: string) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon size={17} />
      </div>
      <p className="text-2xl font-black text-gray-950">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    </div>
  );
}

type LogItem = {
  id: string;
  eventType: string;
  eventLabel: string | null;
  metadata: unknown;
  createdAt: Date;
};

function metadataRecord(metadata: unknown) {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata)
    ? metadata as Record<string, unknown>
    : {};
}

function visitorId(log: LogItem) {
  const raw = metadataRecord(log.metadata).visitorId;
  return typeof raw === "string" && raw.trim() ? raw : null;
}

function buildVisitorLabels(logs: LogItem[]) {
  const labels = new Map<string, string>();
  const chronological = [...logs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  for (const log of chronological) {
    const id = visitorId(log);
    if (!id || labels.has(id)) continue;
    labels.set(id, `Visitor #${labels.size + 1}`);
  }
  return labels;
}

function uniqueVisitorCount(logs: LogItem[], eventType?: string) {
  const ids = new Set<string>();
  for (const log of logs) {
    if (eventType && log.eventType !== eventType) continue;
    const id = visitorId(log);
    if (id) ids.add(id);
  }
  return ids.size;
}

function eventLabel(eventType: string) {
  return eventType.replaceAll("_", " ");
}

export default async function PartnerDashboardPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const token = sp.token ?? "";

  const partner = await prisma.referralPartner.findFirst({
    where: { slug, dashboardToken: token, status: "ACTIVE" },
    include: {
      campaigns: { orderBy: [{ status: "asc" }, { createdAt: "desc" }] },
      leads: {
        orderBy: { createdAt: "desc" },
        include: { commission: true },
      },
      commissions: true,
      disputes: { orderBy: { createdAt: "desc" }, take: 8 },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 500 },
    },
  });

  if (!partner) {
    return (
      <section className="min-h-[70vh] bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-3 text-red-600" size={34} />
          <h1 className="text-xl font-black text-gray-950">Token dashboard tidak valid</h1>
          <p className="mt-2 text-sm text-gray-600">
            Minta ulang link dashboard dari tim Sundaf Trip jika link ini sudah diganti.
          </p>
        </div>
      </section>
    );
  }

  const campaign = partner.campaigns.find((c) => c.status === "ACTIVE") ?? partner.campaigns[0];
  const referralLink = buildReferralLink(partner.slug);
  const logs = partner.activityLogs;
  const visibleLogs = logs.slice(0, 50);
  const visitorLabels = buildVisitorLabels(logs);
  const leads = partner.leads;
  const commissions = partner.commissions;
  const rawPageViews = logs.filter((l) => l.eventType === "referral_page_view").length;
  const rawWaClicks = logs.filter((l) => l.eventType === "whatsapp_redirect_clicked").length;
  const uniqueVisitors = uniqueVisitorCount(logs);
  const uniquePageViews = uniqueVisitorCount(logs, "referral_page_view");
  const uniqueWaClicks = uniqueVisitorCount(logs, "whatsapp_redirect_clicked");
  const validLeads = leads.filter((l) => l.leadStatus !== "NEW_LEAD" && l.leadStatus !== "CANCELLED").length;
  const bookings = leads.filter((l) => l.leadStatus === "BOOKED" || l.bookingStatus === "BOOKED").length;
  const paidCustomers = leads.filter((l) => l.leadStatus === "FULLY_PAID" || l.paymentStatus === "FULLY_PAID").length;
  const cancelled = leads.filter((l) => l.leadStatus === "CANCELLED" || l.bookingStatus === "CANCELLED").length;
  const conversionRate = uniqueVisitors ? (leads.length / uniqueVisitors) * 100 : 0;
  const pendingCommission = commissions.filter((c) => c.commissionStatus === "PENDING").reduce((sum, c) => sum + c.commissionAmount, 0);
  const approvedCommission = commissions.filter((c) => c.commissionStatus === "APPROVED").reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidCommission = commissions.filter((c) => c.commissionStatus === "PAID").reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Sundaf Trip Partner Dashboard</p>
              <h1 className="mt-1 text-2xl font-black text-gray-950 sm:text-3xl">{partner.partnerName}</h1>
              <p className="text-sm text-gray-500">{PARTNER_TYPE_LABEL[partner.partnerType] ?? partner.partnerType}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={referralLink} label="Copy referral link" />
              <CopyButton value={partner.referralCode} label="Copy kode" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                <LinkIcon size={14} /> Short Link
              </p>
              <p className="break-all font-mono text-sm font-semibold text-gray-950">{referralLink}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                <Ticket size={14} /> Kode
              </p>
              <p className="font-mono text-xl font-black text-gray-950">{partner.referralCode}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                <BadgePercent size={14} /> Campaign
              </p>
              <p className="font-bold text-gray-950">{campaign?.campaignName ?? "-"}</p>
              <p className="text-sm text-gray-500">{campaign?.packageName ?? "-"} · {campaign?.discountLabel ?? "-"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCard("Unique visitors", uniqueVisitors, LinkIcon, `${rawPageViews} raw page views`)}
          {statCard("Unique WhatsApp clicks", uniqueWaClicks, MessageCircle, `${rawWaClicks} raw WhatsApp clicks`)}
          {statCard("Total leads", leads.length, Users)}
          {statCard("Conversion rate", formatPercent(conversionRate), TrendingUp, "leads / unique visitors")}
          {statCard("Unique page views", uniquePageViews, LinkIcon)}
          {statCard("Valid leads", validLeads, CheckCircle2)}
          {statCard("Bookings", bookings, Ticket)}
          {statCard("Paid customers", paidCustomers, Banknote)}
          {statCard("Cancelled leads", cancelled, XCircle)}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-950">Pending commission</p>
            <p className="mt-2 text-2xl font-black text-gray-950">{formatCurrency(pendingCommission)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-950">Approved commission</p>
            <p className="mt-2 text-2xl font-black text-gray-950">{formatCurrency(approvedCommission)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-950">Paid commission</p>
            <p className="mt-2 text-2xl font-black text-gray-950">{formatCurrency(paidCommission)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="text-lg font-black text-gray-950">Lead List</h2>
              <p className="text-sm text-gray-500">Data customer dianonimkan untuk privasi.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-4 py-3 font-bold">Package</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Commission</th>
                    <th className="px-4 py-3 font-bold">Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada lead tercatat.</td>
                    </tr>
                  ) : leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-3 font-semibold text-gray-950">{lead.customerAlias || `Customer #${lead.id.slice(-4).toUpperCase()}`}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.packageName}</td>
                      <td className="px-4 py-3 text-gray-600">{LEAD_STATUS_LABEL[lead.leadStatus] ?? lead.leadStatus}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatCurrency(lead.commission?.commissionAmount ?? lead.commissionAmount)}
                        <span className="block text-xs text-gray-400">
                          {COMMISSION_STATUS_LABEL[lead.commission?.commissionStatus ?? lead.commissionStatus] ?? lead.commissionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-gray-950">Missing Lead Report</h2>
              {sp.sent === "1" && (
                <p className="mt-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                  Laporan terkirim.
                </p>
              )}
              <form action={createDispute} className="mt-4 space-y-3">
                <input type="hidden" name="partnerId" value={partner.id} />
                <input type="hidden" name="slug" value={partner.slug} />
                <input type="hidden" name="token" value={token} />
                <input name="customerHint" required placeholder="Nama / inisial customer" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input name="approximateDate" placeholder="Perkiraan tanggal chat" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input name="packageName" placeholder="Paket" defaultValue={campaign?.packageName ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input name="screenshotUrl" placeholder="Link screenshot (opsional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <textarea name="note" required rows={4} placeholder="Catatan" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <button type="submit" className="w-full rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800">
                  Kirim Laporan
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-gray-950">Dispute</h2>
              <div className="mt-4 space-y-3">
                {partner.disputes.length === 0 ? (
                  <p className="text-sm text-gray-400">Belum ada laporan.</p>
                ) : partner.disputes.map((d) => (
                  <div key={d.id} className="rounded-lg bg-gray-50 p-3">
                    <p className="font-semibold text-gray-950">{d.customerHint}</p>
                    <p className="text-xs text-gray-500">{d.packageName || "-"} · {DISPUTE_STATUS_LABEL[d.status] ?? d.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950">
            <Activity size={18} />
            Activity Log
          </h2>
          <div className="space-y-3">
            {visibleLogs.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
            ) : visibleLogs.map((log) => {
              const id = visitorId(log);
              const label = id ? visitorLabels.get(id) ?? "Visitor baru" : "Legacy event";
              return (
              <div key={log.id} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <Clock size={14} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-950">{eventLabel(log.eventType)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      id ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
