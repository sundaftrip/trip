"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./RussiaServices.module.css";

export default function RussiaServiceGrid({ children }: { children: ReactNode }) {
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const update = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    update();
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <div id="russia-service-grid" className={styles.serviceGrid} data-page-hidden={pageHidden ? "true" : undefined}>
      {children}
    </div>
  );
}
