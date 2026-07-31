import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { getTourProductImage } from "@/lib/tour-product-images";
import { cldThumb, formatCurrency } from "@/lib/utils";
import type { PublicTourState } from "@/lib/tour-order";
import { getCommerceTourStatus } from "@/lib/tour-commerce";
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
  createdAt?: string | null;
  duration: string | null;
  heroImg: string | null;
  badge: string | null;
  status: string;
  pinned?: boolean | null;
  mandatoryTotal?: number;
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
  const status = getCommerceTourStatus(tour);
  if (status === "completed") return "Trip selesai";
  if (status === "sold_out") return "Penuh";
  if (status === "waitlist") return "Daftar tunggu";
  if (status === "confirmed") return "Pasti berangkat";
  if (status === "last_seats") return "Kursi terakhir";
  if (status === "flexible") return "Tanggal fleksibel";
  if (tour.seatsLeft > 0) return "Tersedia";
  return tour.badge || "Cek ketersediaan";
}

export default function CleanTourCard({
  tour,
  compact = false,
  campaignQuery = "",
}: {
  tour: CleanTour;
  compact?: boolean;
  campaignQuery?: string;
}) {
  const baseHref = `/tours/${tour.slug || tour.id}`;
  const href = campaignQuery ? `${baseHref}?${campaignQuery}` : baseHref;
  const commerceStatus = getCommerceTourStatus(tour);
  const unavailable = commerceStatus === "completed";
  const image = cldThumb(getTourProductImage(tour), 900, compact ? 520 : 700);
  const mandatoryTotal = Math.max(0, Number(tour.mandatoryTotal) || 0);
  const basePrice = Number(tour.promoPrice ?? tour.price);
  const price = basePrice > 0 ? basePrice + mandatoryTotal : 0;

  return (
    <article
      className={`${styles.tourCard} ${compact ? styles.tourCardCompact : ""} ${unavailable ? styles.unavailable : ""}`}
      data-trip-state={tour.state}
      data-commerce-status={commerceStatus}
    >
      <Link
        className={styles.tourPhoto}
        href={href}
        aria-label={`${tour.title}, ${statusLabel(tour)}`}
        data-analytics-event="tour_card_click"
        data-tour-id={tour.id}
      >
        <Image
          src={image}
          alt={tour.title}
          fill
          sizes="(max-width: 370px) calc(100vw - 24px), (max-width: 700px) calc(50vw - 17px), (max-width: 1100px) 50vw, 33vw"
          className={styles.tourImage}
        />
        <span className={styles.tourPhotoShade} aria-hidden="true" />
        <span className={styles.tourStatus}>{statusLabel(tour)}</span>
        <h3 className={styles.tourTitle}>{tour.title}</h3>
      </Link>

      <div className={styles.tourBody}>
        <div className={styles.tourFacts}>
          <div className={styles.tourFact}><MapPin size={16} aria-hidden="true" /><span>{tour.cityHighlight || tour.country}</span></div>
        </div>
        <div className={styles.tourMeta}>
          <Calendar size={16} aria-hidden="true" />
          <span>
            {tour.duration || "Durasi fleksibel"}
            <small>{formatTripDate(tour.tripDate)}</small>
          </span>
        </div>
        <div className={styles.priceRow}>
          <div>
            <span className={styles.priceLabel}>
              {price > 0 ? (mandatoryTotal > 0 ? "Total wajib" : "Harga paket") : "Harga"}
            </span>
            <span className={styles.price}>
              {price > 0 ? (
                <>
                  {formatCurrency(price)} <small>/orang</small>
                </>
              ) : (
                "Hubungi tim"
              )}
            </span>
            {mandatoryTotal > 0 ? (
              <small className={styles.priceNote}>
                Termasuk {formatCurrency(mandatoryTotal)} biaya wajib
              </small>
            ) : null}
          </div>
          <span className={styles.cardArrow} aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
}
