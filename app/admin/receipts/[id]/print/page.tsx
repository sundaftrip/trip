import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReceiptPrint from "@/components/admin/ReceiptPrint";

export default async function PrintReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [receipt, companyRows] = await Promise.all([
    prisma.receipt.findUnique({ where: { id } }),
    prisma.companyInfo.findMany({
      where: { key: { in: ["company_name", "company_legal_name", "company_nib", "company_address", "company_phone", "company_email", "company_website", "company_logo"] } },
    }),
  ]);
  if (!receipt) notFound();

  const companyMap: Record<string, string> = {};
  companyRows.forEach((r) => { companyMap[r.key] = r.value; });

  const company = {
    name: companyMap["company_name"],
    legalName: companyMap["company_legal_name"],
    nib: companyMap["company_nib"],
    address: companyMap["company_address"],
    phone: companyMap["company_phone"],
    email: companyMap["company_email"],
    website: companyMap["company_website"],
    logo: companyMap["company_logo"],
  };

  return <ReceiptPrint
    receipt={{
      ...receipt,
      tripDate: receipt.tripDate ?? undefined,
      paymentDate: receipt.paymentDate ?? undefined,
      pricingBreakdown: receipt.pricingBreakdown ?? undefined,
      notes: receipt.notes ?? undefined,
      customerPhone: receipt.customerPhone ?? undefined,
      customerEmail: receipt.customerEmail ?? undefined,
      paymentMethod: receipt.paymentMethod ?? undefined,
    }}
    company={company}
  />;
}
