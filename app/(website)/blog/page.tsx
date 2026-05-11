export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getSiteTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    return row?.value ?? "classic";
  } catch { return "classic"; }
}

export default async function BlogPage() {
  const [posts, theme] = await Promise.all([
    prisma.blog.findMany({ where: { published: true }, orderBy: { date: "desc" } }),
    getSiteTheme(),
  ]);

  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe;

  const pageBg  = isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : undefined;
  const headClr = isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : undefined;
  const subClr  = isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : undefined;

  const pixelGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pixelGrid } : undefined;

  return (
    <div className={`min-h-screen pt-24 ${!isOutlined ? "bg-gray-50 dark:bg-gray-950" : ""}`} style={wrapperStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Heading */}
        <div className="mb-10">
          {isOutlined ? (
            <>
              {isKawaii   && <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-sky)", color: "var(--kw-text)" }}>✦ Jurnal</span>}
              {isTropical && <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-grape)", color: "var(--tr-text)" }}>📰 Jurnal</span>}
              {isPixel    && <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-purple)", color: "#ffffff" }}>► JURNAL</span>}
              {isGlobe    && <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-lavender)", color: "var(--gl-on-lavender)", borderColor: "transparent" }}>🗺️ Jurnal</span>}
              <h1 className="text-4xl font-black mt-3 mb-2" style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
                {isPixel ? "BLOG & TIPS TRAVEL" : "Blog & Tips Travel"}
              </h1>
              <p className="text-sm" style={{ color: subClr, fontFamily: isPixel ? "monospace" : undefined }}>
                Artikel, panduan, dan inspirasi perjalanan
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--site-heading, #111827)" }}>Blog & Tips Travel</h1>
              <p className="text-gray-500 dark:text-gray-400">Artikel, panduan, dan inspirasi perjalanan</p>
            </>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24" style={{ color: subClr ?? "var(--color-gray-400)" }}>
            <p className="text-4xl mb-3">📝</p>
            <p>Belum ada artikel yang dipublish.</p>
          </div>
        ) : isGlobe ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block gl-card overflow-hidden group">
                <div className="relative h-48 overflow-hidden rounded-t-[18px]">
                  {post.cover
                    ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-5xl" style={{ background: "var(--gl-sky)", opacity: 0.25 }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 gl-pill" style={{ background: "var(--gl-amber)", color: "var(--gl-on-amber)", transform: "rotate(-2deg)", borderColor: "transparent" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-black mb-2 line-clamp-2" style={{ color: "var(--gl-text)" }}>{post.title}</h2>
                  {post.excerpt && <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--gl-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--gl-subtext)" }}>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.date)}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : isKawaii ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block kw-card overflow-hidden group">
                <div className="relative h-48 overflow-hidden rounded-t-[22px] border-b-2" style={{ borderColor: "var(--kw-border)" }}>
                  {post.cover
                    ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-5xl" style={{ background: "var(--kw-peach)" }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 kw-pill" style={{ background: "var(--kw-blush)", color: "var(--kw-text)", transform: "rotate(-2deg)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5" style={{ background: "var(--kw-card)" }}>
                  <h2 className="font-black mb-2 line-clamp-2" style={{ color: "var(--kw-text)" }}>{post.title}</h2>
                  {post.excerpt && <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--kw-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--kw-subtext)" }}>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.date)}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : isTropical ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block tr-card overflow-hidden group">
                <div className="relative h-48 overflow-hidden rounded-t-[18px] border-b-2" style={{ borderColor: "var(--tr-border)" }}>
                  {post.cover
                    ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-5xl" style={{ background: "var(--tr-mint)" }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 tr-pill" style={{ background: "var(--tr-peach)", color: "var(--tr-text)", transform: "rotate(-2deg)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5" style={{ background: "var(--tr-card)" }}>
                  <h2 className="font-black mb-2 line-clamp-2" style={{ color: "var(--tr-text)" }}>{post.title}</h2>
                  {post.excerpt && <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--tr-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--tr-subtext)" }}>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.date)}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : isPixel ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block px-card overflow-hidden group">
                <div className="relative h-48 overflow-hidden border-b-2" style={{ borderColor: "var(--px-border)" }}>
                  {post.cover
                    ? <Image src={post.cover} alt={post.title} fill className="object-cover" />
                    : <div className="flex items-center justify-center h-full text-5xl" style={{ background: "var(--px-cyan)", opacity: 0.3 }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 px-pill" style={{ background: "var(--px-yellow)", color: "var(--px-on-yellow)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5" style={{ background: "var(--px-card)" }}>
                  <h2 className="font-black mb-2 line-clamp-2" style={{ color: "var(--px-text)" }}>{post.title}</h2>
                  {post.excerpt && <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[10px]" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.date)}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {post.cover
                    ? <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-5xl">✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">{post.category}</span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-bold mb-2 line-clamp-2 transition" style={{ color: "var(--site-blog-title, #111827)" }}>{post.title}</h2>
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
