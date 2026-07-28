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
  const filterId = useId();
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
          className={styles.filterPanel}
          aria-labelledby={`${filterId}-label`}
        >
          <div className={styles.filterControls}>
            <label
              id={`${filterId}-label`}
              htmlFor={filterId}
              className={styles.filterLabel}
            >
              Kategori artikel
            </label>
            <span className={styles.filterSelectWrap}>
              <select
                id={filterId}
                value={selectedCategory ?? ""}
                aria-controls={resultsId}
                className={styles.filterSelect}
                onChange={(event) =>
                  setSelectedCategory(event.target.value || null)
                }
              >
                <option value="">Semua kategori · {totalCount}</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name} · {category.count}
                  </option>
                ))}
              </select>
            </span>
            <p className={styles.resultCount} aria-live="polite" aria-atomic="true">
              {visibleCount} artikel
            </p>
          </div>
        </section>
      )}

      <div id={resultsId} ref={resultsRef} className={styles.filterResults}>
        {children}
      </div>
    </>
  );
}
