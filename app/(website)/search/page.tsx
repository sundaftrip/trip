/* Halaman /search?q=..., search lintas tour, blog, dan visa entry.
   Tidak hanya untuk user, juga supaya SearchAction schema valid,
   yang berpotensi memunculkan sitelinks search box di SERP Google. */
import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon, MapPin, BookOpen, FileCheck, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { visaSlug } from "@/lib/visa-slug";
import { formatCurrency, formatDate } from "@/lib/utils";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cari",
  description:
    "Cari paket tour, artikel blog, dan info visa di Sundaf Trip. Ketik destinasi, jenis perjalanan, atau topik yang ingin kamu cari.",
  alternates: { canonical: "https://sundaftrip.com/search" },
  robots: { index: false, follow: true }, // hasil pencarian tidak perlu diindex
};

type SearchResults = {
  tours: Array<{
    id: string;
    title: string;
    country: string;
    cityHighlight: string | null;
    price: number;
    promoPrice: number | null;
    tripDate: Date | null;
    heroImg: string | null;
  }>;
  blogs: Array<{
    slug: string;
    title: string;
    excerpt: string | null;
    date: Date;
  }>;
  visas: Array<{ en: string; name: string }>;
};

async function doSearch(q: string): Promise<SearchResults> {
  const term = q.trim();
  if (!term) return { tours: [], blogs: [], visas: [] };

  // Case-insensitive search across multiple fields per entity.
  const [tours, blogs, visas] = await Promise.all([
    prisma.tour.findMany({
      where: {
        AND: [
          { status: { in: ["ACTIVE", "FULL"] } },
          {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { country: { contains: term, mode: "insensitive" } },
              { cityHighlight: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true, title: true, country: true, cityHighlight: true,
        price: true, promoPrice: true, tripDate: true, heroImg: true,
      },
      orderBy: { tripDate: "asc" },
      take: 12,
    }),
    prisma.blog.findMany({
      where: {
        AND: [
          { published: true },
          {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { excerpt: { contains: term, mode: "insensitive" } },
              { body: { contains: term, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { slug: true, title: true, excerpt: true, date: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
    prisma.countryVisa.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { en: { contains: term, mode: "insensitive" } },
        ],
      },
      select: { en: true, name: true },
      orderBy: { name: "asc" },
      take: 10,
    }),
  ]);

  return { tours, blogs, visas };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 200); // sanity cap
  const { tours, blogs, visas } = await doSearch(q);
  const total = tours.length + blogs.length + visas.length;
  const hasQuery = q.trim().length > 0;

  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-950">
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Cari", url: "/search" },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ── Header + Form ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <SearchIcon size={20} style={{ color: "var(--site-accent-ink,#2d6a4f)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Pencarian
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {hasQuery ? `Hasil untuk "${q}"` : "Cari di Sundaf Trip"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xl leading-relaxed">
            {hasQuery
              ? `${total} hasil ditemukan di paket tour, artikel blog, dan info visa.`
              : "Cari paket tour, artikel blog, atau info visa berdasarkan negara, kota, atau topik."}
          </p>

          <form action="/search" method="get" className="flex items-center gap-2">
            <div className="flex-1 relative">
              <SearchIcon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Russia, aurora, visa Schengen, Murmansk..."
                aria-label="Cari di Sundaf Trip"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600"
                autoFocus={!hasQuery}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
            >
              Cari
            </button>
          </form>
        </div>

        {/* ── Empty/Initial state ── */}
        {!hasQuery && (
          <EmptyState />
        )}

        {/* ── No results ── */}
        {hasQuery && total === 0 && (
          <NoResults q={q} />
        )}

        {/* ── Tours ── */}
        {tours.length > 0 && (
          <Section
            icon={<MapPin size={16} />}
            title="Paket Tour"
            count={tours.length}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {tours.map((t) => (
                <Link
                  key={t.id}
                  href={`/tours/${t.id}`}
                  className="block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-1">
                    {t.country}
                    {t.cityHighlight ? ` · ${t.cityHighlight}` : ""}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2">
                    {t.title}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t.tripDate ? formatDate(t.tripDate) : "Tanggal menyusul"}
                    </span>
                    <span className="font-semibold" style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>
                      {formatCurrency(t.promoPrice ?? t.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* ── Blogs ── */}
        {blogs.length > 0 && (
          <Section
            icon={<BookOpen size={16} />}
            title="Artikel Blog"
            count={blogs.length}
          >
            <div className="space-y-2">
              {blogs.map((b) => (
                <Link
                  key={b.slug}
                  href={`/blog/${b.slug}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                      {formatDate(b.date)}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1">
                      {b.title}
                    </div>
                    {b.excerpt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {b.excerpt}
                      </p>
                    )}
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-gray-400 group-hover:translate-x-1 transition-transform mt-1"
                  />
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* ── Visa ── */}
        {visas.length > 0 && (
          <Section
            icon={<FileCheck size={16} />}
            title="Info Visa"
            count={visas.length}
          >
            <div className="flex flex-wrap gap-2">
              {visas.map((v) => (
                <Link
                  key={v.en}
                  href={`/visa/${visaSlug(v.en)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  {v.name}
                  <ArrowRight size={12} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  icon, title, count, children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: "var(--site-accent-ink,#2d6a4f)" }}>{icon}</span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-xs text-gray-400">({count})</span>
      </div>
      {children}
    </section>
  );
}

function EmptyState() {
  const popular = [
    "Rusia", "Murmansk", "Aurora", "Schengen", "Kazakhstan",
    "Uzbekistan", "Trans-Siberian", "visa", "tour Eropa",
  ];
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8">
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium">
        Mulai dengan kata kunci populer:
      </p>
      <div className="flex flex-wrap gap-2">
        {popular.map((t) => (
          <Link
            key={t}
            href={`/search?q=${encodeURIComponent(t)}`}
            className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NoResults({ q }: { q: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
      <SearchIcon size={32} className="mx-auto mb-3 text-gray-400" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tidak ada hasil untuk &quot;{q}&quot;
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mb-5">
        Coba kata kunci lain, atau jelajahi katalog langsung.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/tours"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white"
          style={{ background: "var(--site-accent-ink,#2d6a4f)" }}
        >
          Semua Paket Tour <ArrowRight size={12} />
        </Link>
        <Link
          href="/visa"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          Info Visa
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
        >
          Blog & Tips
        </Link>
      </div>
    </div>
  );
}
