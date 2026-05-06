import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReceiptPrint from "@/components/admin/ReceiptPrint";

export default async function PrintReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({ where: { id } });
  if (!receipt) notFound();

  return <ReceiptPrint receipt={{
    ...receipt,
    tripDate: receipt.tripDate ?? undefined,
    paymentDate: receipt.paymentDate ?? undefined,
    notes: receipt.notes ?? undefined,
    customerPhone: receipt.customerPhone ?? undefined,
    customerEmail: receipt.customerEmail ?? undefined,
    paymentMethod: receipt.paymentMethod ?? undefined,
  }} />;
}
