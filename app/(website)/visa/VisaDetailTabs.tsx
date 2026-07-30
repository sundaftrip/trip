"use client";

import { useEffect, useState } from "react";

import styles from "./VisaPages.module.css";

const TABS = [
  { id: "overview", label: "Ringkasan" },
  { id: "eligibility", label: "Kelayakan" },
  { id: "dokumen", label: "Dokumen" },
  { id: "layanan", label: "Harga" },
  { id: "protection", label: "Visa Protection" },
  { id: "proses", label: "Proses" },
  { id: "faq", label: "FAQ" },
] as const;

export default function VisaDetailTabs() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);

  useEffect(() => {
    const sections = TABS.map((tab) => document.getElementById(tab.id)).filter(
      (section): section is HTMLElement => Boolean(section),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-138px 0px -62% 0px", threshold: [0, 0.15, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function navigateTo(id: string) {
    const section = document.getElementById(id);
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }

  return (
    <nav className={styles.detailNav} aria-label="Bagian informasi visa">
      <div className={styles.shell}>
        <ul className={styles.detailNavList}>
          {TABS.map((tab) => (
            <li key={tab.id}>
              <a
                href={`#${tab.id}`}
                className={styles.detailNavLink}
                aria-current={activeId === tab.id ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo(tab.id);
                }}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
