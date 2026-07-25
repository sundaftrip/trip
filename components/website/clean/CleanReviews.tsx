"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./CleanSite.module.css";

type Review = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

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
      <div className={`${styles.shell} ${styles.reviewLayout}`}>
        <div className={styles.reviewHeading}>
          <div>
            <p className={styles.reviewKicker}>Testimoni peserta</p>
            <h2 id="review-title">Cerita dari perjalanan mereka.</h2>
            <p className={styles.reviewIntro}>Ditulis langsung oleh peserta setelah perjalanan bersama Sundaf.</p>
          </div>
          {items.length > 1 ? (
            <div className={styles.reviewControls} role="group" aria-label="Navigasi testimoni">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-controls="testimonial-track"
                aria-label="Testimoni sebelumnya"
                disabled={!scrollState.canMoveBack}
              >
                <ArrowLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-controls="testimonial-track"
                aria-label="Testimoni berikutnya"
                disabled={!scrollState.canMoveForward}
              >
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
        <div className={styles.reviewStage}>
          <div
            id="testimonial-track"
            ref={track}
            className={styles.reviewTrack}
            tabIndex={0}
            aria-label="Testimoni peserta Sundaf Trip"
          >
            {items.map((item, index) => {
              const canCollapse = item.content.length > 180;
              const isExpanded = expandedReview === item.id;
              const quoteId = `testimonial-quote-${item.id}`;

              return (
                <article className={styles.reviewSlide} key={item.id}>
                  <div className={styles.reviewCardMeta}>
                    <span
                      className={styles.reviewRating}
                      aria-label={`Rating ${item.rating} dari 5`}
                    >
                      {item.rating.toFixed(1)} <small>/ 5</small>
                    </span>
                    <span className={styles.reviewCount} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <blockquote
                      id={quoteId}
                      className={
                        canCollapse && !isExpanded ? styles.reviewQuoteCollapsed : undefined
                      }
                    >
                      “{item.content}”
                    </blockquote>
                    {canCollapse ? (
                      <button
                        type="button"
                        className={styles.reviewToggle}
                        aria-controls={quoteId}
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedReview(isExpanded ? null : item.id)}
                      >
                        {isExpanded ? "Tampilkan ringkas" : "Baca selengkapnya"}
                      </button>
                    ) : null}
                  </div>
                  <footer className={styles.reviewPerson}>
                    <span className={styles.reviewAvatar} aria-hidden="true">
                      {getInitials(item.name)}
                    </span>
                    <span className={styles.reviewIdentity}>
                      <strong>{item.name}</strong>
                      <span>{item.role || "Peserta Sundaf Trip"}</span>
                    </span>
                  </footer>
                </article>
              );
            })}
          </div>
          <div className={styles.reviewFooter}>
            <span>{items.length} catatan perjalanan</span>
            <Link href="/reviews">
              Lihat semua testimoni <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
