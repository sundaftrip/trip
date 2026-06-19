export const revalidate = 300;

import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { ArrowRight, MessageSquareQuote, ShieldCheck, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = {
  title: "Review Sundaf Trip dari Traveler Indonesia",
  description:
    "Review publik Sundaf Trip dari traveler Indonesia untuk perjalanan Rusia, aurora, Asia Tengah, dan layanan visa. Data diambil dari testimonial yang dipublikasikan.",
  alternates: { canonical: `${SITE_URL}/reviews` },
};

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const getData = unstable_cache(
  async () => {
    try {
      const [themeRow, testimonials] = await Promise.all([
        prisma.companyInfo.findFirst({ where: { key: "site_theme" } }),
        prisma.testimonial.findMany({
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            name: true,
            role: true,
            content: true,
            rating: true,
            category: true,
            createdAt: true,
          },
        }),
      ]);

      const rawTheme = themeRow?.value ?? "classic";
      return {
        theme: rawTheme === "console" ? "atlas" : rawTheme,
        testimonials,
      };
    } catch {
      return { theme: "atlas", testimonials: [] };
    }
  },
  ["public-reviews-page-v1"],
  { revalidate: 300, tags: ["testimonials", "site-colors"] }
);

function categoryLabel(category: string) {
  if (category === "visa") return "Layanan visa";
  if (category === "trip") return "Perjalanan";
  return "Review";
}

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export default async function ReviewsPage() {
  const { testimonials } = await getData();
  const reviewCount = testimonials.length;
  const averageRating = reviewCount
    ? Math.round((testimonials.reduce((sum, item) => sum + Math.min(5, Math.max(1, item.rating || 5)), 0) / reviewCount) * 10) / 10
    : null;
  const categories = Array.from(new Set(testimonials.map((item) => categoryLabel(item.category))));

  const reviewsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/reviews#webpage`,
    url: `${SITE_URL}/reviews`,
    name: "Review Sundaf Trip",
    description:
      "Kumpulan review publik Sundaf Trip dari traveler Indonesia. Review bersumber dari testimonial yang dipublikasikan di situs resmi Sundaf Trip.",
    inLanguage: "id-ID",
    isPartOf: { "@id": `${SITE_URL}#website` },
    publisher: { "@id": `${SITE_URL}#organization` },
    about: { "@id": `${SITE_URL}#organization` },
    mainEntity: reviewCount
      ? {
          "@type": "ItemList",
          name: "Review publik Sundaf Trip",
          numberOfItems: reviewCount,
          itemListElement: testimonials.slice(0, 50).map((item, index) => {
            const createdAt = asDate(item.createdAt);
            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Review",
                itemReviewed: { "@id": `${SITE_URL}#organization` },
                author: { "@type": "Person", name: item.name },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: String(Math.min(5, Math.max(1, item.rating || 5))),
                  bestRating: "5",
                  worstRating: "1",
                },
                reviewBody: item.content,
                datePublished: createdAt.toISOString().slice(0, 10),
              },
            };
          }),
        }
      : undefined,
  };

  return (
    <div className="min-h-screen pt-24 at-grid-bg" style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Review", url: "/reviews" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }} />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <span className="at-pill mb-5 inline-flex text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--at-subtext)" }}>
          Review Publik
        </span>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl lg:text-6xl font-black leading-tight" style={{ color: "var(--at-text)" }}>
              Review Sundaf Trip dari Traveler Indonesia
            </h1>
            <p className="mt-6 max-w-3xl text-base lg:text-lg leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              Halaman ini mengumpulkan testimonial yang sudah dipublikasikan untuk membantu calon traveler, partner, dan mesin pencari memahami bukti sosial Sundaf Trip secara lebih terbuka.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="at-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>Total review</p>
              <p className="mt-2 text-3xl font-black" style={{ color: "var(--at-text)" }}>{reviewCount}</p>
            </div>
            <div className="at-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>Rating rata-rata</p>
              <p className="mt-2 text-3xl font-black" style={{ color: "var(--at-text)" }}>{averageRating ? `${averageRating}/5` : "-"}</p>
            </div>
            <div className="at-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--at-subtext)" }}>Kategori</p>
              <p className="mt-2 text-sm font-bold" style={{ color: "var(--at-text)" }}>
                {categories.length ? categories.join(", ") : "Belum ada"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {testimonials.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => {
              const rating = Math.min(5, Math.max(1, item.rating || 5));
              return (
                <article key={item.id} className="at-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black" style={{ color: "var(--at-text)" }}>{item.name}</p>
                      {item.role && <p className="mt-1 text-xs" style={{ color: "var(--at-subtext)" }}>{item.role}</p>}
                    </div>
                    <span className="at-pill shrink-0 text-[11px]" style={{ color: "var(--at-subtext)" }}>
                      {categoryLabel(item.category)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-1" aria-label={`Rating ${rating} dari 5`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        fill={index < rating ? "var(--site-accent)" : "none"}
                        style={{ color: "var(--site-accent)" }}
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <MessageSquareQuote size={18} className="mt-1 shrink-0" style={{ color: "var(--site-accent)" }} />
                    <p className="text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                      {item.content}
                    </p>
                  </div>

                  <p className="mt-5 text-xs" style={{ color: "var(--at-subtext)" }}>
                    Dipublikasikan {dateFmt.format(asDate(item.createdAt))}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="at-card p-8">
            <ShieldCheck size={28} style={{ color: "var(--site-accent)" }} />
            <h2 className="mt-4 text-2xl font-black" style={{ color: "var(--at-text)" }}>
              Belum ada review publik
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              Sundaf Trip belum menampilkan testimonial published di halaman ini. Review akan muncul otomatis setelah data testimonial dipublikasikan dari admin.
            </p>
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Profil resmi", href: "/sundaf-trip" },
            { label: "Media kit", href: "/media-kit" },
            { label: "Paket aktif", href: "/tours" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="at-card p-5 flex items-center justify-between gap-4 transition hover:opacity-80">
              <span className="text-sm font-black" style={{ color: "var(--at-text)" }}>{item.label}</span>
              <ArrowRight size={17} style={{ color: "var(--site-accent)" }} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
