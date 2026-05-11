import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import AnimateIn from "./AnimateIn";

interface Post {
  id: string; slug: string; title: string; excerpt: string | null;
  cover: string | null; category: string | null; date: Date; author: string | null; readTime: string | null;
}

interface Props {
  posts: Post[];
  theme?: string;
}

export default function BlogSection({ posts, theme = "classic" }: Props) {
  if (posts.length === 0) return null;

  const sectionBg =
    theme === "bold" ? "bg-gray-950" :
    "bg-gray-50 dark:bg-gray-950";

  const headingColor =
    theme === "bold" ? "text-white" : "text-gray-900 dark:text-white";

  const subColor =
    theme === "bold" ? "text-gray-600" : "text-gray-400";

  const linkColor =
    theme === "bold"
      ? "text-gray-500 hover:text-white"
      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";

  const cardBg =
    theme === "bold"
      ? "bg-gray-900 border-gray-800 hover:border-gray-700"
      : "bg-white dark:bg-black border-gray-100 dark:border-gray-900 hover:border-gray-300 dark:hover:border-gray-700";

  const titleColor =
    theme === "bold" ? "text-white" : "text-gray-900 dark:text-white";

  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className={`text-xs tracking-[0.15em] uppercase mb-3 ${subColor}`}>Jurnal</p>
              <h2 className={`text-3xl lg:text-4xl font-bold ${headingColor}`}>Tips &amp; Inspirasi</h2>
            </div>
            <Link href="/blog" className={`flex items-center gap-1.5 text-sm font-medium transition-colors group ${linkColor}`}>
              Semua Artikel <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`}
                className={`group block border rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 ${cardBg}`}>
                <div className="relative h-44 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  {post.cover
                    ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-3xl opacity-30">✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-[10px] font-semibold rounded-full" style={{ background: "var(--site-accent,#2d6a4f)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className={`font-semibold mb-2 line-clamp-2 text-[15px] leading-snug ${titleColor}`}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>{formatDate(post.date)}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>}
                  </div>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
