"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./CleanSite.module.css";

type Review = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
};

export default function CleanReviews({ items }: { items: Review[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [scrollState, setScrollState] = useState({
    canMoveBack: false,
    canMoveForward: items.length > 1,
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const trackElement = element;

    function updateScrollState() {
      const maxScrollLeft = trackElement.scrollWidth - trackElement.clientWidth;
      const nextState = {
        canMoveBack: trackElement.scrollLeft > 2,
        canMoveForward: trackElement.scrollLeft < maxScrollLeft - 2,
      };

      setScrollState((currentState) =>
        currentState.canMoveBack === nextState.canMoveBack &&
        currentState.canMoveForward === nextState.canMoveForward
          ? currentState
          : nextState,
      );
    }

    updateScrollState();
    trackElement.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(trackElement);

    return () => {
      trackElement.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;

    const firstSlide = element.children.item(0) as HTMLElement | null;
    const secondSlide = element.children.item(1) as HTMLElement | null;
    const step =
      firstSlide && secondSlide
        ? secondSlide.offsetLeft - firstSlide.offsetLeft
        : element.clientWidth;

    element.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  if (!items.length) return null;

  return (
    <section className={`${styles.section} ${styles.review}`} aria-labelledby="review-title">
      <div className={styles.shell}>
        <div className={styles.reviewHeading}>
          <div>
            <p className={styles.reviewKicker}>Kata peserta, apa adanya</p>
            <h2 id="review-title">Cerita dari perjalanan mereka</h2>
          </div>
          {items.length > 1 ? (
            <div className={styles.reviewControls}>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-controls="testimonial-track"
                aria-label="Testimoni sebelumnya"
                disabled={!scrollState.canMoveBack}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-controls="testimonial-track"
                aria-label="Testimoni berikutnya"
                disabled={!scrollState.canMoveForward}
              >
                →
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div
        id="testimonial-track"
        ref={track}
        className={styles.reviewTrack}
        tabIndex={0}
        aria-label="Testimoni peserta Sundaf Trip"
      >
        {items.map((item) => {
          const canCollapse = item.content.length > 180;
          const isExpanded = expandedReview === item.id;
          const quoteId = `testimonial-quote-${item.id}`;

          return (
            <article className={styles.reviewSlide} key={item.id}>
              <div>
                <p className={styles.reviewMark} aria-hidden="true">“</p>
                <blockquote
                  id={quoteId}
                  className={canCollapse && !isExpanded ? styles.reviewQuoteCollapsed : undefined}
                >
                  {item.content}
                </blockquote>
                {canCollapse ? (
                  <button
                    type="button"
                    className={styles.reviewToggle}
                    aria-controls={quoteId}
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedReview(isExpanded ? null : item.id)}
                  >
                    {isExpanded ? "Ringkas" : "Baca lengkap"}
                  </button>
                ) : null}
              </div>
              <div className={styles.reviewPerson}>
                <strong>{item.name}</strong>
                <span>{item.role || "Peserta Sundaf Trip"} · Rating {item.rating}/5</span>
              </div>
            </article>
          );
        })}
      </div>
      <div className={`${styles.shell} ${styles.reviewFooter}`}>
        <span>{items.length} testimoni terpilih</span>
        <Link href="/reviews">Baca seluruh review →</Link>
      </div>
    </section>
  );
}
