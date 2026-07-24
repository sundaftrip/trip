import Image from "next/image";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { getTourProductImage } from "@/lib/tour-product-images";
import { cldThumb, formatCurrency } from "@/lib/utils";
import type { PublicTourState } from "@/lib/tour-order";
import styles from "./CleanSite.module.css";

export type CleanTour = {
  id: string;
  slug: string | null;
  title: string;
  country: string;
  cityHighlight: string | null;
  price: number;
  promoPrice: number | null;
  seatsLeft: number;
  tripDate: string | null;
  duration: string | null;
  heroImg: string | null;
  badge: string | null;
  status: string;
  pinned?: boolean | null;
  state: PublicTourState;
};

function formatTripDate(value: string | null) {
  if (!value) return "Tanggal fleksibel";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function statusLabel(tour: CleanTour) {
  if (tour.state === "completed") return "Trip selesai";
  if (tour.state === "sold") return "Penuh";
  if (tour.seatsLeft > 0) return `${tour.seatsLeft} kursi tersedia`;
  return tour.badge || "Tanya ketersediaan";
}

export default function CleanTourCard({ tour, compact = false }: { tour: CleanTour; compact?: boolean }) {
  const href = `/tours/${tour.slug || tour.id}`;
  const unavailable = tour.state === "sold" || tour.state === "completed";
  const image = cldThumb(getTourProductImage(tour), 900, compact ? 520 : 700);
  const price = tour.promoPrice || tour.price;

  return (
    <article
      className={`${styles.tourCard} ${compact ? styles.tourCardCompact : ""} ${unavailable ? styles.unavailable : ""}`}
      data-trip-state={tour.state}
    >
      <Link className={styles.tourPhoto} href={href} aria-label={`${tour.title} — ${statusLabel(tour)}`}>
        <Image
          src={image}
          alt={tour.title}
          fill
          sizes={compact ? "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" : "(max-width: 760px) 100vw, 33vw"}
          className={styles.tourImage}
        />
        <span className={styles.tourStatus}>{statusLabel(tour)}</span>
      </Link>

      <div className={styles.tourBody}>
        <p className={styles.tourMeta}>
          {tour.duration || "Durasi fleksibel"} · {formatTripDate(tour.tripDate)}
        </p>
        <h3 className={styles.tourTitle}><Link href={href}>{tour.title}</Link></h3>
        <div className={styles.tourFacts}>
          <div className={styles.tourFact}><MapPin size={16} aria-hidden="true" /><span>{tour.cityHighlight || tour.country}</span></div>
          <div className={styles.tourFact}><Navigation size={16} aria-hidden="true" /><span>{tour.state === "flexible" ? "Land tour privat" : "Open trip dari Indonesia"}</span></div>
        </div>
        <div className={styles.priceRow}>
          <div>
            <span className={styles.priceLabel}>Mulai dari</span>
            <span className={styles.price}>{formatCurrency(price)} <small>/orang</small></span>
          </div>
          <span className={styles.cardArrow} aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
}
