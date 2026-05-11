import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TestimonialForm from "../TestimonialForm";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.testimonial.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Testimoni</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.name}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <TestimonialForm id={item.id} initial={{
          name: item.name, role: item.role ?? "", content: item.content,
          rating: item.rating, avatar: item.avatar ?? "", published: item.published, order: item.order,
        }} />
      </div>
    </div>
  );
}
