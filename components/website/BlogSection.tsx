import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string; slug: string; title: string; excerpt: string | null;
  cover: string | null; category: string | null; date: Date; author: string | null; readTime: string | null;
}

export default function BlogSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Tips & Inspirasi</h2>
            <p className="text-gray-500 dark:text-gray-400">Artikel seputar wisata dan perjalanan</p>
          </div>
          <Link href="/blog" className="hidden sm:flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:gap-2 transition-all text-sm">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {post.cover
                  ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="flex items-center justify-center h-full text-4xl">✈️</div>
                }
                {post.category && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                  {post.title}
                </h3>
                {post.excerpt && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{post.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(post.date)}</span>
                  {post.readTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
