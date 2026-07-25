"use client";

import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./BlogSupporting.module.css";

export type BlogCategoryOption = {
  name: string;
  count: number;
};

type BlogCategoryFilterProps = {
  categories: BlogCategoryOption[];
  totalCount: number;
  children: ReactNode;
};

export default function BlogCategoryFilter({
  categories,
  totalCount,
  children,
}: BlogCategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const resultsId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);

  const visibleCount = useMemo(() => {
    if (!selectedCategory) return totalCount;
    return categories.find((category) => category.name === selectedCategory)?.count ?? 0;
  }, [categories, selectedCategory, totalCount]);

  useEffect(() => {
    const items =
      resultsRef.current?.querySelectorAll<HTMLElement>("[data-blog-category]") ?? [];

    items.forEach((item) => {
      item.hidden =
        selectedCategory !== null &&
        item.dataset.blogCategory !== selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <>
      {categories.length > 0 && (
        <section
          className={`${styles.atlasPanel} ${styles.filterPanel}`}
          aria-labelledby="blog-category-filter-title"
        >
          <div className={styles.filterHeader}>
            <div>
              <p className={styles.eyebrow}>Indeks jurnal</p>
              <h2 id="blog-category-filter-title" className={styles.filterTitle}>
                Pilih kategori
              </h2>
            </div>
            <p className={styles.resultCount} aria-live="polite" aria-atomic="true">
              {visibleCount} artikel
            </p>
          </div>

          <div
            className={styles.filterScroller}
            role="group"
            aria-label="Filter kategori artikel"
          >
            <div className={styles.filterList}>
              <button
                type="button"
                aria-pressed={selectedCategory === null}
                aria-controls={resultsId}
                className={styles.filterLink}
                onClick={() => setSelectedCategory(null)}
              >
                Semua
                <span className={styles.filterCount} aria-hidden="true">
                  {totalCount}
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  aria-pressed={selectedCategory === category.name}
                  aria-controls={resultsId}
                  className={styles.filterLink}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                  <span className={styles.filterCount} aria-hidden="true">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div id={resultsId} ref={resultsRef} className={styles.filterResults}>
        {children}
      </div>
    </>
  );
}
