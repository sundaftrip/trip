"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { CleanHomeTestimonial } from "../CleanHome";
import styles from "./CleanHome.module.css";

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("id-ID");
}

function testimonialDate(value: CleanHomeTestimonial["date"]) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : DATE_FORMATTER.format(date);
}

export default function HomeReviews({ items }: { items: CleanHomeTestimonial[] }) {
  const track = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrollState, setScrollState] = useState({
    back: false,
    forward: items.length > 1,
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;

    function update() {
      if (!element) return;
      const maximum = element.scrollWidth - element.clientWidth;
      const next = {
        back: element.scrollLeft > 3,
        forward: element.scrollLeft < maximum - 3,
      };
      setScrollState((current) =>
        current.back === next.back && current.forward === next.forward ? current : next,
      );
    }

    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);

    return () => {
      element.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, [items.length]);

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    const first = element.children.item(0) as HTMLElement | null;
    const second = element.children.item(1) as HTMLElement | null;
    const distance =
      first && second ? second.offsetLeft - first.offsetLeft : element.clientWidth * 0.88;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({
      left: distance * direction,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  if (!items.length) return null;

  return (
    <section className={`${styles.section} ${styles.reviewSection}`} aria-labelledby="stories-title">
      <div className={styles.shell}>
        <div className={styles.reviewHeading}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>CERITA PESERTA</p>
            <h2 id="stories-title">Cerita dari yang sudah pulang</h2>
          </div>
          {items.length > 1 ? (
            <div className={styles.railControls} role="group" aria-label="Navigasi cerita peserta">
              <button
                type="button"
                aria-label="Cerita sebelumnya"
                aria-controls={trackId}
                disabled={!scrollState.back}
                onClick={() => move(-1)}
              >
                <ArrowLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Cerita berikutnya"
                aria-controls={trackId}
                disabled={!scrollState.forward}
                onClick={() => move(1)}
              >
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        <div
          ref={track}
          id={trackId}
          className={styles.reviewRail}
          role="region"
          aria-roledescription="carousel"
          aria-label="Cerita peserta Sundaf Trip"
          tabIndex={0}
        >
          {items.map((item, index) => {
            const canExpand = item.content.length > 220;
            const isExpanded = expanded === item.id;
            const contentId = `participant-story-${index}`;
            const date = testimonialDate(item.date);
            const validRating = item.rating >= 1 && item.rating <= 5;

            return (
              <article
                className={styles.reviewCard}
                key={item.id}
              >
                <span className="sr-only">
                  Cerita {index + 1} dari {items.length}: {item.name}
                </span>
                <div className={styles.reviewTopline}>
                  {validRating ? (
                    <span
                      className={styles.reviewRating}
                      role="img"
                      aria-label={`Rating ${item.rating} dari 5`}
                    >
                      <Star aria-hidden="true" />
                      {item.rating}/5
                    </span>
                  ) : (
                    <span />
                  )}
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                </div>

                <div>
                  <blockquote
                    id={contentId}
                    className={canExpand && !isExpanded ? styles.reviewClamped : undefined}
                  >
                    “{item.content}”
                  </blockquote>
                  {canExpand ? (
                    <button
                      type="button"
                      className={styles.reviewMore}
                      aria-expanded={isExpanded}
                      aria-controls={contentId}
                      onClick={() => setExpanded(isExpanded ? null : item.id)}
                    >
                      {isExpanded ? "Tampilkan ringkas" : "Baca selengkapnya"}
                    </button>
                  ) : null}
                </div>

                <footer className={styles.reviewer}>
                  <span className={styles.reviewerAvatar} aria-hidden="true">
                    {initials(item.name)}
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {[item.role || "Peserta Sundaf Trip", date].filter(Boolean).join(" · ")}
                    </small>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>

        <Link className={styles.reviewLink} href="/reviews">
          Lihat semua testimoni <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
