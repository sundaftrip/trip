import type { ReferralCommissionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logReferralEvent } from "@/lib/referrals";

const COMMISSION_TYPES = new Set(["FIXED", "PERCENTAGE", "LEAD_FEE"]);

function numberInput(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const commissionTypeRaw = String(body.commissionType ?? "").trim();
  const commissionType = (COMMISSION_TYPES.has(commissionTypeRaw) ? commissionTypeRaw : "FIXED") as ReferralCommissionType;
  const commissionValue = numberInput(body.commissionValue);

  const existingPartner = await prisma.referralPartner.findUnique({
    where: { id },
    select: { id: true, partnerName: true, referralCode: true },
  });

  if (!existingPartner) {
    return NextResponse.json({ error: "Partner tidak ditemukan." }, { status: 404 });
  }

  const partner = await prisma.referralPartner.update({
    where: { id },
    data: { commissionType, commissionValue },
    select: {
      id: true,
      partnerName: true,
      referralCode: true,
      status: true,
      commissionType: true,
      commissionValue: true,
    },
  });

  await logReferralEvent({
    eventType: "partner_commission_rule_updated",
    eventLabel: existingPartner.partnerName,
    partnerId: id,
    metadata: { commissionType, commissionValue, source: "admin" },
  });

  revalidatePath("/admin/commissions");
  revalidatePath("/admin/partners");
  revalidatePath("/admin/leads");

  return NextResponse.json({ partner });
}
