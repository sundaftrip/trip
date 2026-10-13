import BlogCategoryFilter, {
  type BlogCategoryOption,
} from "@/app/(website)/blog/BlogCategoryFilter";
import CleanBlogCard, { type CleanBlogPost } from "./CleanBlogCard";
import ScrollReveal from "./ScrollReveal";
import doc from "./DocFormat.module.css";
import styles from "./CleanBlog.module.css";

const LEAD_SIZES = "(max-width: 900px) 100vw, 760px";

/** Journal index in the Sundaf DMC document format (atlas theme). */
export default function CleanBlogIndex({
  posts,
  categories,
  description,
}: {
  posts: CleanBlogPost[];
  categories: BlogCategoryOption[];
  description: string;
}) {
  return (
    <div className={styles.page} id="blog-index">
      <ScrollReveal rootId="blog-index" />
      <header className={styles.hero} aria-labelledby="blog-page-title">
        <div className={`${styles.shell} ${styles.heroIntro}`}>
          <div>
            <p className={doc.eyebrow}>Jurnal / Sundaf Trip</p>
            <h1 id="blog-page-title" className={`${doc.title} ${styles.heroTitle}`}>
              Blog &amp; Tips Travel
            </h1>
          </div>
          <p className={styles.heroLede}>{description}</p>
        </div>
      </header>

      <div className={`${styles.shell} ${styles.indexBody}`}>
        {posts.length === 0 ? (
          <p className={`${doc.boxSand} ${styles.empty}`}>Belum ada artikel yang dipublish.</p>
        ) : (
          <BlogCategoryFilter
            categories={categories}
            totalCount={posts.length}
            appearance="doc"
          >
            <div className={styles.grid}>
              {posts.map((post, index) => (
                <CleanBlogCard
                  key={post.slug}
                  post={post}
                  priority={index === 0}
                  sizes={index === 0 ? LEAD_SIZES : undefined}
                />
              ))}
            </div>
          </BlogCategoryFilter>
        )}
      </div>
    </div>
  );
}
