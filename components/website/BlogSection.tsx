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
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2d6a4f" }}>Journal</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Tips & Inspirasi</h2>
          </div>
          <Link href="/blog" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5" style={{ color: "#2d6a4f" }}>
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className="group block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {post.cover
                  ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="flex items-center justify-center h-full text-4xl">✈️</div>}
                {post.category && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-xs font-semibold rounded-full" style={{ background: "#2d6a4f" }}>
                    {post.category}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{post.title}</h3>
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
