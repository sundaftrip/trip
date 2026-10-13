import { withPageSocialMetadata } from "@/lib/site-metadata";
export const revalidate = 300;

import type { Metadata } from "next";
import Link from "@/components/website/clean/PreserveScrollLink";
import { unstable_cache } from "next/cache";
import { ArrowRight, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeJsonLd } from "@/lib/safe-json-ld";
import BreadcrumbSchema from "@/components/website/BreadcrumbSchema";
import supportStyles from "@/components/website/clean/SupportPages.module.css";
import doc from "@/components/website/clean/DocFormat.module.css";

const SITE_URL = "https://sundaftrip.com";

export const metadata: Metadata = withPageSocialMetadata({
  title: "Review Sundaf Trip dari Traveler Indonesia",
  description:
    "Review publik Sundaf Trip dari traveler Indonesia untuk perjalanan Rusia, aurora, Asia Tengah, dan layanan visa. Data diambil dari testimonial yang dipublikasikan.",
  alternates: { canonical: `${SITE_URL}/reviews` },
});

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
    <div className={`${supportStyles.atlasPage} min-h-screen`} style={{ backgroundColor: "var(--at-bg)" }}>
      <BreadcrumbSchema
        crumbs={[
          { name: "Beranda", url: "/" },
          { name: "Review", url: "/reviews" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(reviewsSchema) }} />

      <section className={supportStyles.hero} aria-labelledby="reviews-page-title">
        <p className={doc.eyebrow}>Review publik / Sundaf Trip</p>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 id="reviews-page-title" className={`${doc.title} ${supportStyles.title}`}>
              Review{" "}
              <span className={supportStyles.reviewTitleHighlight}>
                Sundaf Trip
              </span>{" "}
              dari Traveler Indonesia
            </h1>
            <p className={`${doc.lead} ${supportStyles.lede} mt-6`}>
              Halaman ini mengumpulkan testimonial yang sudah dipublikasikan untuk membantu calon traveler, partner, dan mesin pencari memahami bukti sosial Sundaf Trip secara lebih terbuka.
            </p>
          </div>

          <div className={`${supportStyles.summaryGrid} grid gap-3`}>
            <div className="at-card p-5">
              <p className={supportStyles.label}>Total review</p>
              <p className="mt-2 text-3xl font-black" style={{ color: "var(--at-text)" }}>{reviewCount}</p>
            </div>
            <div className="at-card p-5">
              <p className={supportStyles.label}>Rating rata-rata</p>
              <p className="mt-2 text-3xl font-black" style={{ color: "var(--at-text)" }}>{averageRating ? `${averageRating}/5` : "-"}</p>
            </div>
            <div className="at-card p-5">
              <p className={supportStyles.label}>Kategori</p>
              <p className="mt-2 text-sm font-bold" style={{ color: "var(--at-text)" }}>
                {categories.length ? categories.join(", ") : "Belum ada"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={supportStyles.section} aria-labelledby="published-reviews-title">
        {testimonials.length ? (
          <>
            <h2 id="published-reviews-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Review yang dipublikasikan</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((item) => {
                const rating = Math.min(5, Math.max(1, item.rating || 5));
                const createdAt = asDate(item.createdAt);
                return (
                  <article key={item.id} className={`${supportStyles.reviewCard} at-card p-5`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={supportStyles.cardTitleSmall}>{item.name}</h3>
                        {item.role && <p className="mt-1 text-xs" style={{ color: "var(--at-subtext)" }}>{item.role}</p>}
                      </div>
                      <span className="at-pill shrink-0 text-[11px]" style={{ color: "var(--at-subtext)" }}>
                        {categoryLabel(item.category)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-1" role="img" aria-label={`Rating ${rating} dari 5`}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          aria-hidden="true"
                          size={16}
                          fill={index < rating ? "#dfa04a" : "none"}
                          style={{ color: "#dfa04a" }}
                        />
                      ))}
                    </div>

                    <div className={`${supportStyles.reviewBody} mt-4`}>
                      <p className="text-[15px] leading-relaxed" style={{ color: "var(--at-subtext)" }}>
                        {item.content}
                      </p>
                    </div>

                    <p className={`${supportStyles.reviewDate} text-xs`} style={{ color: "var(--at-subtext)" }}>
                      Dipublikasikan <time dateTime={createdAt.toISOString()}>{dateFmt.format(createdAt)}</time>
                    </p>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="at-card p-8">
            <h2 id="published-reviews-title" className={doc.tag}>
              Belum ada review publik
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--at-subtext)" }}>
              Sundaf Trip belum menampilkan testimonial published di halaman ini. Review akan muncul otomatis setelah data testimonial dipublikasikan dari admin.
            </p>
          </div>
        )}
      </section>

      <section className={supportStyles.section} aria-labelledby="review-supporting-pages-title">
        <h2 id="review-supporting-pages-title" className={`${doc.tag} ${supportStyles.tagBlock}`}>Halaman pendukung</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Profil resmi", href: "/sundaf-trip" },
            { label: "Media kit", href: "/media-kit" },
            { label: "Paket aktif", href: "/tours" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="at-card p-5 flex items-center justify-between gap-4 transition hover:opacity-80">
              <span className={supportStyles.cardTitleSmall}>{item.label}</span>
              <ArrowRight aria-hidden="true" size={17} style={{ color: "var(--site-accent)" }} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
