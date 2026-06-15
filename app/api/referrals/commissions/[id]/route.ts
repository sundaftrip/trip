import type {
  ReferralBookingStatus,
  ReferralCommissionStatus,
  ReferralCommissionType,
  ReferralLeadStatus,
  ReferralPaymentStatus,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logReferralEvent } from "@/lib/referrals";

const COMMISSION_TYPES = new Set(["FIXED", "PERCENTAGE", "LEAD_FEE"]);
const COMMISSION_STATUSES = new Set(["PENDING", "APPROVED", "PAID", "REJECTED"]);
const LEAD_STATUSES = new Set(["NEW_LEAD", "VALID_LEAD", "FOLLOW_UP", "BOOKED", "DP_PAID", "FULLY_PAID", "CANCELLED"]);
const BOOKING_STATUSES = new Set(["NOT_BOOKED", "BOOKED", "CANCELLED"]);
const PAYMENT_STATUSES = new Set(["UNPAID", "DP_PAID", "FULLY_PAID", "REFUNDED"]);

function stringInput(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function numberInput(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function dateInput(value: unknown) {
  const raw = stringInput(value, 40);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const commissionTypeRaw = stringInput(body.commissionType, 40);
  const commissionStatusRaw = stringInput(body.commissionStatus, 40);
  const leadStatusRaw = stringInput(body.leadStatus, 40);
  const bookingStatusRaw = stringInput(body.bookingStatus, 40);
  const paymentStatusRaw = stringInput(body.paymentStatus, 40);

  const commissionType = (COMMISSION_TYPES.has(commissionTypeRaw) ? commissionTypeRaw : "FIXED") as ReferralCommissionType;
  const commissionStatus = (COMMISSION_STATUSES.has(commissionStatusRaw) ? commissionStatusRaw : "PENDING") as ReferralCommissionStatus;
  const leadStatus = (LEAD_STATUSES.has(leadStatusRaw) ? leadStatusRaw : "NEW_LEAD") as ReferralLeadStatus;
  const bookingStatus = (BOOKING_STATUSES.has(bookingStatusRaw) ? bookingStatusRaw : "NOT_BOOKED") as ReferralBookingStatus;
  const paymentStatus = (PAYMENT_STATUSES.has(paymentStatusRaw) ? paymentStatusRaw : "UNPAID") as ReferralPaymentStatus;
  const commissionAmount = numberInput(body.commissionAmount);
  const transactionValue = numberInput(body.transactionValue);
  const estimatedPayoutDate = dateInput(body.estimatedPayoutDate);
  const explicitPaidDate = dateInput(body.paidDate);
  const adminNotes = stringInput(body.adminNotes, 1500) || null;

  const existingCommission = await prisma.referralCommission.findUnique({
    where: { id },
    include: { lead: true, partner: true },
  });

  if (!existingCommission) {
    return NextResponse.json({ error: "Komisi tidak ditemukan." }, { status: 404 });
  }

  const paidDate =
    explicitPaidDate ??
    (commissionStatus === "PAID" ? existingCommission.paidDate ?? new Date() : null);

  const commission = await prisma.$transaction(async (tx) => {
    await tx.referralLead.update({
      where: { id: existingCommission.leadId },
      data: {
        transactionValue,
        commissionAmount,
        commissionStatus,
        leadStatus,
        bookingStatus,
        paymentStatus,
        adminNotes,
      },
    });

    return tx.referralCommission.update({
      where: { id },
      data: {
        commissionType,
        commissionAmount,
        commissionStatus,
        estimatedPayoutDate,
        paidDate,
      },
      include: { lead: true, partner: true },
    });
  });

  await logReferralEvent({
    eventType: "commission_status_updated",
    eventLabel: commission.lead.customerAlias ?? commission.lead.id,
    partnerId: commission.partnerId,
    campaignId: commission.lead.campaignId,
    leadId: commission.leadId,
    metadata: {
      commissionType,
      commissionStatus,
      commissionAmount,
      leadStatus,
      bookingStatus,
      paymentStatus,
      source: "admin",
    },
  });

  revalidatePath("/admin/commissions");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/partners");

  return NextResponse.json({
    commission: {
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
    },
  });
}
