// ISR 5 menit: artikel blog jarang berubah, force-dynamic bikin TTFB lambat
// & boros koneksi DB. Halaman ini tidak pakai cookies()/headers()/searchParams.
export const revalidate = 300;
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, MapPin } from "lucide-react";
import { formatDate, formatCurrency, cldOptimize } from "@/lib/utils";
import BlogShareButtons from "@/components/website/BlogShareButtons";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

// Fallback ke domain produksi, bukan localhost — kalau env hilang saat build,
// canonical/OG/JSON-LD jangan sampai menunjuk localhost.
const siteUrl = process.env.NEXTAUTH_URL ?? "https://sundaftrip.com";

async function getSiteInfo() {
  try {
    const rows = await prisma.companyInfo.findMany({
      where: { key: { in: ["site_theme", "company_name"] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      theme: (map["site_theme"] === "console" ? "atlas" : map["site_theme"]) ?? "classic",
      companyName: map["company_name"] ?? "Sundaftrip",
    };
  } catch {
    return { theme: "classic", companyName: "Sundaftrip" };
  }
}

/* ── #5: generateMetadata, og:image dari cover artikel ─────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blog.findFirst({
    where: { slug, published: true },
    select: { title: true, excerpt: true, cover: true, date: true },
  });
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `${siteUrl}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `${siteUrl}/blog/${slug}`,
      type: "article",
      publishedTime: post.date.toISOString(),
      ...(post.cover
        ? { images: [{ url: post.cover, width: 1200, height: 630, alt: post.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      ...(post.cover ? { images: [post.cover] } : {}),
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /* ── Fetch semua data sekaligus (parallel) ──────────────────────── */
  const [post, { theme, companyName }, relatedPosts, upcomingTours] =
    await Promise.all([
      prisma.blog.findFirst({ where: { slug, published: true } }),
      getSiteInfo(),
      /* #2: Related articles, 3 artikel terbaru selain ini */
      prisma.blog.findMany({
        where: { published: true, slug: { not: slug } },
        orderBy: { date: "desc" },
        take: 3,
        select: {
          slug: true, title: true, cover: true,
          category: true, readTime: true, date: true,
        },
      }),
      /* #3: Tour CTA, 2 paket mendatang */
      prisma.tour.findMany({
        where: { status: { not: "DRAFT" }, tripDate: { gte: new Date() } },
        orderBy: { tripDate: "asc" },
        take: 2,
        select: {
          id: true, slug: true, title: true, heroImg: true,
          price: true, promoPrice: true, duration: true, country: true,
        },
      }),
    ]);

  if (!post) notFound();

  /* ── Theme setup ────────────────────────────────────────────────── */
  const isKawaii   = theme === "kawaii";
  const isTropical = theme === "tropical";
  const isPixel    = theme === "pixel";
  const isGlobe    = theme === "globe";
  const isMap      = theme === "map";
  const isAtlas    = theme === "atlas";
  const isFumayo   = theme === "fumayo";
  const isOutlined = isKawaii || isTropical || isPixel || isGlobe || isMap || isAtlas || isFumayo;

  const pfx = isKawaii ? "kw" : isTropical ? "tr" : isPixel ? "px"
            : isGlobe ? "gl" : isMap ? "mp" : isAtlas ? "at" : isFumayo ? "fb"
            : "";

  const pageBg  = isFumayo ? "var(--fb-bg)"      : isKawaii ? "var(--kw-bg)"      : isTropical ? "var(--tr-bg)"      : isPixel ? "var(--px-bg)"      : isGlobe ? "var(--gl-bg)"      : isMap ? "var(--mp-bg)"      : isAtlas ? "var(--at-bg)"      : undefined;
  const headClr = isFumayo ? "var(--fb-text)"     : isKawaii ? "var(--kw-text)"     : isTropical ? "var(--tr-text)"     : isPixel ? "var(--px-text)"     : isGlobe ? "var(--gl-text)"     : isMap ? "var(--mp-text)"     : isAtlas ? "var(--at-text)"     : undefined;
  const subClr  = isFumayo ? "var(--fb-subtext)"  : isKawaii ? "var(--kw-subtext)"  : isTropical ? "var(--tr-subtext)"  : isPixel ? "var(--px-subtext)"  : isGlobe ? "var(--gl-subtext)"  : isMap ? "var(--mp-subtext)"  : isAtlas ? "var(--at-subtext)"  : undefined;
  const cardBg  = isFumayo ? "var(--fb-card)"     : isKawaii ? "var(--kw-card)"     : isTropical ? "var(--tr-card)"     : isPixel ? "var(--px-card)"     : isGlobe ? "var(--gl-card)"     : isMap ? "var(--mp-card)"     : isAtlas ? "var(--at-card)"     : undefined;
  const bdrClr  = isFumayo ? "var(--fb-border)"   : isKawaii ? "var(--kw-border)"   : isTropical ? "var(--tr-border)"   : isPixel ? "var(--px-border)"   : isGlobe ? "color-mix(in srgb, var(--gl-border) 40%, transparent)" : isMap ? "var(--mp-border)" : isAtlas ? "var(--at-border)" : undefined;
  const mintClr = isFumayo ? "var(--fb-mint)"     : isKawaii ? "var(--kw-mint)"     : isTropical ? "var(--tr-mint)"     : isPixel ? "var(--px-cyan)"     : isAtlas ? "var(--at-muted)"    : undefined;

  const pixelGrid =
    isPixel ? { backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)", backgroundSize: "24px 24px" }
    : isMap ? { backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }
    : isAtlas ? { backgroundImage: "linear-gradient(var(--at-grid) 1px,transparent 1px),linear-gradient(90deg,var(--at-grid) 1px,transparent 1px)", backgroundSize: "32px 32px" }
    : isFumayo ? { backgroundImage: "linear-gradient(var(--fb-grid) 1px,transparent 1px),linear-gradient(90deg,var(--fb-grid) 1px,transparent 1px)", backgroundSize: "26px 26px", fontFamily: "var(--fb-font)" }
    : {};

  const wrapperStyle = pageBg ? { backgroundColor: pageBg, ...pixelGrid } : undefined;

  /* ── #4: JSON-LD, Article schema ──────────────────────────────── */
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover ? [post.cover] : undefined,
    datePublished: post.date.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: companyName, url: siteUrl },
    publisher: { "@type": "Organization", name: companyName, url: siteUrl },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${slug}` },
  };

  const divider = (
    <div
      className={isOutlined ? "border-t-2 border-dashed" : "border-t border-gray-200 dark:border-gray-800"}
      style={isOutlined ? { borderColor: bdrClr } : undefined}
    />
  );

  return (
    <div
      className={`min-h-screen pt-24 ${!isOutlined ? "bg-white dark:bg-slate-950" : ""}`}
      style={wrapperStyle}
    >
      {/* #4: JSON-LD structured data */}
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back link */}
        {isOutlined ? (
          <Link
            href="/blog"
            className={`inline-flex items-center gap-1.5 mb-8 text-sm font-black transition-opacity hover:opacity-70 ${
              isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isGlobe ? "gl-pill" : isAtlas ? "at-pill" : "px-pill"
            }`}
            style={
              isKawaii   ? { background: "var(--kw-peach)", color: "var(--kw-text)" }
              : isTropical ? { background: "var(--tr-mint)",  color: "var(--tr-text)" }
              : isGlobe    ? { background: "var(--gl-sky)",   color: "var(--gl-on-sky)", borderColor: "transparent" }
              : isAtlas    ? { color: "var(--at-text)" }
              :               { background: "var(--px-cyan)", color: "var(--px-on-cyan)" }
            }>
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
            <span
              className={`inline-flex mb-4 ${isKawaii ? "kw-pill" : isTropical ? "tr-pill" : isGlobe ? "gl-pill" : isAtlas ? "at-pill" : "px-pill"}`}
              style={
                isKawaii   ? { background: "var(--kw-blush)",  color: "var(--kw-text)", transform: "rotate(-1.5deg)" }
                : isTropical ? { background: "var(--tr-peach)", color: "var(--tr-text)" }
                : isGlobe    ? { background: "var(--gl-amber)", color: "var(--gl-on-amber)", borderColor: "transparent" }
                : isAtlas    ? { color: "var(--at-subtext)" }
                :               { background: "var(--px-yellow)", color: "var(--px-on-yellow)" }
              }>
              {post.category}
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full mb-4">
              {post.category}
            </span>
          )
        )}

        {/* Title */}
        <h1
          className={`text-3xl lg:text-4xl font-black mb-4 leading-tight ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
          style={{ color: headClr, fontFamily: isPixel ? "monospace" : undefined }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div
          className={`flex flex-wrap items-center gap-4 text-sm mb-8 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`}
          style={isOutlined ? { color: subClr } : undefined}>
          {post.author && <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>}
          <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(post.date)}</span>
          {post.readTime && <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>}
        </div>

        {/* Cover image */}
        {post.cover && (
          <div
            className={`relative h-56 sm:h-80 lg:h-[480px] mb-10 overflow-hidden ${
              isGlobe ? "rounded-2xl" : isOutlined ? "border-2" : "rounded-2xl"
            }`}
            style={
              isGlobe    ? { boxShadow: "0 8px 32px var(--gl-shadow)" }
              : isOutlined ? { borderColor: bdrClr, boxShadow: `4px 4px 0 0 ${bdrClr}` }
              : undefined
            }>
            <Image src={cldOptimize(post.cover, 1200)} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Body */}
        {post.body && (
          isGlobe ? (
            <div className="gl-card p-8 prose max-w-none" style={{ background: cardBg, color: headClr }}>
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

        {/* ── #1: Share buttons ──────────────────────────────────────── */}
        <BlogShareButtons
          postTitle={post.title}
          isOutlined={isOutlined}
          isAtlas={isAtlas}
          pfx={pfx}
          headClr={headClr}
          cardBg={cardBg}
          bdrClr={bdrClr}
          subClr={subClr}
        />

        {/* ── #3: Tour CTA ───────────────────────────────────────────── */}
        {upcomingTours.length > 0 && (
          <div className="mt-14">
            {divider}
            <div className="pt-8">
              <p
                className={`text-xs uppercase tracking-widest mb-1 font-black ${!isOutlined ? "text-gray-400" : ""}`}
                style={isOutlined ? { color: subClr } : undefined}>
                Tertarik Pergi ke Sana?
              </p>
              <h2
                className={`text-xl font-black mb-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                style={isOutlined ? { color: headClr } : undefined}>
                Cek Paket Tour Kami
              </h2>
              <p
                className={`text-sm mb-6 ${!isOutlined ? "text-gray-500 dark:text-gray-400" : ""}`}
                style={isOutlined ? { color: subClr } : undefined}>
                Semua paket dirancang khusus untuk traveler Indonesia, dari visa, tiket, sampai guide lokal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {upcomingTours.map((t) => (
                  <Link key={t.id} href={`/tours/${t.slug ?? t.id}`}
                    className={`block overflow-hidden transition hover:opacity-90 ${
                      isOutlined ? "border-2" : "rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                    }`}
                    style={isOutlined ? { borderColor: bdrClr } : undefined}>
                    <div className="relative h-36">
                      {t.heroImg
                        ? <Image src={cldOptimize(t.heroImg, 480)} alt={t.title} fill className="object-cover" />
                        : <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />}
                    </div>
                    <div className="p-3" style={isOutlined ? { background: cardBg } : undefined}>
                      <p
                        className={`text-xs mb-0.5 flex items-center gap-1 ${!isOutlined ? "text-gray-400" : ""}`}
                        style={isOutlined ? { color: subClr } : undefined}>
                        <MapPin size={10} /> {t.country}{t.duration ? ` · ${t.duration}` : ""}
                      </p>
                      <p
                        className={`font-black text-sm leading-tight ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                        style={isOutlined ? { color: headClr } : undefined}>
                        {t.title}
                      </p>
                      <p
                        className={`text-lg sm:text-xl mt-1.5 font-extrabold ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                        style={isOutlined ? { color: headClr } : undefined}>
                        {formatCurrency(t.promoPrice ?? t.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/tours"
                className={`inline-flex items-center gap-1.5 text-sm font-black transition hover:opacity-70 ${
                  isOutlined ? `${pfx}-pill` : "text-blue-600 dark:text-blue-400 hover:underline"
                }`}
                style={isOutlined ? { background: mintClr, color: headClr } : undefined}>
                Lihat Semua Paket Tour →
              </Link>
            </div>
          </div>
        )}

        {/* ── #2: Related articles ───────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <div className="mt-14">
            {divider}
            <div className="pt-8">
              <h2
                className={`text-xl font-black mb-6 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                style={isOutlined ? { color: headClr } : undefined}>
                Artikel Lainnya
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`}
                    className={`block overflow-hidden transition hover:opacity-90 ${
                      isOutlined ? "border-2" : "rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                    }`}
                    style={isOutlined ? { borderColor: bdrClr } : undefined}>
                    <div className="relative h-28">
                      {rp.cover
                        ? <Image src={cldOptimize(rp.cover, 480)} alt={rp.title} fill className="object-cover" />
                        : <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />}
                    </div>
                    <div className="p-3" style={isOutlined ? { background: cardBg } : undefined}>
                      {rp.category && (
                        <p
                          className="text-xs font-black uppercase tracking-wider mb-1"
                          style={{ color: subClr ?? "#6b7280" }}>
                          {rp.category}
                        </p>
                      )}
                      <p
                        className={`font-black text-sm leading-tight line-clamp-2 ${!isOutlined ? "text-gray-900 dark:text-white" : ""}`}
                        style={isOutlined ? { color: headClr } : undefined}>
                        {rp.title}
                      </p>
                      {rp.readTime && (
                        <p
                          className="text-xs mt-1 flex items-center gap-1"
                          style={{ color: subClr ?? "#9ca3af" }}>
                          <Clock size={10} /> {rp.readTime}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
