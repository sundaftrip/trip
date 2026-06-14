"use server";

import type {
  ReferralBookingStatus,
  ReferralCommissionStatus,
  ReferralLeadStatus,
  ReferralPaymentStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerAlias, logReferralEvent, maskWhatsApp } from "@/lib/referrals";

const LEAD_STATUSES = new Set(["NEW_LEAD", "VALID_LEAD", "FOLLOW_UP", "BOOKED", "DP_PAID", "FULLY_PAID", "CANCELLED"]);
const BOOKING_STATUSES = new Set(["NOT_BOOKED", "BOOKED", "CANCELLED"]);
const PAYMENT_STATUSES = new Set(["UNPAID", "DP_PAID", "FULLY_PAID", "REFUNDED"]);
const COMMISSION_STATUSES = new Set(["PENDING", "APPROVED", "PAID", "REJECTED"]);
const COMMISSION_DUE_PAYMENT_STATUSES = new Set(["DP_PAID", "FULLY_PAID"]);

function value(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function money(formData: FormData, key: string) {
  const raw = value(formData, key, 80).replace(/[^\d.]/g, "");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function requireAdmin() {
  const session = await auth();
  if (!session) redirect("/admin/login");
}

function computeCommission(partner: { commissionType: string; commissionValue: number } | null, transactionValue: number, manualAmount: number) {
  if (manualAmount > 0) return manualAmount;
  if (!partner) return 0;
  if (partner.commissionType === "PERCENTAGE") return Math.round(transactionValue * (partner.commissionValue / 100));
  return partner.commissionValue;
}

function leadStatusFromPayment(paymentStatus: ReferralPaymentStatus): ReferralLeadStatus {
  if (paymentStatus === "FULLY_PAID") return "FULLY_PAID";
  if (paymentStatus === "DP_PAID") return "DP_PAID";
  return "NEW_LEAD";
}

export async function createReferralLeadAction(formData: FormData) {
  await requireAdmin();

  const campaignId = value(formData, "campaignId", 120) || null;
  const partnerIdInput = value(formData, "partnerId", 120) || null;
  const customerName = value(formData, "customerName", 160) || null;
  const whatsappNumber = value(formData, "whatsappNumber", 80) || null;
  const sourceUrl = value(formData, "sourceUrl", 500) || null;
  const adminNotes = value(formData, "adminNotes", 1500) || null;
  const transactionValue = money(formData, "transactionValue");
  const manualCommission = money(formData, "commissionAmount");
  const paymentStatusRaw = value(formData, "paymentStatus", 40);
  const paymentStatus = (PAYMENT_STATUSES.has(paymentStatusRaw) ? paymentStatusRaw : "UNPAID") as ReferralPaymentStatus;
  const commissionDue = COMMISSION_DUE_PAYMENT_STATUSES.has(paymentStatus);

  const campaign = campaignId
    ? await prisma.referralCampaign.findUnique({ where: { id: campaignId }, include: { partner: true } })
    : null;
  const partner = campaign?.partner ?? (partnerIdInput ? await prisma.referralPartner.findUnique({ where: { id: partnerIdInput } }) : null);

  const packageName = value(formData, "packageName", 160) || campaign?.packageName || "Trip Sundaf";
  const manualReferralCode = value(formData, "referralCode", 80).toUpperCase();
  const referralCode = partner?.referralCode ?? (manualReferralCode || null);
  const commissionAmount = commissionDue ? computeCommission(partner, transactionValue, manualCommission) : 0;

  const lead = await prisma.referralLead.create({
    data: {
      customerName,
      customerAlias: customerAlias(customerName, "NEW"),
      whatsappNumber,
      whatsappMasked: maskWhatsApp(whatsappNumber),
      packageName,
      referralCode,
      partnerId: partner?.id ?? null,
      campaignId: campaign?.id ?? null,
      sourceUrl,
      leadStatus: leadStatusFromPayment(paymentStatus),
      bookingStatus: commissionDue ? "BOOKED" : "NOT_BOOKED",
      paymentStatus,
      transactionValue,
      commissionAmount,
      commissionStatus: commissionDue ? "PENDING" : "REJECTED",
      adminNotes,
    },
  });

  if (!customerName) {
    await prisma.referralLead.update({
      where: { id: lead.id },
      data: { customerAlias: customerAlias(null, lead.id) },
    });
  }

  if (partner && commissionDue) {
    await prisma.referralCommission.create({
      data: {
        partnerId: partner.id,
        leadId: lead.id,
        commissionType: partner.commissionType,
        commissionAmount,
        commissionStatus: "PENDING",
      },
    });
  }

  await logReferralEvent({
    eventType: "lead_created",
    eventLabel: customerAlias(customerName, lead.id),
    partnerId: partner?.id,
    campaignId: campaign?.id,
    leadId: lead.id,
    metadata: { source: "admin", packageName, sourceUrl: sourceUrl ?? "" },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/partners");
  redirect("/admin/leads");
}

export async function updateReferralLeadAction(formData: FormData) {
  await requireAdmin();

  const id = value(formData, "id", 120);
  const leadStatusRaw = value(formData, "leadStatus", 40);
  const bookingStatusRaw = value(formData, "bookingStatus", 40);
  const paymentStatusRaw = value(formData, "paymentStatus", 40);
  const commissionStatusRaw = value(formData, "commissionStatus", 40);
  const transactionValue = money(formData, "transactionValue");
  const manualCommission = money(formData, "commissionAmount");
  const adminNotes = value(formData, "adminNotes", 1500) || null;

  if (!id) redirect("/admin/leads?error=Lead tidak ditemukan");

  const rawLeadStatus = (LEAD_STATUSES.has(leadStatusRaw) ? leadStatusRaw : "NEW_LEAD") as ReferralLeadStatus;
  const rawBookingStatus = (BOOKING_STATUSES.has(bookingStatusRaw) ? bookingStatusRaw : "NOT_BOOKED") as ReferralBookingStatus;
  const paymentStatus = (PAYMENT_STATUSES.has(paymentStatusRaw) ? paymentStatusRaw : "UNPAID") as ReferralPaymentStatus;
  const commissionDue = COMMISSION_DUE_PAYMENT_STATUSES.has(paymentStatus);
  const leadStatus = commissionDue && rawLeadStatus !== "CANCELLED" ? leadStatusFromPayment(paymentStatus) : rawLeadStatus;
  const bookingStatus = commissionDue && rawBookingStatus !== "CANCELLED" ? "BOOKED" : rawBookingStatus;
  const commissionStatus = (commissionDue && COMMISSION_STATUSES.has(commissionStatusRaw) ? commissionStatusRaw : commissionDue ? "PENDING" : "REJECTED") as ReferralCommissionStatus;

  const existingLead = await prisma.referralLead.findUnique({
    where: { id },
    include: { commission: true, partner: true },
  });

  if (!existingLead) redirect("/admin/leads?error=Lead tidak ditemukan");

  const commissionAmount = commissionDue
    ? computeCommission(existingLead.partner, transactionValue, manualCommission)
    : 0;

  const lead = await prisma.referralLead.update({
    where: { id },
    data: {
      leadStatus,
      bookingStatus,
      paymentStatus,
      transactionValue,
      commissionAmount,
      commissionStatus,
      adminNotes,
    },
    include: { commission: true, partner: true },
  });

  if (lead.partnerId && commissionDue) {
    await prisma.referralCommission.upsert({
      where: { leadId: lead.id },
      update: { commissionAmount, commissionStatus },
      create: {
        partnerId: lead.partnerId,
        leadId: lead.id,
        commissionType: lead.partner?.commissionType ?? "FIXED",
        commissionAmount,
        commissionStatus,
      },
    });
  } else if (lead.commission) {
    await prisma.referralCommission.update({
      where: { leadId: lead.id },
      data: { commissionAmount: 0, commissionStatus: "REJECTED" },
    });
  }

  for (const eventType of [
    "lead_status_updated",
    "booking_status_updated",
    "payment_status_updated",
    "commission_status_updated",
  ]) {
    await logReferralEvent({
      eventType,
      eventLabel: lead.customerAlias ?? lead.id,
      partnerId: lead.partnerId,
      campaignId: lead.campaignId,
      leadId: lead.id,
      metadata: { leadStatus, bookingStatus, paymentStatus, commissionStatus },
    });
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/commissions");
  revalidatePath("/admin/partners");
  redirect("/admin/leads");
}
