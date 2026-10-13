"use client";

import { useEffect, useRef, useState } from "react";
import { trackSundafEvent } from "@/lib/analytics-events";
import styles from "./TourDetailInteractive.module.css";

export type TourDetailTab = {
  id: string;
  label: string;
  /** Shorter label for phones, so every tab fits on one row. */
  shortLabel?: string;
};

export default function TourDetailTabs({
  tabs,
  tourId,
}: {
  tabs: TourDetailTab[];
  tourId: string;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id || "");
  const rowRef = useRef<HTMLDivElement>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    trackSundafEvent("tour_view", { tour_id: tourId });
  }, [tourId]);

  // Scroll spy: the active part is the last one whose top has passed the upper
  // part of the screen; at the very bottom of the page it is the last part.
  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (lockedRef.current) return;
      const line = Math.min(window.innerHeight * 0.4, 320);
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      const scroller = document.scrollingElement || document.documentElement;
      if (window.innerHeight + window.scrollY >= scroller.scrollHeight - 2) {
        current = sections[sections.length - 1].id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [tabs]);

  // On narrow phones the row can scroll sideways: keep the active tab in view.
  useEffect(() => {
    const row = rowRef.current;
    const link = row?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!row || !link || row.scrollWidth <= row.clientWidth) return;
    const rowBox = row.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (linkBox.left >= rowBox.left && linkBox.right <= rowBox.right) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({
      left: linkBox.left + linkBox.width / 2 - (rowBox.left + rowBox.width / 2),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeId]);

  function navigateTo(id: string, label: string) {
    const section = document.getElementById(id);
    if (!section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Keep the chosen tab highlighted while the page glides to it.
    lockedRef.current = true;
    const release = () => { lockedRef.current = false; };
    window.addEventListener("scrollend", release, { once: true });
    window.setTimeout(release, 1200);
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    trackSundafEvent("tour_tab_click", { tab: label });
  }

  return (
    <nav className={styles.tabBar} aria-label="Bagian detail perjalanan">
      <div ref={rowRef}>
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            aria-current={activeId === tab.id ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigateTo(tab.id, tab.label);
            }}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabLabelShort}>{tab.shortLabel || tab.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
