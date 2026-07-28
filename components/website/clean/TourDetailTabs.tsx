"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { trackSundafEvent } from "@/lib/analytics-events";
import styles from "./TourDetailInteractive.module.css";

export type TourDetailTab = {
  id: string;
  label: string;
};

type TabIndicatorStyle = CSSProperties & {
  "--tab-pill-left": string;
  "--tab-pill-width": string;
  "--tab-pill-opacity": string;
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
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    trackSundafEvent("tour_view", { tour_id: tourId });
  }, [tourId]);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      () => {
        if (navigationIntentRef.current) return;

        const anchorLine = 132;
        const current = sections
          .map((section) => ({ section, rect: section.getBoundingClientRect() }))
          .filter(({ rect }) => rect.bottom > anchorLine && rect.top < window.innerHeight)
          .sort((a, b) => Math.abs(a.rect.top - anchorLine) - Math.abs(b.rect.top - anchorLine))[0];

        if (current?.section.id) setActiveId(current.section.id);
      },
      { rootMargin: "-128px 0px -62% 0px", threshold: [0, 0.15, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [tabs]);

  useEffect(() => () => {
    if (navigationTimeoutRef.current) window.clearTimeout(navigationTimeoutRef.current);
  }, []);

  useEffect(() => {
    const list = tabListRef.current;
    const activeTab = tabRefs.current[activeId];
    if (!list || !activeTab) return;

    const syncIndicator = () => {
      setIndicator({ left: activeTab.offsetLeft, width: activeTab.offsetWidth, visible: true });
    };

    syncIndicator();
    const resizeObserver = new ResizeObserver(syncIndicator);
    resizeObserver.observe(list);
    return () => resizeObserver.disconnect();
  }, [activeId]);

  function navigateTo(id: string, label: string) {
    const section = document.getElementById(id);
    if (!section) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (navigationTimeoutRef.current) window.clearTimeout(navigationTimeoutRef.current);
    navigationIntentRef.current = id;
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);

    const releaseIntent = () => {
      if (navigationIntentRef.current !== id) return;
      navigationIntentRef.current = null;
      setActiveId(id);
    };
    if (reduceMotion) {
      releaseIntent();
    } else {
      window.addEventListener("scrollend", releaseIntent, { once: true });
      navigationTimeoutRef.current = window.setTimeout(releaseIntent, 1500);
    }
    trackSundafEvent("tour_tab_click", { tab: label });
  }

  return (
    <nav className={styles.tabBar} aria-label="Bagian detail perjalanan">
      <div
        ref={tabListRef}
        style={{
          "--tab-pill-left": `${indicator.left}px`,
          "--tab-pill-width": `${indicator.width}px`,
          "--tab-pill-opacity": indicator.visible ? "1" : "0",
        } as TabIndicatorStyle}
      >
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            ref={(element) => { tabRefs.current[tab.id] = element; }}
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
