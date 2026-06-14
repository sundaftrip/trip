import { notFound } from "next/navigation";
import PartnerForm from "@/components/admin/referrals/PartnerForm";
import { prisma } from "@/lib/prisma";

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await prisma.referralPartner.findUnique({
    where: { id },
    include: { campaigns: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!partner) notFound();

  return <PartnerForm partner={partner} />;
}
