import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReceiptForm from "@/components/admin/ReceiptForm";
import { auth } from "@/lib/auth";
import { checkPermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function EditReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!await checkPermissions(session, ["receipt_view", "receipt_edit"])) redirect("/admin");

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
        receipt={{
          id: receipt.id,
          customerName: receipt.customerName,
          customerPhone: receipt.customerPhone ?? undefined,
          customerEmail: receipt.customerEmail ?? undefined,
          tourId: receipt.tourId,
          tourTitle: receipt.tourTitle,
          tripDate: receipt.tripDate ?? undefined,
          pax: receipt.pax,
          amount: receipt.amount,
          paymentMethod: receipt.paymentMethod ?? undefined,
          paymentDate: receipt.paymentDate?.toISOString().slice(0, 10) ?? undefined,
          pricingBreakdown: receipt.pricingBreakdown ?? undefined,
          notes: receipt.notes ?? undefined,
          status: receipt.status,
        }}
        tours={tours.map((t) => ({ ...t, tripDate: t.tripDate?.toISOString() ?? null, promoPrice: t.promoPrice ?? null }))}
      />
    </div>
  );
}
