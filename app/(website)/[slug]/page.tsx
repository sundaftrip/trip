export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgePercent, Ticket, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReferralGateClient from "@/components/website/ReferralGateClient";
import {
  buildReferralLink,
  claimDiscountMessage,
  generateWhatsAppUrl,
  getConfiguredWhatsAppNumber,
  logReferralEvent,
  PARTNER_TYPE_LABEL,
  withoutCodeMessage,
} from "@/lib/referrals";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
};

function readableDiscount(label: string) {
  return label
    .replace(/^Potongan\b/, "potongan")
    .replace(/^Diskon\b/, "diskon");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = await prisma.referralPartner.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { partnerName: true },
  });

  if (!partner) return {};

  return {
    title: `Kode referral ${partner.partnerName} | Sundaf Trip`,
    description: `Klaim kode referral ${partner.partnerName} untuk trip bersama Sundaf Trip.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReferralLandingPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const partner = await prisma.referralPartner.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      campaigns: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!partner) notFound();
  const campaign = partner.campaigns[0];
  if (!campaign) notFound();

  const sourceUrl = `${buildReferralLink(slug)}${sp.ref ? `?ref=${encodeURIComponent(sp.ref)}` : ""}`;
  const whatsapp = await getConfiguredWhatsAppNumber();
  const claimUrl = generateWhatsAppUrl(
    whatsapp,
    claimDiscountMessage({
      packageName: campaign.packageName,
      discountLabel: campaign.discountLabel,
      referralCode: partner.referralCode,
      partnerName: partner.partnerName,
    })
  );
  const withoutCodeUrl = generateWhatsAppUrl(whatsapp, withoutCodeMessage(campaign.packageName));

  await logReferralEvent({
    eventType: "referral_page_view",
    eventLabel: partner.partnerName,
    partnerId: partner.id,
    campaignId: campaign.id,
    metadata: {
      slug,
      sourceUrl,
      refParam: sp.ref ?? "",
    },
  });

  return (
    <section className="min-h-[78vh] bg-[var(--site-bg)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-700 shadow-sm">
            <BadgePercent size={14} />
            Referral Sundaf Trip
          </div>
          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-black leading-tight text-gray-950 sm:text-5xl">
              Mau dapat {readableDiscount(campaign.discountLabel)}?
            </h1>
            <p className="max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
              Gunakan kode referral dari partner Sundaf Trip untuk konsultasi {campaign.packageName}.
            </p>
          </div>
          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <UserRound size={15} />
                Partner
              </div>
              <p className="text-lg font-black text-gray-950">{partner.partnerName}</p>
              <p className="text-sm text-gray-500">{PARTNER_TYPE_LABEL[partner.partnerType] ?? partner.partnerType}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Ticket size={15} />
                Kode Referral
              </div>
              <p className="font-mono text-2xl font-black tracking-wide text-gray-950">{partner.referralCode}</p>
              <p className="text-sm text-gray-500">{campaign.campaignName}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/60 sm:p-6">
          <div className="mb-5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Paket Trip</p>
            <h2 className="text-2xl font-black text-gray-950">{campaign.packageName}</h2>
            <p className="text-sm text-gray-500">{campaign.discountLabel} dengan kode {partner.referralCode}</p>
          </div>

          <ReferralGateClient
            partnerId={partner.id}
            campaignId={campaign.id}
            partnerName={partner.partnerName}
            referralCode={partner.referralCode}
            sourceUrl={sourceUrl}
            claimUrl={claimUrl}
            withoutCodeUrl={withoutCodeUrl}
          />

          <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Pesan WhatsApp akan otomatis membawa kode ini.</p>
            <p className="mt-1">Tim Sundaf Trip tetap akan mengonfirmasi ketersediaan seat, jadwal, dan syarat promo.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
