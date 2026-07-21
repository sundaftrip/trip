"use client";

import { useRef } from "react";
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

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: element.clientWidth * 0.78 * direction, behavior: "smooth" });
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
          <div className={styles.reviewControls}>
            <button type="button" onClick={() => move(-1)} aria-label="Testimoni sebelumnya">←</button>
            <button type="button" onClick={() => move(1)} aria-label="Testimoni berikutnya">→</button>
          </div>
        </div>
      </div>
      <div ref={track} className={styles.reviewTrack} tabIndex={0} aria-label="Testimoni peserta Sundaf Trip">
        {items.map((item) => (
          <article className={styles.reviewSlide} key={item.id}>
            <div><p className={styles.reviewMark} aria-hidden="true">“</p><blockquote>{item.content}</blockquote></div>
            <div className={styles.reviewPerson}>
              <strong>{item.name}</strong>
              <span>{item.role || "Peserta Sundaf Trip"} · Rating {item.rating}/5</span>
            </div>
          </article>
        ))}
      </div>
      <div className={`${styles.shell} ${styles.reviewFooter}`}>
        <span>{items.length} testimoni terpilih</span>
        <Link href="/reviews">Baca seluruh review →</Link>
      </div>
    </section>
  );
}
