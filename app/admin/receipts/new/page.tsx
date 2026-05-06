import { prisma } from "@/lib/prisma";
import ReceiptForm from "@/components/admin/ReceiptForm";

export default async function NewReceiptPage() {
  const tours = await prisma.tour.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, title: true, price: true, promoPrice: true, tripDate: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Receipt</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Buat bukti pembayaran baru</p>
      </div>
      <ReceiptForm tours={tours.map((t) => ({ ...t, tripDate: t.tripDate?.toISOString() ?? null, promoPrice: t.promoPrice ?? null }))} />
    </div>
  );
}
