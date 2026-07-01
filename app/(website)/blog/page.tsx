// ISR: list blog di-revalidate on-write oleh revalidatePublicContent() di API blog.
export const revalidate = 300;
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import { formatDate, cldOptimize } from "@/lib/utils";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

const BLOG_TITLE = "Blog & Tips Travel · Sundaf Trip";
const BLOG_DESC =
  "Tips travel ke Rusia, Asia Tengah, dan Aurora, cerita lapangan, panduan visa, dan rekomendasi rute dari pengalaman langsung Sundaf Trip.";

export const metadata: Metadata = {
  title: "Blog & Tips Travel",
  description: BLOG_DESC,
  alternates: { canonical: "https://sundaftrip.com/blog" },
  // Override OG/Twitter agar share menampilkan judul blog, bukan beranda (brief P0.3).
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESC,
    url: "https://sundaftrip.com/blog",
    siteName: "Sundaf Trip",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: BLOG_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESC,
  },
};

async function getSiteTheme() {
  try {
    const row = await prisma.companyInfo.findFirst({ where: { key: "site_theme" } });
    const v = row?.value ?? "classic";
    return v === "console" ? "atlas" : v;
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
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isFumayo   = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isFumayo;

  const pageBg  = isFumayo ? "var(--fb-bg)" : isKawaii ? "var(--kw-bg)" : isTropical ? "var(--tr-bg)" : isPixel ? "var(--px-bg)" : isGlobe ? "var(--gl-bg)" : isMap ? "var(--mp-bg)" : isAtlas ? "var(--at-bg)" : undefined;
  const headClr = isFumayo ? "var(--fb-text)" : isKawaii ? "var(--kw-text)" : isTropical ? "var(--tr-text)" : isPixel ? "var(--px-text)" : isGlobe ? "var(--gl-text)" : isMap ? "var(--mp-text)" : isAtlas ? "var(--at-text)" : undefined;
  const subClr  = isFumayo ? "var(--fb-subtext)" : isKawaii ? "var(--kw-subtext)" : isTropical ? "var(--tr-subtext)" : isPixel ? "var(--px-subtext)" : isGlobe ? "var(--gl-subtext)" : isMap ? "var(--mp-subtext)" : isAtlas ? "var(--at-subtext)" : undefined;

  const pixelGrid = isPixel ? {
    backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
    backgroundSize: "24px 24px",
  } : isMap ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }
    : isAtlas ? { backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)", backgroundSize: "32px 32px" }
    : isFumayo ? { backgroundImage: "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)", backgroundSize: "26px 26px", fontFamily: "var(--fb-font)" } : {};

  const wrapperStyle = pageBg ? { background: pageBg, ...pixelGrid } : undefined;

  return (
    <div className={`min-h-screen pt-24 ${!isOutlined ? "bg-gray-50 dark:bg-gray-950" : ""}`} style={wrapperStyle}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Blog & Tips Travel", url: "/blog" },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Heading */}
        <div className="mb-10">
          {isOutlined ? (
            <>
              {isKawaii   && <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-sky)", color: "var(--kw-text)" }}>✦ Jurnal</span>}
              {isTropical && <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-grape)", color: "var(--tr-text)" }}>📰 Jurnal</span>}
              {isPixel    && <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-purple)", color: "#ffffff" }}>► JURNAL</span>}
              {isGlobe    && <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-lavender)", color: "var(--gl-on-lavender)", borderColor: "transparent" }}>🗺️ Jurnal</span>}
              {isAtlas    && <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Jurnal</span>}
              {isFumayo   && <span className="fb-pill mb-3 inline-flex" style={{ background: "var(--fb-pink)", color: "#1a1a1a" }}>✦ Jurnal</span>}
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
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover" />
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
        ) : isAtlas ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block at-card overflow-hidden group">
                {post.cover && (
                  <div className="relative h-48 overflow-hidden border-b" style={{ borderColor: "var(--at-border)" }}>
                    <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    {post.category && (
                      <span className="absolute top-3 left-3 at-pill" style={{ background: "var(--at-muted)", color: "var(--at-text)" }}>
                        {post.category}
                      </span>
                    )}
                  </div>
                )}
                <div className={post.cover ? "p-5" : "p-5 sm:p-6"}>
                  {!post.cover && post.category && (
                    <span className="at-pill mb-4 inline-flex" style={{ background: "var(--at-muted)", color: "var(--at-text)" }}>
                      {post.category}
                    </span>
                  )}
                  <h2 className="font-semibold mb-2 line-clamp-2" style={{ color: "var(--at-text)" }}>{post.title}</h2>
                  {post.excerpt && <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--at-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--at-subtext)" }}>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(post.date)}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : isFumayo ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block fb-card overflow-hidden group">
                <div className="relative h-48 overflow-hidden" style={{ borderBottom: "2px solid var(--fb-line)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-4xl" style={{ background: "var(--fb-paper)", color: "var(--fb-line)" }}>✦</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 fb-pill" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5" style={{ fontFamily: "var(--fb-font)" }}>
                  <h2 className="font-bold mb-2 line-clamp-2" style={{ color: "var(--fb-ink)" }}>{post.title}</h2>
                  {post.excerpt && <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--fb-subink)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--fb-subink)" }}>
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
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
