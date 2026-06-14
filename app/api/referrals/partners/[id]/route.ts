import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const partner = await prisma.referralPartner.findUnique({
    where: { id },
    include: {
      campaigns: { select: { id: true } },
      _count: { select: { leads: true, commissions: true, disputes: true } },
    },
  });

  if (!partner) {
    return NextResponse.json({ error: "Partner tidak ditemukan." }, { status: 404 });
  }

  if (partner._count.leads > 0 || partner._count.commissions > 0 || partner._count.disputes > 0) {
    return NextResponse.json(
      { error: "Partner ini sudah punya lead/komisi/dispute. Nonaktifkan saja agar data historis tidak hilang." },
      { status: 409 },
    );
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
  return NextResponse.json({ success: true });
}
