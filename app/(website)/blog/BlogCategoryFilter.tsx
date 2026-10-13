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
  /** "doc": the Sundaf DMC document format (atlas theme). */
  appearance?: "panel" | "doc";
};

const PANEL_CLASSES = {
  section: `${styles.atlasPanel} ${styles.filterPanel}`,
  header: styles.filterHeader,
  title: styles.filterTitle,
  count: styles.resultCount,
  scroller: styles.filterScroller,
  list: styles.filterList,
  chip: styles.filterLink,
  chipCount: styles.filterCount,
};

const DOC_CLASSES = {
  section: styles.docFilter,
  header: styles.docFilterHeader,
  title: styles.docFilterTitle,
  count: styles.docResultCount,
  scroller: styles.docFilterScroller,
  list: styles.docFilterList,
  chip: styles.docChip,
  chipCount: styles.docChipCount,
};

export default function BlogCategoryFilter({
  categories,
  totalCount,
  children,
  appearance = "panel",
}: BlogCategoryFilterProps) {
  const cx = appearance === "doc" ? DOC_CLASSES : PANEL_CLASSES;
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
          className={cx.section}
          aria-labelledby="blog-category-filter-title"
        >
          <div className={cx.header}>
            <div>
              {appearance === "panel" && <p className={styles.eyebrow}>Indeks jurnal</p>}
              <h2 id="blog-category-filter-title" className={cx.title}>
                Pilih kategori
              </h2>
            </div>
            <p className={cx.count} aria-live="polite" aria-atomic="true">
              {visibleCount} artikel
            </p>
          </div>

          <div
            className={cx.scroller}
            role="group"
            aria-label="Filter kategori artikel"
          >
            <div className={cx.list}>
              <button
                type="button"
                aria-pressed={selectedCategory === null}
                aria-controls={resultsId}
                className={cx.chip}
                onClick={() => setSelectedCategory(null)}
              >
                Semua
                <span className={cx.chipCount} aria-hidden="true">
                  {totalCount}
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  aria-pressed={selectedCategory === category.name}
                  aria-controls={resultsId}
                  className={cx.chip}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                  <span className={cx.chipCount} aria-hidden="true">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div
        id={resultsId}
        ref={resultsRef}
        className={styles.filterResults}
        data-filtered={selectedCategory === null ? undefined : "true"}
      >
        {children}
      </div>
    </>
  );
}
