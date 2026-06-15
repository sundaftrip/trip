export const dynamic = "force-dynamic";

import CommissionWorkbench from "@/components/admin/referrals/CommissionWorkbench";
import type { CommissionPartner, CommissionRow } from "@/components/admin/referrals/CommissionWorkbench";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_STATUS_LABEL,
  COMMISSION_STATUS_LABEL,
  COMMISSION_TYPE_LABEL,
  LEAD_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/referrals";

function dateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function AdminCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string }>;
}) {
  const sp = await searchParams;
  const partnerId = sp.partnerId?.trim() ?? "";
  const [commissions, partners] = await Promise.all([
    prisma.referralCommission.findMany({
      where: partnerId ? { partnerId } : undefined,
      orderBy: [{ commissionStatus: "asc" }, { createdAt: "desc" }],
      include: { partner: true, lead: true },
    }),
    prisma.referralPartner.findMany({
      orderBy: [{ status: "asc" }, { partnerName: "asc" }],
      select: {
        id: true,
        partnerName: true,
        referralCode: true,
        status: true,
        commissionType: true,
        commissionValue: true,
      },
    }),
  ]);

  const partnerOptions: CommissionPartner[] = partners.map((partner) => ({
    id: partner.id,
    partnerName: partner.partnerName,
    referralCode: partner.referralCode,
    status: partner.status,
    commissionType: partner.commissionType,
    commissionValue: partner.commissionValue,
  }));

  const commissionRows: CommissionRow[] = commissions.map((commission) => ({
    id: commission.id,
    partnerId: commission.partnerId,
    partnerName: commission.partner.partnerName,
    referralCode: commission.partner.referralCode,
    commissionType: commission.commissionType,
    commissionAmount: commission.commissionAmount,
    commissionStatus: commission.commissionStatus,
    estimatedPayoutDate: dateValue(commission.estimatedPayoutDate),
    paidDate: dateValue(commission.paidDate),
    createdAt: commission.createdAt.toISOString(),
    lead: {
      id: commission.lead.id,
      customerName: commission.lead.customerName ?? "",
      customerAlias: commission.lead.customerAlias ?? "",
      whatsappMasked: commission.lead.whatsappMasked ?? "",
      packageName: commission.lead.packageName,
      transactionValue: commission.lead.transactionValue,
      leadStatus: commission.lead.leadStatus,
      bookingStatus: commission.lead.bookingStatus,
      paymentStatus: commission.lead.paymentStatus,
      commissionAmount: commission.lead.commissionAmount,
      commissionStatus: commission.lead.commissionStatus,
      adminNotes: commission.lead.adminNotes ?? "",
      createdAt: commission.lead.createdAt.toISOString(),
    },
  }));

  return (
    <CommissionWorkbench
      partners={partnerOptions}
      commissions={commissionRows}
      selectedPartnerId={partnerId}
      labels={{
        commissionTypes: COMMISSION_TYPE_LABEL,
        commissionStatuses: COMMISSION_STATUS_LABEL,
        leadStatuses: LEAD_STATUS_LABEL,
        bookingStatuses: BOOKING_STATUS_LABEL,
        paymentStatuses: PAYMENT_STATUS_LABEL,
      }}
    />
  );
}
