"use client";

import { useEffect, useRef, useState } from "react";
import { trackSundafEvent } from "@/lib/analytics-events";
import styles from "./TourDetailInteractive.module.css";

export type TourDetailTab = {
  id: string;
  label: string;
};

export default function TourDetailTabs({
  tabs,
  tourId,
}: {
  tabs: TourDetailTab[];
  tourId: string;
}) {
  const [activeId, setActiveId] = useState(() => {
    const hashId = typeof window === "undefined" ? "" : window.location.hash.slice(1);
    return tabs.some((tab) => tab.id === hashId) ? hashId : tabs[0]?.id || "";
  });
  const navigationIntentRef = useRef<string | null>(null);
  const navigationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    trackSundafEvent("tour_view", { tour_id: tourId });
  }, [tourId]);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const pendingId = navigationIntentRef.current;
        if (pendingId) {
          const pendingEntry = entries.find((entry) => entry.target.id === pendingId);
          if (pendingEntry?.isIntersecting) {
            navigationIntentRef.current = null;
            setActiveId(pendingId);
          }
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-128px 0px -62% 0px", threshold: [0, 0.15, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [tabs]);

  useEffect(() => () => {
    if (navigationTimeoutRef.current) window.clearTimeout(navigationTimeoutRef.current);
  }, []);

  function navigateTo(id: string, label: string) {
    const section = document.getElementById(id);
    if (!section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (navigationTimeoutRef.current) window.clearTimeout(navigationTimeoutRef.current);
    navigationIntentRef.current = id;
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    navigationTimeoutRef.current = window.setTimeout(() => {
      if (navigationIntentRef.current === id) navigationIntentRef.current = null;
    }, reduceMotion ? 0 : 900);
    trackSundafEvent("tour_tab_click", { tab: label });
  }

  return (
    <nav className={styles.tabBar} aria-label="Bagian detail perjalanan">
      <div>
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
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
