import { List } from "lucide-react";
import StableDetails from "@/components/website/clean/StableDetails";
import styles from "./BlogSupporting.module.css";

export type BlogArticleHeading = {
  id: string;
  label: string;
  level: 2 | 3;
};

type BlogArticleTocProps = {
  headings: BlogArticleHeading[];
};

export default function BlogArticleToc({ headings }: BlogArticleTocProps) {
  if (headings.length === 0) return null;

  return (
    <aside
      className={`${styles.atlasPanel} ${styles.tocPanel}`}
      aria-label="Navigasi artikel"
    >
      <StableDetails className={styles.tocDetails} open>
        <summary className={styles.tocSummary}>
          <List className={styles.tocIcon} size={18} aria-hidden="true" />
          <span className={styles.tocHeadingGroup}>
            <span className={styles.eyebrow}>Peta bacaan</span>
            <span className={styles.tocTitle}>Dalam artikel ini</span>
          </span>
          <span className={styles.tocMeta}>{headings.length} bagian</span>
          <span className={styles.tocChevron} aria-hidden="true" />
        </summary>

        <nav className={styles.tocNav} aria-label="Daftar isi artikel">
          <ol className={styles.tocList}>
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={`${styles.tocItem} ${
                  heading.level === 3 ? styles.tocItemLevel3 : ""
                }`}
              >
                <a className={styles.tocLink} href={`#${heading.id}`}>
                  {heading.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </StableDetails>
    </aside>
  );
}
