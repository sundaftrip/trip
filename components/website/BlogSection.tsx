import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate, cldOptimize } from "@/lib/utils";
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

  /* ── FUMAYO ── */
  if (theme === "fumayo") return (
    <section className="fb-page py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12 flex-wrap gap-3">
            <div>
              <span className="fb-pill mb-3 inline-flex" style={{ background: "var(--fb-pink)", color: "#1a1a1a" }}>✦ Jurnal</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--fb-ink)", fontFamily: "var(--fb-font)" }}>
                Tips &amp; <span className="fb-wave" style={{ color: "var(--fb-accent)" }}>Inspirasi</span>
              </h2>
            </div>
            <Link href="/blog" className="fb-btn-outline px-4 py-2 text-xs">Semua Artikel →</Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="block fb-card overflow-hidden group h-full">
                <div className="relative h-44 overflow-hidden" style={{ borderBottom: "2px solid var(--fb-line)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-3xl" style={{ background: "var(--fb-paper)", color: "var(--fb-line)" }}>✦</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 fb-pill" style={{ background: "var(--fb-yellow)", color: "#1a1a1a" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5" style={{ fontFamily: "var(--fb-font)" }}>
                  <h3 className="font-bold mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--fb-ink)" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--fb-subink)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--fb-subink)" }}>
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

  /* ── GLOBE ── */
  if (theme === "teri") return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="text-center mb-14">
            <span className="teri-pill mb-3 inline-flex">✦ Jurnal</span>
            <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--teri-ink)" }}>Tips &amp; Inspirasi</h2>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90} className="h-full">
              <Link href={`/blog/${post.slug}`} className="teri-card group overflow-hidden h-full flex flex-col">
                <div className="relative h-44 overflow-hidden border-b-[2.5px] shrink-0" style={{ borderColor: "var(--teri-line)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-3xl" style={{ background: "var(--teri-c2)" }}>✈️</div>}
                  {post.category && <span className="absolute top-3 left-3 teri-pill">{post.category}</span>}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-extrabold mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--teri-ink)" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--teri-sub)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px] mt-auto" style={{ color: "var(--teri-sub)" }}>
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

  if (theme === "globe") return (
    <section className="py-24 relative overflow-hidden" style={{ background: "var(--gl-bg)" }}>
      <span className="absolute top-6 right-8 text-5xl pointer-events-none select-none gl-float-1" style={{ opacity: 0.1 }}>🕌</span>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="gl-pill mb-3 inline-flex" style={{ background: "var(--gl-sky)", color: "var(--gl-on-sky)", borderColor: "transparent" }}>🗺️ Jurnal</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--gl-text)" }}>Tips &amp; Inspirasi</h2>
            </div>
            <Link href="/blog" className="gl-pill font-black" style={{ background: "var(--gl-border)", color: "#ffffff", borderColor: "transparent" }}>
              Semua Artikel →
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="block gl-card overflow-hidden group">
                <div className="relative h-44 overflow-hidden rounded-t-[18px]">
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-4xl" style={{ background: "var(--gl-sky)", opacity: 0.25 }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 gl-pill" style={{ background: "var(--gl-amber)", color: "var(--gl-on-amber)", transform: "rotate(-2deg)", borderColor: "transparent" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-black mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--gl-text)" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--gl-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--gl-subtext)" }}>
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

  /* ── ATLAS ── */
  if (theme === "atlas") return (
    <section className="py-14 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="at-pill mb-3 inline-flex" style={{ color: "var(--at-subtext)" }}>Jurnal</span>
              <h2 className="text-3xl lg:text-5xl font-bold mt-3" style={{ color: "var(--at-text)" }}>Tips &amp; Inspirasi</h2>
            </div>
            <Link href="/blog" className="at-btn px-4 py-2 text-sm" style={{ color: "var(--at-text)" }}>
              Semua Artikel <ArrowRight size={14} />
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="block at-card overflow-hidden group">
                <div className="relative h-44 overflow-hidden border-b" style={{ borderColor: "var(--at-border)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="h-full" style={{ background: "var(--at-muted)" }} />}
                  {post.category && (
                    <span className="absolute top-3 left-3 at-pill" style={{ background: "var(--at-muted)", color: "var(--at-text)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--at-text)" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--at-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--at-subtext)" }}>
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

  /* ── MAP / ATLAS ── */
  if (theme === "map") return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: "var(--mp-bg)", backgroundImage: "linear-gradient(var(--mp-grid) 1px,transparent 1px),linear-gradient(90deg,var(--mp-grid) 1px,transparent 1px)", backgroundSize: "28px 28px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="mp-pill mb-3 inline-flex" style={{ background: "var(--mp-water)", color: "var(--mp-on-water)", borderColor: "var(--mp-border)" }}>Jurnal</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>Tips &amp; Inspirasi</h2>
            </div>
            <Link href="/blog" className="mp-pill font-black" style={{ background: "var(--mp-accent)", color: "var(--mp-on-accent)", borderColor: "var(--mp-border)" }}>
              Semua Artikel →
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="block mp-card overflow-hidden group">
                <div className="relative h-44 overflow-hidden border-b-2" style={{ borderColor: "var(--mp-border)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="h-full" style={{ background: "var(--mp-water)", opacity: 0.3 }} />}
                  {post.category && (
                    <span className="absolute top-3 left-3 mp-pill" style={{ background: "var(--mp-rust)", color: "var(--mp-on-rust)", borderColor: "var(--mp-border)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-black mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--mp-text)", fontFamily: "Georgia,'Times New Roman',serif" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--mp-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--mp-subtext)" }}>
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

  /* ── KAWAII ── */
  if (theme === "kawaii") return (
    <section className="py-24" style={{ background: "var(--kw-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="kw-pill mb-3 inline-flex" style={{ background: "var(--kw-mint)", color: "var(--kw-text)" }}>✦ Jurnal</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--kw-text)" }}>Tips &amp; Inspirasi</h2>
            </div>
            <Link href="/blog" className="kw-pill font-black" style={{ background: "var(--kw-border)", color: "#ffffff" }}>
              Semua Artikel →
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="block kw-card overflow-hidden group">
                <div className="relative h-44 overflow-hidden rounded-t-[22px] border-b-2" style={{ borderColor: "var(--kw-border)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-3xl" style={{ background: "var(--kw-peach)" }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 kw-pill" style={{ background: "var(--kw-blush)", color: "var(--kw-text)", transform: "rotate(-2deg)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5" style={{ background: "var(--kw-card)" }}>
                  <h3 className="font-black mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--kw-text)" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--kw-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--kw-subtext)" }}>
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

  /* ── TROPICAL ── */
  if (theme === "tropical") return (
    <section className="py-24" style={{ background: "var(--tr-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="tr-pill mb-3 inline-flex" style={{ background: "var(--tr-grape)", color: "var(--tr-text)" }}>📰 Jurnal</span>
              <h2 className="text-3xl lg:text-5xl font-black mt-3" style={{ color: "var(--tr-text)" }}>Tips &amp; Inspirasi</h2>
            </div>
            <Link href="/blog" className="tr-pill font-black" style={{ background: "var(--site-accent)", color: "#ffffff" }}>
              Semua Artikel →
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="block tr-card overflow-hidden group">
                <div className="relative h-44 overflow-hidden rounded-t-[18px] border-b-2" style={{ borderColor: "var(--tr-border)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full text-3xl" style={{ background: "var(--tr-mint)" }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 tr-pill" style={{ background: "var(--tr-peach)", color: "var(--tr-text)", transform: "rotate(-2deg)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-5" style={{ background: "var(--tr-card)" }}>
                  <h3 className="font-black mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--tr-text)" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--tr-subtext)" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--tr-subtext)" }}>
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

  /* ── PIXEL ── */
  if (theme === "pixel") return (
    <section className="py-14 sm:py-20 lg:py-24 relative" style={{
      background: "var(--px-bg)",
      backgroundImage: "linear-gradient(var(--px-grid) 1px,transparent 1px),linear-gradient(90deg,var(--px-grid) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn>
          <div className="flex items-end justify-between mb-7 sm:mb-12 flex-wrap gap-3">
            <div>
              <span className="px-pill mb-3 inline-flex" style={{ background: "var(--px-purple)", color: "#ffffff" }}>► JURNAL</span>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mt-2 sm:mt-3" style={{ color: "var(--px-text)", fontFamily: "monospace" }}>TIPS &amp; INSPIRASI</h2>
            </div>
            <Link href="/blog" className="px-btn px-4 py-2 text-[11px] sm:text-xs" style={{ background: "var(--site-accent)", color: "#ffffff" }}>
              SEMUA ARTIKEL ►
            </Link>
          </div>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((post, i) => (
            <AnimateIn key={post.id} delay={i * 90}>
              <Link href={`/blog/${post.slug}`} className="block px-card overflow-hidden group">
                <div className="relative h-44 overflow-hidden border-b-2" style={{ borderColor: "var(--px-border)" }}>
                  {post.cover
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover" />
                    : <div className="flex items-center justify-center h-full text-3xl" style={{ background: "var(--px-cyan)", opacity: 0.3 }}>✈️</div>}
                  {post.category && (
                    <span className="absolute top-3 left-3 px-pill" style={{ background: "var(--px-yellow)", color: "var(--px-on-yellow)" }}>
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5" style={{ background: "var(--px-card)" }}>
                  <h3 className="font-black mb-2 line-clamp-2 text-[15px] leading-snug" style={{ color: "var(--px-text)" }}>{post.title}</h3>
                  {post.excerpt && <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-[10px]" style={{ color: "var(--px-subtext)", fontFamily: "monospace" }}>
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

  /* ── CLASSIC ── */
  const sectionBg = "bg-gray-50 dark:bg-gray-950";
  const headingColor = "text-gray-900 dark:text-white";
  const subColor = "text-gray-400";
  const linkColor = "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white";
  const cardBg = "bg-white dark:bg-black border-gray-100 dark:border-gray-900 hover:border-gray-300 dark:hover:border-gray-700";
  const titleColor = "text-gray-900 dark:text-white";

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
                    ? <Image src={cldOptimize(post.cover, 480)} alt={post.title} fill sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
