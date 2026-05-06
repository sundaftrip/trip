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
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">Jurnal</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Tips & Inspirasi</h2>
          </div>
          <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
            Semua Artikel <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className="group block bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-300">
              <div className="relative h-44 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {post.cover
                  ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="flex items-center justify-center h-full text-3xl opacity-30">✈️</div>}
                {post.category && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-[10px] font-semibold rounded-full" style={{ background: "#2d6a4f" }}>
                    {post.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-[15px] leading-snug">{post.title}</h3>
                {post.excerpt && <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>}
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>{formatDate(post.date)}</span>
                  {post.readTime && <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
