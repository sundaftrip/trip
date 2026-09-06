import Link from "../PreserveScrollLink";
import { ArrowRight, Star } from "lucide-react";
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
  if (!items.length) return null;

  return (
    <section className={`${styles.section} ${styles.reviewSection}`} aria-labelledby="stories-title">
      <div className={styles.shell}>
        <div className={styles.reviewHeading}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>CERITA PESERTA</p>
            <h2 id="stories-title">Ulasan peserta</h2>
            <p>Pengalaman peserta yang telah bepergian bersama Sundaf Trip.</p>
          </div>
        </div>

        <div
          className={styles.reviewRail}
          role="region"
          aria-roledescription="carousel"
          aria-label="Cerita peserta Sundaf Trip. Geser untuk melihat cerita berikutnya."
          tabIndex={0}
        >
          {items.map((item, index) => {
            const date = testimonialDate(item.date);
            const validRating = item.rating >= 1 && item.rating <= 5;

            return (
              <article
                className={styles.reviewCard}
                key={item.id}
              >
                <span className="sr-only">
                  Cerita {index + 1} dari {items.length}: <span data-no-translate translate="no">{item.name}</span>
                </span>
                <div className={styles.reviewTopline}>
                  {validRating ? (
                    <span
                      className={styles.reviewRating}
                      role="img"
                      aria-label={`Rating ${item.rating} dari 5`}
                    >
                      {Array.from({ length: 5 }, (_, starIndex) => (
                        <Star
                          aria-hidden="true"
                          data-filled={starIndex < Math.round(item.rating)}
                          key={starIndex}
                        />
                      ))}
                    </span>
                  ) : (
                    <span />
                  )}
                </div>

                <div className={styles.reviewBody}>
                  <blockquote className={styles.reviewExcerpt}>
                    “{item.content}”
                  </blockquote>
                  <Link
                    className={styles.reviewMore}
                    href="/reviews"
                    aria-label={`Lihat selengkapnya ulasan dari ${item.name}`}
                  >
                    Lihat selengkapnya
                  </Link>
                </div>

                <footer className={styles.reviewer}>
                  <span className={styles.reviewerAvatar} aria-hidden="true" data-no-translate translate="no">
                    {initials(item.name)}
                  </span>
                  <span>
                    <strong data-no-translate translate="no">{item.name}</strong>
                    <small>
                      {item.role || "Peserta Sundaf Trip"}
                      {date ? <> · {date}</> : null}
                    </small>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>

        <Link className={styles.reviewLink} href="/reviews">
          Baca semua cerita peserta <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
