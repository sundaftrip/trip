import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await prisma.blog.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Blog & Tips Travel</h1>
          <p className="text-gray-500 dark:text-gray-400">Artikel, panduan, dan inspirasi perjalanan</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p>Belum ada artikel yang dipublish.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {post.cover
                    ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-5xl">✈️</div>
                  }
                  {post.category && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">{post.category}</span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition">{post.title}</h2>
                  {post.excerpt && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.date)}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
