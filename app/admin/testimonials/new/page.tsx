import { prisma } from "@/lib/prisma";
import TestimonialForm from "../TestimonialForm";

export default async function NewTestimonialPage() {
  const tours = await prisma.tour.findMany({
    where: { status: { not: "DRAFT" } },
    select: { id: true, title: true, country: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Testimoni</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Testimoni baru akan tampil di halaman utama website</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <TestimonialForm tours={tours} />
      </div>
    </div>
  );
}
