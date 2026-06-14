"use server";

import type {
  ReferralCampaignStatus,
  ReferralCommissionType,
  ReferralPartnerType,
  ReferralStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertSafeReferralSlug,
  buildReferralLink,
  createDashboardToken,
  normalizeReferralCode,
  normalizeReferralSlug,
} from "@/lib/referrals";

const PARTNER_TYPES = new Set([
  "INFLUENCER",
  "TRAVEL_AGENT",
  "COMMUNITY",
  "TOUR_LEADER",
  "VENDOR",
  "CAMPUS",
  "CORPORATE",
  "OFFLINE_SALES",
]);

const COMMISSION_TYPES = new Set(["FIXED", "PERCENTAGE", "LEAD_FEE"]);
const STATUSES = new Set(["ACTIVE", "INACTIVE"]);
const CAMPAIGN_STATUSES = new Set(["ACTIVE", "INACTIVE", "ENDED"]);

function value(formData: FormData, key: string, max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function numberValue(formData: FormData, key: string) {
  const raw = value(formData, key, 60).replace(/[^\d.]/g, "");
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function requireAdmin() {
  const session = await auth();
  if (!session) redirect("/admin/login");
  return session;
}

function fail(message: string, target = "/admin/partners"): never {
  redirect(`${target}?error=${encodeURIComponent(message)}`);
}

function defaultTemplate() {
  return [
    "Halo Sundaf Trip, saya tertarik dengan {package_name}.",
    "Saya ingin klaim {discount_label}.",
    "Kode referral: {referral_code}.",
    "Partner: {partner_name}.",
  ].join("\n");
}

function readPartnerInput(formData: FormData) {
  const partnerName = value(formData, "partnerName", 160);
  const referralCode = normalizeReferralCode(value(formData, "referralCode", 80));
  const slug = normalizeReferralSlug(value(formData, "slug", 80));
  const partnerTypeRaw = value(formData, "partnerType", 40);
  const statusRaw = value(formData, "status", 20);
  const commissionTypeRaw = value(formData, "commissionType", 30);

  if (!partnerName) fail("Nama partner wajib diisi.");
  if (!referralCode) fail("Referral code wajib diisi.");
  const slugError = assertSafeReferralSlug(slug);
  if (slugError) fail(slugError);

  return {
    partnerName,
    referralCode,
    slug,
    partnerType: (PARTNER_TYPES.has(partnerTypeRaw) ? partnerTypeRaw : "INFLUENCER") as ReferralPartnerType,
    status: (STATUSES.has(statusRaw) ? statusRaw : "ACTIVE") as ReferralStatus,
    commissionType: (COMMISSION_TYPES.has(commissionTypeRaw) ? commissionTypeRaw : "FIXED") as ReferralCommissionType,
    commissionValue: numberValue(formData, "commissionValue"),
  };
}

function readCampaignInput(formData: FormData, slug: string) {
  const statusRaw = value(formData, "campaignStatus", 20);
  const packageName = value(formData, "packageName", 160) || "Trip Sundaf";
  const discountLabel = value(formData, "discountLabel", 160) || "Potongan khusus";

  return {
    campaignName: value(formData, "campaignName", 160) || packageName,
    packageName,
    discountLabel,
    shortLink: buildReferralLink(slug),
    whatsappTemplate: value(formData, "whatsappTemplate", 1500) || defaultTemplate(),
    status: (CAMPAIGN_STATUSES.has(statusRaw) ? statusRaw : "ACTIVE") as ReferralCampaignStatus,
    startDate: value(formData, "startDate", 40) ? new Date(value(formData, "startDate", 40)) : null,
    endDate: value(formData, "endDate", 40) ? new Date(value(formData, "endDate", 40)) : null,
  };
}

export async function createPartnerAction(formData: FormData) {
  await requireAdmin();
  const partnerInput = readPartnerInput(formData);
  const campaignInput = readCampaignInput(formData, partnerInput.slug);

  try {
    const partner = await prisma.referralPartner.create({
      data: {
        ...partnerInput,
        dashboardToken: createDashboardToken(),
        campaigns: { create: campaignInput },
      },
    });

    await prisma.referralActivityLog.create({
      data: {
        partnerId: partner.id,
        eventType: "partner_created",
        eventLabel: partner.partnerName,
        metadata: { source: "admin" },
      },
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") fail("Slug atau referral code sudah dipakai.");
    throw err;
  }

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function updatePartnerAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 120);
  const campaignId = value(formData, "campaignId", 120);
  const partnerInput = readPartnerInput(formData);
  const campaignInput = readCampaignInput(formData, partnerInput.slug);

  if (!id) fail("Partner tidak ditemukan.");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.referralPartner.update({
        where: { id },
        data: partnerInput,
      });

      if (campaignId) {
        await tx.referralCampaign.update({
          where: { id: campaignId },
          data: campaignInput,
        });
      } else {
        await tx.referralCampaign.create({
          data: { ...campaignInput, partnerId: id },
        });
      }

      await tx.referralActivityLog.create({
        data: {
          partnerId: id,
          campaignId: campaignId || null,
          eventType: "partner_updated",
          eventLabel: partnerInput.partnerName,
          metadata: { source: "admin" },
        },
      });
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") fail("Slug atau referral code sudah dipakai.", `/admin/partners/${id}`);
    throw err;
  }

  revalidatePath("/admin/partners");
  revalidatePath(`/partner/${partnerInput.slug}`);
  redirect("/admin/partners");
}

export async function rotatePartnerTokenAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 120);
  const slug = value(formData, "slug", 120);
  if (!id) fail("Partner tidak ditemukan.");

  await prisma.referralPartner.update({
    where: { id },
    data: { dashboardToken: createDashboardToken() },
  });

  await prisma.referralActivityLog.create({
    data: {
      partnerId: id,
      eventType: "partner_token_rotated",
      eventLabel: slug,
      metadata: { source: "admin" },
    },
  });

  revalidatePath("/admin/partners");
  redirect(`/admin/partners/${id}`);
}

export async function archivePartnerAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 120);
  if (!id) fail("Partner tidak ditemukan.");

  await prisma.referralPartner.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function deletePartnerAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 120);
  if (!id) fail("Partner tidak ditemukan.");

  const partner = await prisma.referralPartner.findUnique({
    where: { id },
    include: {
      campaigns: { select: { id: true } },
      _count: { select: { leads: true, commissions: true, disputes: true } },
    },
  });

  if (!partner) fail("Partner tidak ditemukan.");

  if (partner._count.leads > 0 || partner._count.commissions > 0 || partner._count.disputes > 0) {
    fail("Partner ini sudah punya lead/komisi/dispute. Nonaktifkan saja agar histori tetap aman.");
  }

  const campaignIds = partner.campaigns.map((campaign) => campaign.id);

  await prisma.$transaction(async (tx) => {
    await tx.referralActivityLog.updateMany({
      where: {
        OR: [
          { partnerId: id },
          ...(campaignIds.length > 0 ? [{ campaignId: { in: campaignIds } }] : []),
        ],
      },
      data: { partnerId: null, campaignId: null },
    });

    await tx.referralCampaign.deleteMany({ where: { partnerId: id } });
    await tx.referralPartner.delete({ where: { id } });
  });

  revalidatePath("/admin/partners");
  revalidatePath(`/partner/${partner.slug}`);
  redirect("/admin/partners");
}
