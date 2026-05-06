import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function BlogAdminPage() {
  const posts = await prisma.blog.findMany({ orderBy: { date: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{posts.length} artikel</p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
          <Plus size={16} /> Tulis Artikel
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Judul</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Penulis</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Tanggal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                Belum ada artikel. <Link href="/admin/blog/new" className="text-blue-600">Tulis sekarang</Link>
              </td></tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-[280px]">{post.title}</p>
                  <p className="text-xs text-gray-400">/{post.slug}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{post.category ?? "-"}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{post.author ?? "-"}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(post.date)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${post.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/blog/${post.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">
                      <Pencil size={15} />
                    </Link>
                    <DeleteButton id={post.id} endpoint="/api/blog" label="artikel" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
