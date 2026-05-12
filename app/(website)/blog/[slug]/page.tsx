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
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas;

  const pageBg  = isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : isAtlas ? "var(--at-bg)" : undefined;
  const headClr = isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : isAtlas ? "var(--at-text)" : undefined;
  const subClr  = isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : isAtlas ? "var(--at-subtext)" : undefined;
  const cardBg  = isKawaii ? "var(--kw-card)" : isTropical ? "var(--tr-card)" : isPixel ? "var(--px-card)" : isGlobe ? "var(--gl-card)" : isMap ? "var(--mp-card)" : isAtlas ? "var(--at-card)" : undefined;
  const bdrClr  = isKawaii ? "var(--kw-border)" : isTropical ? "var(--tr-border)" : isPixel ? "var(--px-border)" : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : isAtlas ? "var(--at-border)" : undefined;

  const pixelGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isMap ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }
    : isAtlas ? { backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)", backgroundSize: "32px 32px" } : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pixelGrid } : undefined;

  return (
    <div className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`} style={wrapperStyle}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back link */}
        {isOutlined ? (
          <Link href="/blog"
            className={`inline-flex items-center gap-1.5 mb-8 text-sm font-black transition-opacity hover:opacity-70 ${isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isGlobe ? "gl-pill" : isAtlas ? "at-pill" : "px-pill"}`}
            style={isKawaii   ? { background: "var(--kw-peach)", color: "var(--kw-text)" }
                 : isTropical ? { background: "var(--tr-mint)", color: "var(--tr-text)" }
                 : isGlobe    ? { background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }
                 : isAtlas    ? { color: "var(--at-text)" }
                 :               { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }}>
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
            <span className={`inline-flex mb-4 ${isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isGlobe ? "gl-pill" : isAtlas ? "at-pill" : "px-pill"}`}
              style={isKawaii   ? { background: "var(--kw-blush)", color: "var(--kw-text)", transform: "rotate(-1.5deg)" }
                   : isTropical ? { background: "var(--tr-peach)", color: "var(--tr-text)" }
                   : isGlobe    ? { background: "var(--gl-amber)", color: "var(--gl-on-amber)", borderColor: "transparent" }
                   : isAtlas    ? { color: "var(--at-subtext)" }
                   :               { background: "var(--px-yellow)", color: "var(--px-on-yellow)" }}>
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
          <div className={`relative h-56 sm:h-80 lg:h-[480px] mb-10 overflow-hidden ${isGlobe ? "rounded-2xl" : isOutlined ? "border-2" : "rounded-2xl"}`}
            style={isGlobe    ? { boxShadow: "0 8px 32px var(--gl-shadow)" }
                 : isOutlined ? { borderColor: bdrClr, boxShadow: `4px 4px 0 0 ${bdrClr}` }
                 : undefined}>
            <Image src={post.cover} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Body */}
        {post.body && (
          isGlobe ? (
            <div className="gl-card p-8 prose max-w-none"
              style={{ background: cardBg, color: headClr }}>
              <div dangerouslySetInnerHTML={{ __html: post.body }} />
            </div>
          ) : isOutlined ? (
            <div className="rounded-none p-8 border-2 prose max-w-none"
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
