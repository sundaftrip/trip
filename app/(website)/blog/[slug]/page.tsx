export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getSiteTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    return row?.value ?? "classic";
  } catch { return "classic"; }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, theme] = await Promise.all([
    prisma.blog.findFirst({ where: { slug, published: true } }),
    getSiteTheme(),
  ]);
  if (!post) notFound();

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isOutlined = isKawaii || isTropical || isPixel;

  const pageBg  = isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : undefined;
  const headClr = isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : undefined;
  const subClr  = isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : undefined;
  const cardBg  = isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : undefined;
  const bdrClr  = isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : undefined;

  const pixelGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pixelGrid } : undefined;

  return (
    <div className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`} style={wrapperStyle}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back link */}
        {isOutlined ? (
          <Link href="/blog"
            className={`inline-flex items-center gap-1.5 mb-8 text-sm font-black transition-opacity hover:opacity-70 ${isKawaii ? "kw-pill" : isTropical ? "tr-pill" : "px-pill"}`}
            style={isKawaii ? { background: "var(--kw-peach)", color: "var(--kw-text)" }
                 : isTropical ? { background: "var(--tr-mint)", color: "var(--tr-text)" }
                 : { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>
            <ArrowLeft size={14} /> Kembali ke Blog
          </Link>
        ) : (
          <Link href="/blog" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm mb-8 transition">
            <ArrowLeft size={16} /> Kembali ke Blog
          </Link>
        )}

        {/* Category badge */}
        {post.category && (
          isOutlined ? (
            <span className={`inline-flex mb-4 ${isKawaii ? "kw-pill" : isTropical ? "tr-pill" : "px-pill"}`}
              style={isKawaii ? { background: "var(--kw-blush)", color: "var(--kw-text)", transform: "rotate(-1.5deg)" }
                   : isTropical ? { background: "var(--tr-peach)", color: "var(--tr-text)" }
                   : { background: "var(--px-yellow)", color: "var(--px-on-yellow)" }}>
              {post.category}
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full mb-4">
              {post.category}
            </span>
          )
        )}

        {/* Title */}
        <h1 className={`text-3xl lg:text-4xl font-black mb-4 leading-tight ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
          style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div className={`flex flex-wrap items-center gap-4 text-sm mb-8 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`}
          style={isOutlined ? { color: subClr } : undefined}>
          {post.author && <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>}
          <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(post.date)}</span>
          {post.readTime && <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>}
        </div>

        {/* Cover image */}
        {post.cover && (
          <div className={`relative h-72 lg:h-96 mb-10 overflow-hidden ${isOutlined ? "border-2" : "rounded-2xl"}`}
            style={isOutlined ? { borderColor: bdrClr, boxShadow: `4px 4px 0 0 ${bdrClr}` } : undefined}>
            <Image src={post.cover} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Body */}
        {post.body && (
          isOutlined ? (
            <div className={`rounded-none p-8 border-2 prose max-w-none`}
              style={{ background: cardBg, borderColor: bdrClr, color: headClr }}>
              <div dangerouslySetInnerHTML={{ __html: post.body }} />
            </div>
          ) : (
            <div className="prose prose-blue dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.body }} />
          )
        )}
      </div>
    </div>
  );
}
