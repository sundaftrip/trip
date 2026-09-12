"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./PageScrollControls.module.css";

export default function PageScrollControls() {
  const pathname = usePathname();
  const [position, setPosition] = useState({
    canScroll: false,
    atTop: true,
    atBottom: false,
    bookingHeight: 0,
  });

  useEffect(() => {
    let frame = 0;
    const bookingBar = document.querySelector<HTMLElement>("[data-mobile-booking-bar]");

    function updatePosition() {
      frame = 0;
      const page = document.scrollingElement ?? document.documentElement;
      const maxScroll = Math.max(0, page.scrollHeight - page.clientHeight);
      const next = {
        canScroll: maxScroll > 4,
        atTop: page.scrollTop <= 4,
        atBottom: page.scrollTop >= maxScroll - 4,
        bookingHeight: bookingBar?.getBoundingClientRect().height ?? 0,
      };
      setPosition((previous) => (
        previous.canScroll === next.canScroll
        && previous.atTop === next.atTop
        && previous.atBottom === next.atBottom
        && previous.bookingHeight === next.bookingHeight
          ? previous
          : next
      ));
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updatePosition);
    }

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);
    if (bookingBar) observer.observe(bookingBar);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [pathname]);

  function scrollToEdge(edge: "top" | "bottom") {
    const page = document.scrollingElement ?? document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: edge === "top" ? 0 : page.scrollHeight - page.clientHeight,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  return (
    <aside
      aria-label="Gulir halaman"
      data-page-scroll-controls
      className={styles.controls}
      hidden={!position.canScroll}
      style={{ "--booking-bar-height": `${position.bookingHeight}px` } as CSSProperties}
    >
      <button
        type="button"
        className={styles.button}
        aria-label="Kembali ke atas halaman"
        disabled={position.atTop}
        onClick={() => scrollToEdge("top")}
      >
        <ChevronUp size={16} strokeWidth={2.5} aria-hidden="true" />
        <span>Atas</span>
      </button>
      <button
        type="button"
        className={styles.button}
        aria-label="Ke bagian bawah halaman"
        disabled={position.atBottom}
        onClick={() => scrollToEdge("bottom")}
      >
        <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
        <span>Bawah</span>
      </button>
    </aside>
  );
}
