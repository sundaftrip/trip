import Image from "next/image";
import Link from "./PreserveScrollLink";
import { cldOptimize, formatDate } from "@/lib/utils";
import styles from "./CleanBlog.module.css";

export type CleanBlogPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  cover?: string | null;
  category?: string | null;
  readTime?: string | null;
  date: Date | string;
};

/** Journal card in the document format: photo, green category, bold title. */
export default function CleanBlogCard({
  post,
  headingLevel = 2,
  sizes = "(max-width: 700px) 100vw, (max-width: 900px) 50vw, 33vw",
  priority = false,
  reveal = true,
}: {
  post: CleanBlogPost;
  headingLevel?: 2 | 3;
  sizes?: string;
  priority?: boolean;
  /** Fade in while scrolling (ScrollReveal on the page root). */
  reveal?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const category = post.category?.trim() ?? "";
  const date = new Date(post.date);

  return (
    <article
      className={styles.card}
      data-blog-category={category}
      data-reveal={reveal ? "" : undefined}
    >
      <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
        <div className={styles.cardImage}>
          {post.cover ? (
            <Image
              src={cldOptimize(post.cover, 900)}
              alt=""
              fill
              sizes={sizes}
              priority={priority}
              className={styles.cardPhoto}
            />
          ) : null}
        </div>
        <div className={styles.cardBody}>
          {category && <p className={styles.cardEyebrow}>{category}</p>}
          <Heading className={styles.cardTitle}>{post.title}</Heading>
          {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
          <p className={styles.cardMeta}>
            <time dateTime={date.toISOString()}>{formatDate(date)}</time>
            {post.readTime && <span>{post.readTime}</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}
