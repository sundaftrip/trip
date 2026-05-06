import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReceiptForm from "@/components/admin/ReceiptForm";

export default async function EditReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [receipt, tours] = await Promise.all([
    prisma.receipt.findUnique({ where: { id } }),
    prisma.tour.findMany({ where: { status: "ACTIVE" }, select: { id: true, title: true, price: true, promoPrice: true, tripDate: true } }),
  ]);
  if (!receipt) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Receipt</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{receipt.receiptNo}</p>
      </div>
      <ReceiptForm
        receipt={{ ...receipt, tripDate: receipt.tripDate ?? undefined, paymentDate: receipt.paymentDate?.toISOString().slice(0, 10) ?? undefined }}
        tours={tours.map((t) => ({ ...t, tripDate: t.tripDate?.toISOString() ?? null, promoPrice: t.promoPrice ?? null }))}
      />
    </div>
  );
}
