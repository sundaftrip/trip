"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./CleanHome.module.css";

export default function HomeBenefitGrid({ children }: { children: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    const updateVisibility = () => setPageHidden(document.hidden);

    observer.observe(grid);
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <div
      ref={gridRef}
      className={styles.benefitGrid}
      data-motion-active={visible && !pageHidden ? "true" : undefined}
    >
      {children}
    </div>
  );
}
