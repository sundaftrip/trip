import Link from "next/link";
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

function withoutLongDash(value: string) {
  return value.replace(/\s*[—–]\s*/g, ", ");
}

export default function HomeReviews({ items }: { items: CleanHomeTestimonial[] }) {
  if (!items.length) return null;

  return (
    <section className={`${styles.section} ${styles.reviewSection}`} aria-labelledby="stories-title">
      <div className={styles.shell}>
        <div className={styles.reviewHeading}>
          <div className={styles.sectionHeading}>
            <h2 id="stories-title">Cerita dari yang sudah pulang</h2>
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
                  Cerita {index + 1} dari {items.length}: {item.name}
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
                    “{withoutLongDash(item.content)}”
                  </blockquote>
                  <Link
                    className={styles.reviewMore}
                    href="/reviews"
                    aria-label={`Lihat selengkapnya ulasan dari ${item.name}`}
                  >
                    Lihat selengkapnya
                    <span aria-hidden="true"> →</span>
                  </Link>
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
