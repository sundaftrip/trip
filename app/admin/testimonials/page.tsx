import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Star, Pencil } from "lucide-react";
import TestimonialDeleteBtn from "./DeleteBtn";

export default async function TestimonialsPage() {
  const items = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimoni</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{items.length} testimoni</p>
        </div>
        <Link href="/admin/testimonials/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
          <Plus size={16} /> Tambah
        </Link>
      </div>

      {items.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-400 text-sm">Belum ada testimoni.</p>
          <Link href="/admin/testimonials/new" className="mt-3 inline-block text-blue-600 text-sm font-medium">
            Tambah sekarang →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {item.avatar
                  ? <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                  {item.role && <p className="text-xs text-gray-500 truncate">{item.role}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  item.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                }`}>
                  {item.published ? "Tampil" : "Disembunyikan"}
                </span>
                <Link href={`/admin/testimonials/${item.id}`}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                  <Pencil size={14} />
                </Link>
                <TestimonialDeleteBtn id={item.id} name={item.name} />
              </div>
            </div>

            <div className="flex gap-0.5 mt-3 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className={i < item.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"} />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">"{item.content}"</p>
            <p className="text-[11px] text-gray-400 mt-2">Urutan: {item.order}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
