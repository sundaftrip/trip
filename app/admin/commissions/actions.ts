"use server";

import type { ReferralCommissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logReferralEvent } from "@/lib/referrals";

const STATUSES = new Set(["PENDING", "APPROVED", "PAID", "REJECTED"]);

function value(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function money(formData: FormData, key: string) {
  const parsed = Number(value(formData, key, 80).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function updateCommissionAction(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const id = value(formData, "id", 120);
  const statusRaw = value(formData, "commissionStatus", 40);
  const commissionStatus = (STATUSES.has(statusRaw) ? statusRaw : "PENDING") as ReferralCommissionStatus;
  const commissionAmount = money(formData, "commissionAmount");
  const estimatedRaw = value(formData, "estimatedPayoutDate", 40);
  const paidRaw = value(formData, "paidDate", 40);

  const commission = await prisma.referralCommission.update({
    where: { id },
    data: {
      commissionAmount,
      commissionStatus,
      estimatedPayoutDate: estimatedRaw ? new Date(estimatedRaw) : null,
      paidDate: paidRaw ? new Date(paidRaw) : commissionStatus === "PAID" ? new Date() : null,
    },
    include: { lead: true },
  });

  await prisma.referralLead.update({
    where: { id: commission.leadId },
    data: { commissionAmount, commissionStatus },
  });

  await logReferralEvent({
    eventType: "commission_status_updated",
    eventLabel: commission.lead.customerAlias ?? commission.lead.id,
    partnerId: commission.partnerId,
    campaignId: commission.lead.campaignId,
    leadId: commission.leadId,
    metadata: { commissionStatus, commissionAmount },
  });

  revalidatePath("/admin/commissions");
  revalidatePath("/admin/leads");
  redirect("/admin/commissions");
}
