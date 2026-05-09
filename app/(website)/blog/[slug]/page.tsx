export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";



export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blog.findFirst({ where: { slug, published: true } });
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/blog" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm mb-8 transition">
          <ArrowLeft size={16} /> Kembali ke Blog
        </Link>

        {post.category && (
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full mb-4">
            {post.category}
          </span>
        )}

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
          {post.author && <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>}
          <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(post.date)}</span>
          {post.readTime && <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>}
        </div>

        {post.cover && (
          <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden mb-10">
            <Image src={post.cover} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {post.body && (
          <div
            className="prose prose-blue dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        )}
      </div>
    </div>
  );
}
