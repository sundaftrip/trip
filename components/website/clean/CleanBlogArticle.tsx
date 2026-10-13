import Image from "next/image";
import Link from "./PreserveScrollLink";
import { ArrowRight } from "lucide-react";
import BlogArticleToc, {
  type BlogArticleHeading,
} from "@/app/(website)/blog/BlogArticleToc";
import BlogShareButtons from "@/components/website/BlogShareButtons";
import CleanTourCard, { type CleanTour } from "./CleanTourCard";
import CleanBlogCard, { type CleanBlogPost } from "./CleanBlogCard";
import ScrollReveal from "./ScrollReveal";
import { cldOptimize, formatDate } from "@/lib/utils";
import doc from "./DocFormat.module.css";
import styles from "./CleanBlog.module.css";

type ArticlePost = {
  title: string;
  category: string | null;
  author: string | null;
  readTime: string | null;
  cover: string | null;
  date: Date;
};

/** Journal article in the Sundaf DMC document format (atlas theme). */
export default function CleanBlogArticle({
  post,
  bodyHtml,
  headings,
  tours,
  related,
}: {
  post: ArticlePost;
  bodyHtml: string;
  headings: BlogArticleHeading[];
  tours: CleanTour[];
  related: CleanBlogPost[];
}) {
  const category = post.category?.trim();
  const showToc = headings.length >= 3;

  return (
    <div className={styles.page} id="blog-article">
      <ScrollReveal rootId="blog-article" />
      <article className={styles.articleShell} aria-labelledby="blog-article-title">
        <header className={styles.articleHeader}>
          <p className={doc.eyebrow}>
            <Link href="/blog" className={styles.eyebrowLink}>Jurnal</Link>
            {category ? <> / {category}</> : null}
          </p>
          <h1 id="blog-article-title" className={`${doc.title} ${styles.articleTitle}`}>
            {post.title}
          </h1>
          <p className={styles.articleMeta}>
            {post.author && <span>{post.author}</span>}
            <time dateTime={post.date.toISOString()}>{formatDate(post.date)}</time>
            {post.readTime && <span>{post.readTime}</span>}
          </p>
        </header>

        {post.cover && (
          <figure className={styles.cover}>
            <Image
              src={cldOptimize(post.cover, 1600)}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1160px) 100vw, 1120px"
              className={styles.coverImage}
            />
          </figure>
        )}

        <div className={`${styles.layout} ${showToc ? styles.layoutWithToc : ""}`}>
          {showToc && (
            <div className={styles.aside}>
              <BlogArticleToc headings={headings} appearance="doc" />
            </div>
          )}
          <div className={styles.main}>
            {bodyHtml && (
              <div className={styles.body} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            )}
            <BlogShareButtons postTitle={post.title} isOutlined isAtlas pfx="at" variant="doc" />
          </div>
        </div>
      </article>

      {tours.length > 0 && (
        <section
          className={`${styles.articleShell} ${styles.afterSection}`}
          aria-labelledby="blog-tours-title"
          data-reveal
        >
          <h2 id="blog-tours-title" className={doc.tag}>Tertarik pergi ke sana?</h2>
          <p className={styles.note}>
            Semua paket dirancang khusus untuk traveler Indonesia, dari visa, tiket, sampai guide lokal.
          </p>
          <div className={styles.tourGrid}>
            {tours.map((tour) => <CleanTourCard key={tour.id} tour={tour} compact catalog />)}
            <div className={`${doc.boxSage} ${styles.tourMore}`}>
              <p className={doc.subhead}>Jadwal lainnya</p>
              <p>Lihat jadwal dan biaya semua open trip, atau rancang land tour privat bersama tim kami.</p>
              <Link href="/tours" className={doc.button}>
                Lihat semua paket tour <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section
          className={`${styles.articleShell} ${styles.afterSection}`}
          aria-labelledby="blog-related-title"
          data-reveal
        >
          <h2 id="blog-related-title" className={doc.tag}>Artikel lainnya</h2>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <CleanBlogCard
                key={item.slug}
                post={item}
                headingLevel={3}
                reveal={false}
                sizes="(max-width: 700px) 100vw, (max-width: 900px) 50vw, 360px"
              />
            ))}
          </div>
        </section>
      )}

      <div className={styles.articleEnd} aria-hidden="true" />
    </div>
  );
}
