"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./RussiaServices.module.css";

export default function RussiaServiceGrid({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const update = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    update();
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <>
      <div className={styles.motionControls}>
        <button type="button" aria-controls="russia-service-grid" onClick={() => setPaused((current) => !current)}>
          {paused ? "Putar animasi" : "Jeda animasi"}
        </button>
      </div>
      <div id="russia-service-grid" className={styles.serviceGrid} data-motion-paused={paused ? "true" : undefined} data-page-hidden={pageHidden ? "true" : undefined}>
        {children}
      </div>
    </>
  );
}
